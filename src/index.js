const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
let db = {}
let i = 0;

app.get('/', function(_req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/certs', async function(_req, res) {
    const id = i++;
    db[id] =  {id: id, name: `value${id}`};
    res.status(201).json({"success":"Certificate created"});
});

app.get('/certs', async function(_req, res) {
    console.log(db);
    res.status(200).json(db)
});

app.get('/certs/:id', async function(req, res) {
    console.log(req.params.id);
    res.status(200).json(db[req.params.id])
});

app.delete('/certs/:id', async function (req, res) {
    const id = req.params.id;
    console.log(id)
    console.log(db)
    const deleted = id in db;    
    delete db[id];
    //TODO: check
    console.log(db)
    if (deleted) {
        res.status(200).json({status:"ok"});
    } else {
        res.status(400).json({status:"not found"});
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});