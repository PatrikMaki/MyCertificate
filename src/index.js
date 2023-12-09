const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
let db = new Map();
let i = 0;

app.get('/', function(_req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/certs', async function(_req, res) {
    db.set(i++, `value${i+2}`);
    res.status(201).json({"success":"Certificate created"});
});

app.get('/certs', async function(_req, res) {
    console.log(db);
    res.status(200).json({"success": Object.fromEntries(db)})
});

app.delete('/certs/:id', async function (req, res) {
    const id = Number(req.params.id);
    console.log(id)
    console.log(db)
    const deleted = db.delete(id);
    console.log(deleted)
    console.log(db)
    if (deleted) {
        res.status(204).json({});
    } else {
        res.status(400).json({});
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});