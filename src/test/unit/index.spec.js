const request = require('supertest');
const { app, validate, makeId } = require('../../index');

jest.mock('sqlite3', () => ({
    __esModule: true,
    ...jest.requireActual('sqlite3'),
    Database: jest.fn(),
}));

jest.mock('../../db/db', () => {
    return {
        __esModule: true,
        ...jest.requireActual('../../db/db'),
        createDbConnection: jest.fn(),
        insertCertificate: jest.fn(),
        getCertificate: jest.fn(_a => { return { certificate: "mau" } }),
        getCertificates: jest.fn(() => []),
        deleteCertificate: jest.fn(() => true),
    };
});

afterAll(async () => {
    await app.server.close();
});

describe('GET /', () => {
    it('should return status 200', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });
});

describe('POST /certs', () => {
    it('should create a certificate and return status 201', async () => {
        const response = await request(app)
            .post('/certs')
            .set("content-type", "application/json")
            .send({
                CN: 'Matti Meikäläinen',
                O: 'Yritys oy',
                C: 'FI',
                days: 30,
            });

        expect(response.status).toBe(201);
    });
});

describe('GET /certs/:id', () => {
    it('should return cert and 200', async () => {
        const response = await request(app)
            .get('/certs/0')
            .send(0);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({ "certificate": "mau" });
    });
});

describe('GET /certs', () => {
    it('should return an empty array of certificates and status 200', async () => {
        const response = await request(app).get('/certs');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual([]);
    });
});

describe('DELETE /certs/:id', () => {
    it('should delete a certificate and return status 200', async () => {
        const response = await request(app).delete('/certs/1');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({ "status": "ok" });
    });
});

describe('validate', () => {
    it('should return error message if Common Name is empty', () => {
        const result = validate('', 'Organization', 'Country', 30);
        expect(result).toBe('Common name cannot be empty');
    });

    it('should return error message if Country is empty', () => {
        const result = validate('Common Name', 'Organization', '', 30);
        expect(result).toBe('A country is needed');
    });

    it('should return error message if validity in days is empty', () => {
        const result = validate('Common Name', 'Organization', 'Country', '');
        expect(result).toBe('validity in days must be given');
    });

    it('should return error message if validity is less than 1 day', () => {
        const result = validate('Common Name', 'Organization', 'Country', 0);
        expect(result).toBe('validity must be between 1 and 365 days');
    });

    it('should return error message if validity is more than 365 days', () => {
        const result = validate('Common Name', 'Organization', 'Country', 366);
        expect(result).toBe('validity must be between 1 and 365 days');
    });

    it('should return an empty string for valid input', () => {
        const result = validate('Common Name', 'Organization', 'Country', 30);
        expect(result).toBe('');
    });
});

describe('makeId', () => {
    it('should return a string of the specified length', () => {
        const result = makeId(8);
        expect(result.length).toBe(8);
    });

    it('should return a string consisting of characters 0-9 and A-F', () => {
        const result = makeId(8);
        const validCharacters = /^[0-9A-F]+$/;
        expect(result).toMatch(validCharacters);
    });
});