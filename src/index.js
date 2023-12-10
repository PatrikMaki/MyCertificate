const express = require('express');
const forge = require('node-forge');
const path = require('path');
const sqlite3 = require('sqlite3');
const app = express();
app.use(express.json());
const port = 3000;
let cache = {};
let db = createDbConnection();

let i = 0;

app.get('/', function (_req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/certs', async function (req, res) {
    const params = req.body;
    const CN = params.CN;
    const O = params.O;
    const C = params.C;
    const days = params.days;
    //const generateKey = params.generateKey
    console.log(params);
    const validation = validate(CN, O, C, days);
    if (validation !== "") {
        console.log("Alert", validation);
        res.status(400).json({ "error": validation });
        return;
    }
    const id = i++;
    const { certificate, privateKey } = createCert(id, CN, O, C, days);
    cache[id] = { id: id, name: `/CN=${CN}, /O=${O}, /C=${C}`, days: days, certificate: certificate, privateKey: privateKey };
    res.status(201).json({ "success": "Certificate created" });
});

app.get('/certs', async function (_req, res) {
    console.log(cache);
    res.status(200).json(cache)
});

app.get('/certs/:id', async function (req, res) {
    console.log(req.params.id);
    res.status(200).json(cache[req.params.id])
});

app.delete('/certs/:id', async function (req, res) {
    const id = req.params.id;
    console.log(id)
    console.log(cache)
    const deleted = id in cache;
    delete cache[id];
    //TODO: check
    console.log(cache)
    if (deleted) {
        res.status(200).json({ status: "ok" });
    } else {
        res.status(400).json({ status: "not found" });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

//similar to the validate on the frontend
function validate(CN, O, C, days) {
    if (CN === "") return "Common name cannot be empty";
    if (C === "") return "A country is needed";
    if (days === "") return "validity in days must be given";
    return "";
}

//database helpers:
function createDbConnection() {
    const db = new sqlite3.Database(filepath, (error) => {
        if (error) {
            return console.error(error.message);
        }
        createTable(db);
    });
    console.log("Connection with SQLite has been established");
    return db;
}

function createTable(db) {
    db.exec(`
    CREATE TABLE certs
    (
      ID INTEGER NOT NULL,
      name   TEXT NOT NULL,
      days   INTEGER NOT NULL,
      certificate TEXT NOT NULL,
      privateKey TEXT NOT NULL
    );
  `);
}

function insertCertificate(id, name, days, certificate, privateKey) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO certs (id, name, days, certificate, privateKey) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [id, name, days, certificate, privateKey], function (err) {
            if (err) {
                reject(err);
            } else {
                console.log(`Row inserted with ID: ${id}`);
                resolve();
            }
        });
    });
}

function getCertificates() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM certs';
        db.all(sql, [], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const result = []
                rows.forEach((row) => {
                    console.log(row.name);
                    result.push(row);
                });
                resolve(result);
            }
        });
    });
}

function getCertificate(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM certs WHERE id=?';
        db.all(sql, [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const result = []
                rows.forEach((row) => {
                    console.log(row.name);
                    result.push(row);
                });
                resolve(result);
            }
        });
    });
}

function deleteCertificate(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM users WHERE id=?';
        db.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            } else {
                console.log(`Row deleted with ID: ${id}`);
                resolve();
            }
        });
    });
}


///Utility procedures for generating certificates
//based on:
//https://node-security.com/posts/certificate-generation-pure-nodejs/#generating-a-certificate-authority
function createCert(id, CN, O, C, days) {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);
    const attributes = [{
        shortName: 'C',
        value: C
    }, {
        shortName: 'O',
        value: O
    }, {
        shortName: 'CN',
        value: CN
    }];
    const cert = forge.pki.createCertificate();
    cert.publicKey = publicKey;
    cert.privateKey = privateKey;
    cert.serialNumber = id.toString(16);
    cert.validity.notBefore = getCertNotBefore();
    cert.validity.notAfter = getCertNotAfter(days);
    cert.setSubject(attributes);
    cert.setIssuer(attributes);
    cert.sign(privateKey, forge.md.sha512.create());
    const pemCert = forge.pki.certificateToPem(cert);
    const pemKey = forge.pki.privateKeyToPem(privateKey);
    return { certificate: pemCert, privateKey: pemKey };
}
function getCertNotBefore() {
    const twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
    const year = twoDaysAgo.getFullYear();
    const month = (twoDaysAgo.getMonth() + 1).toString().padStart(2, '0');
    const day = twoDaysAgo.getDate();
    return new Date(`${year}-${month}-${day} 00:00:00Z`);
}

function getCertNotAfter(days) {
    const daysLater = new Date(Date.now() + 60 * 60 * 24 * days * 1000);
    const year = daysLater.getFullYear();
    const month = (daysLater.getMonth() + 1).toString().padStart(2, '0');
    const day = daysLater.getDate();
    return new Date(`${year}-${month}-${day} 23:59:59Z`);
}