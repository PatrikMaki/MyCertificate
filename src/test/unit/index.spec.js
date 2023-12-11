const request = require('supertest');
const {app} = require('../../index');


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
        getCertificate: jest.fn(_a =>  { return {certificate:"mau"} })
    };
});

afterAll(async() => {
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
        expect(response.body).toStrictEqual({"certificate": "mau"});
    });
});