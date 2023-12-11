const sqlite3 = require('sqlite3');
const { createDatabase, insertCertificate, getCertificates, deleteCertificate } = require('./app'); // Update the path accordingly

const testDbPath = ':memory:';
let testDb;

beforeAll(() => {
  testDb = new sqlite3.Database(testDbPath);
  createDatabase(testDb);
});

afterAll((done) => {
  testDb.close(done);
});

describe('Database Integration Tests', () => {
  test('insertCertificate and getCertificates', async () => {
    await insertCertificate('123', '/CN=Maija Meikäläinen, /O=Firma Oy, /C=FI', 30, 'certificate', 'privateKey');
    const certificates = await getCertificates(testDb);
    expect(certificates).toHaveLength(1);
    expect(certificates[0].id).toBe('123');
  });

  test('deleteCertificate', async () => {
    await insertCertificate('456', '/CN=Maija Meikäläinen, /O=Firma Oy, /C=FI', 30, 'certificate', 'privateKey');
    await deleteCertificate('456', testDb);
    const certificates = await getCertificates(testDb);
    expect(certificates).toHaveLength(0);
  });
});
