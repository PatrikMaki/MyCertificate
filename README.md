# MyCertificate

- A certificate manager for my applications
- self signed X.509 certificates

## Usage

- Create certificates
- Read (list all certificates)
- Download a certificate and private key
- Delete a certificate
- View openAPI specs

## DB

- SQLite (hosted in the same container)

### Schema

- Certificates
  - ID
  - name (subject name)
  - certificate
  - PrivateKey

## Tests

### Unit test

- These don't need database as they are part of the integration tests.
- Frontend is also not unity tested, as E2E testing would be more useful.

### Integration tests

- These are needed for database testing

## Backend

- NodeJS
- Express based HTTP RESTapi
- JavaScript
- Docker with SQLite
- Bash script for starting the docker
- node-forge for certificates

## Frontend

- JavaScript
- HTML
- CSS
- basic form validation, which is also done on the backend for security
- easy to understand user interface for:
  - creating certificate
  - listing the user's certificates
  - deleting the user's certificate
  - downloading a certificate and the private key

## Swagger

- Swagger OpenAPI

## Project structure

- src contains the project
  - Dockerfile for build a Docker image
  - app.js contains the main server code
  - buildandstartdocker.sh builds and starts the server
  - buildandtestDocker.sh builds and runs the tests
  - certapi.yaml openAPI document
  - certs/certs.js has the server certificate utilities
  - db/db.js has the SQLite Database code and SQL commands
  - jest.config.js test environment setup
  - package.json contains NodeJS configuration with needed dependencies
  - public/favicon.ico website icon
  - public/index.html main frontend HTML and CSS is here
  - public/index.js main frontend logic in JavaScript
  - test/integration/database.spec.js has integration test for DB as UT is not sufficient.
  - test/unit/app.spec.js has unit tests for the functions and endpoints for main app.js
  - test/unit/certs/certs.spec.js has unit tests for the certification utilities

## How to run

- The project has been tested on an m1 Mac and X86 Linux
It can be run natively or with docker

### Docker

server:
```
cd src
bash buildandstartdocker.sh
```
Open browser and navigate to:
<http://localhost:3000>

test:
```
cd src
bash buildandtestDocker.sh
```

### natively

Install NodeJS
```
cd src
npm install
node app.js
```
Open browser and navigate to:
<http://localhost:3000>

test:
```
cd src
npm install
npm test
```

## Notes and future ideas

- shift, option, F does pretty printing in JS
- future ideas:
  - Certificate signing requests to avoid leaking private key
  - MFA and a reverse proxy with multiple users
  - Support for multiple CAs
  - performance tests with K6
