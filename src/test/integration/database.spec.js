const sqlite3 = require('sqlite3');
const { createDbConnection, closeDbConnection, insertCertificate, getCertificates, getCertificate, deleteCertificate } = require('../../db/db');

const testDbPath = ':memory:';

beforeAll(() => {
  createDbConnection(testDbPath);
});

afterAll(() => {
    closeDbConnection();
});

describe('Database Integration Tests', () => {
  test('With different params and one test db', async () => {
    const certificates0 = await getCertificates();
    expect(certificates0).toHaveLength(0);
    await insertCertificate('123', '/CN=Maija Meikäläinen, /O=Firma Oy, /C=FI', 30, 'certificate', 'privateKey');
    const certificates1 = await getCertificates();
    expect(certificates1[0].ID).toBe('123');
    const certificate2 = await getCertificate('123');
    expect(certificate2.ID).toBe('123');
    await deleteCertificate('123');
    const certificates3 = await getCertificates();
    expect(certificates3).toHaveLength(0);
    const certificate4 = await getCertificate('123');
    expect(certificate4).toBe(undefined);
  });
});
