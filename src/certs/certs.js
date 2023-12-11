///Utility procedures for generating certificates
//based on:
//https://node-security.com/posts/certificate-generation-pure-nodejs/#generating-a-certificate-authority
const forge = require('node-forge');

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
    cert.serialNumber = id;
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

module.exports = {
    createCert, 
    getCertNotBefore, 
    getCertNotAfter
}