# Cattify

Build an HTTP endpoint that takes arbitrary JSON payloads, and replaces any references of the value “dog” with “cat”. The system should only handle a configurable amount of replacements and should withstand heavy traffic.

## Quickstart: Setup & run with test data

```bash
# Setup 
npm install
npm start

# In another terminal
curl -X POST http://localhost:3000/cattify \
  -H "Content-Type: application/json" \
  --data-binary @data/test-data.json
```

## How to use

* `npm start` - starts app in prod mode
* `npm test` - run unit tests
* `npm run dev:watch` - start dev server
* `npm run test:watch` - start tests in watch mode

## Configuration

Update `MAX_CATTIFY_REPLACEMENTS` in `.env` to adjust the replacement limit, then restart the service.

## API Specification

### `POST` /cattify

#### Request
```bash
curl -X POST http://localhost:3000/cattify \
  -H "Content-Type: application/json" \
  --data-binary @data/test-data.json
```

#### Response
```ts
{
  results: any // processed JSON,
  replacementsCount: number // total number of replacements
  limitReached: boolean, // replacement limit indicator
}
```

## Notes on Design

I decided to implement a basic Express API with tests written with Jest & Supertest. The maximum replacement limit is configured as an environment variable so the service can be adjusted without code changes, just a restart. Normally `.env` wouldn't be committed to the repo to avoid exposing sensitive information, but I took the liberty of including it so this example works with minimum manual configuration.

Scalability could be improved by offloading `cattify` processing to a request queue, implementing a caching for identical requests, and implementing rate limiting at the request level to mitigate denial-of-service attacks.
