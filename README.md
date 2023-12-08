# MyCertificate

- A certificate manager for my applications
- X.509

## Usage

- (creating a user)
- (logging in)
- Create certificates
- Read (list all certificates)
- Delete a certificate

## DB

- SQLite (hosted in the same container)

### Schema

- Certificates
  - ID
  - userID
  - issuerID
  - certificate
  - PrivateKey (optional)

- Users
  - ID
  - hashed PIN

- issuer
  - ID
  - Certificate
  - SerialNumber
  - PrivateKey

### SQL command

TODO: Certificate operations:

- Insert
- Select
- Delete
User:
- Insert

## tests

### Unit test

- these don't database as they are part of the integration tests.

### Integration tests

- these are needed for database testing

### performance tests

- these for identifying bottlenecks

## Backend

- NodeJS
- Express based HTTP(S) RESTapi
- JavaScript
- Docker with SQLite
- Bash script for starting the docker
- Bash start script for initializing database

## Frontend

- JavaScript
- HTML
- CSS
- basic form validation, which is also done on the backend for security
- easy to understand user interface for:
  - creating the user
  - logging in
  - creating certificate and optionally saving the private Key
  - listing the user's certificates
  - deleting the user's certificate

- optional:
  - Certificate signing requests to avoid leaking private key
  - MFA and a reverse proxy
