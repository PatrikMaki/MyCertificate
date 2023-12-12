const forge = require('node-forge');
const { createCert, getCertNotBefore, getCertNotAfter } = require('../../../certs/certs');

jest.mock('node-forge', () => ({
    pki: {
        rsa: {
            generateKeyPair: jest.fn(),
        },
        createCertificate: jest.fn(),
        certificateToPem: jest.fn(_a => { return "cert" }),
        privateKeyToPem: jest.fn(_a => { return "key" })
    },
    md: {
        sha512: {
            create: jest.fn(_a => { return {} }),
        },
    },
}));

const realDate = Date;
const mockDate = new Date(2023, 0, 1);
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());

afterAll(() => {
    global.Date = realDate;
});

describe('Certificate Utility Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createCert should generate a certificate', () => {
        const mockKeyPair = { privateKey: 'mockPrivateKey', publicKey: 'mockPublicKey' };
        forge.pki.rsa.generateKeyPair.mockReturnValueOnce(mockKeyPair);

        const mockCertificate = {
            publicKey: mockKeyPair.publicKey,
            privateKey: mockKeyPair.privateKey,
            serialNumber: '123',
            validity: {
                notBefore: new Date(),
                notAfter: new Date(),
            },
            setSubject: jest.fn(),
            setIssuer: jest.fn(),
            sign: jest.fn(),
        };
        forge.pki.createCertificate.mockReturnValueOnce(mockCertificate);

        const result = createCert('123', 'CommonName', 'Organization', 'Country', 30);

        expect(result).toEqual({
            certificate: expect.any(String),
            privateKey: expect.any(String),
        });
        expect(forge.pki.rsa.generateKeyPair).toHaveBeenCalledWith(2048);
        expect(forge.pki.createCertificate).toHaveBeenCalledWith();
        expect(mockCertificate.setSubject).toHaveBeenCalledWith([
            { shortName: 'C', value: 'Country' },
            { shortName: 'O', value: 'Organization' },
            { shortName: 'CN', value: 'CommonName' },
        ]);
        expect(mockCertificate.setIssuer).toHaveBeenCalledWith([
            { shortName: 'C', value: 'Country' },
            { shortName: 'O', value: 'Organization' },
            { shortName: 'CN', value: 'CommonName' },
        ]);
        expect(mockCertificate.sign).toHaveBeenCalledWith(mockKeyPair.privateKey, expect.any(Object));
    });

    test('getCertNotBefore should return a date two days ago', () => {
        const result = getCertNotBefore();

        const twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
        expect(result.toISOString()).toEqual(twoDaysAgo.toISOString());
    });

    test('getCertNotAfter should return a date X days later', () => {
        const result = getCertNotAfter(30);

        const daysLater = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
        expect(result.toISOString()).toEqual(daysLater.toISOString());
    });
});
