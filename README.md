# Tech Lead Technical Test

Build an HTTP endpoint that takes arbitrary JSON payloads, and replaces any references of the value “dog” with “cat”. The system should only handle a configurable amount of replacements and should withstand heavy traffic.

## Setup

`npm install`

## Run & Test

* `npm start` - starts app in prod mode
* `npm test` - run unit tests

## Configuration

Update `MAX_CATTIFY_REPLACEMENTS` in `.env` to adjust the replacement limit.

### POST data using curl

Run `npm start` then the following curl command: 
```bash
curl -X POST http://localhost:3000/cattify \
  -H "Content-Type: application/json" \
  --data-binary @data/test-data.json
```

### Dev
* `npm run dev:watch` - start dev server
* `npm run test:watch` - start tests in watch mode

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
  limitReached: boolean, // rate limit indicator
}
```