# arcade-sniper

## Configuration

TODO: automate this

### `contracts.json`

```json
{
    "completed": []
}
```

### `userData.json`

```json
{
    "firstName": "John",
    "lastName": "Appleseed",
    "email": "j.appleseed@gmail.com",
    "addressLine1": "10 Downing St",
    "addressLine2": "",
    "city": "London",
    "stateOrProvince": "Greater London",
    "postalCode": "SW1A 2AB",
    "phoneNumber": "07911123456",
    "country": "United Kingdom"
}
```

### `item_additional_data/{item_id}.json`

Any additional fields. TODO: document better.

### `contracts/{contract_id}.json`

Example:

```json
{
    "item": "yubikey",
    "purchase": 2,
    "maxPrice": 6
}
```

## Running the sniper

To install dependencies:

```bash
npm install
```

To run:

```bash
tsx src/index.ts
```
