# Tech Lead Technical Test

Build an HTTP endpoint that takes arbitrary JSON payloads, and replaces any references of the value “dog” with “cat”. The system should only handle a configurable amount of replacements and should withstand heavy traffic.

## Setup

`npm install`

## Run & Test

`npm start`
`npm test`

### POST data using curl

Run `npm start` then the following curl command: 
```bash
curl -X POST http://localhost:3000/cattify \
  -H "Content-Type: application/json" \
  --data-binary @data/test-data.json
```

### Dev
`npm run dev:watch`
`npm run test:watch`

## Spec

#### `POST` /cattify

Input
```bash
curl -X POST http://localhost:3000/cattify \
  -H "Content-Type: application/json" \
  --data-binary @data/test-data.json
```

Output
```js
{
  results: {} // processed JSON,
  replacementsCount: 50 // total number of replacements
  limitReached: true, // 
}
