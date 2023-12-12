const sqlite3 = require('sqlite3');
let db;

function createDbConnection(dbName = "certs.db") {
    db = new sqlite3.Database(dbName, (error) => {
        if (error) {
            return console.error(error.message);
        }
        createTable(db);
    });
    console.log("Connection with SQLite has been established");
}

function closeDbConnection() {
    if (!db) {
        db.close();
        db = null;
    }
}

function createTable(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS certs
    (
      ID TEXT NOT NULL,
      name TEXT NOT NULL,
      days INTEGER NOT NULL,
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
                    //console.log(row.id);
                    result.push(row);
                });
                resolve(result);
            }
        });
    });
}

function getCertificate(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM certs WHERE id = ?';
        db.get(sql, [id], function (err, row) {
            if (err) {
                reject(err);
            } else {
                //console.log(row.id);
                resolve(row);
            }
        });
    });
}

function deleteCertificate(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM certs WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            } else {
                console.log(`Row deleted with ID: ${id}`);
                resolve(true);
            }
        });
    });
}

module.exports = {
    createDbConnection,
    closeDbConnection, 
    createTable, 
    insertCertificate, 
    getCertificates, 
    getCertificate, 
    deleteCertificate, 
}