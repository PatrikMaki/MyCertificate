const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('yaml');
const {
    createDbConnection,
    insertCertificate,
    getCertificates,
    getCertificate,
    deleteCertificate } = require('./db/db');
const {
    createCert
} = require('./certs/certs');
createDbConnection();
const swaggerFile = fs.readFileSync('./certapi.yaml', 'utf8')
const swaggerDocument = yaml.parse(swaggerFile)
const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(favicon(__dirname + '/public/favicon.ico'));
const port = 3000;

let i = 0;

app.get('/', function (_req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/index.js', function (req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, 'public/index.js'));
});

app.get('/favicon.js', function (req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, 'public/index.js'));
});

app.post('/certs', async function (req, res) {
    const params = req.body;
    const CN = params.CN;
    const O = params.O;
    const C = params.C;
    const days = params.days;
    const validation = validate(CN, O, C, days);
    if (validation !== "") {
        console.log("Alert", validation);
        res.status(400).json({ "error": validation });
        return;
    }
    const id = makeId(8);
    const { certificate, privateKey } = createCert(id, CN, O, C, days);
    await insertCertificate(id, `/CN=${CN}, /O=${O}, /C=${C}`, days, certificate, privateKey);
    res.status(201).json({ "success": "Certificate created" });
});

app.get('/certs', async function (_req, res) {
    const certs = await getCertificates();
    res.status(200).json(certs)
});

app.get('/certs/:id', async function (req, res) {
    const certificate = await getCertificate(req.params.id);
    res.status(200).json(certificate);
});

app.delete('/certs/:id', async function (req, res) {
    const id = req.params.id;
    const deleted = await deleteCertificate(id);
    if (deleted) {
        res.status(200).json({ status: "ok" });
    } else {
        res.status(400).json({ status: "not found" });
    }
})

app.server = app.listen(port, () => {
    console.log(`My Certification app listening to ${port}`);
});

//helpers
function validate(CN, O, C, days) {
    if (CN === "") return "Common name cannot be empty";
    if (C === "") return "A country is needed";
    if (days === "") return "validity in days must be given";
    if (Number(days) < 1 || Number(days) > 365) return "validity must be between 1 and 365 days"
    return "";
}
function makeId(length) {
    var result = '';
    var characters = '0123456789ABCDEF';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    app,
    validate,
    makeId
}
