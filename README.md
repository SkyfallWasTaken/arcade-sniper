# Arcade Sniper

Arcade Sniper monitors the Hack Club Arcade Shop, and purchases items automatically! It's perfect for getting items as soon as they come back in stock or getting a cheap YubiKey at a 1am sale.

## Configuration

You'll need to create a few files before you start!

### `contracts.json`

```json
{
    "completed": []
}
```

### `userData.json`

Replace the information with your own.

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

Any additional fields you want to set. So for example, the domain name would have this:

```json
{
    "orderNotes": "I want skyfall.dev please!"
}
```

### `contracts/{contract_id}.json`

**By default, my contracts will be used.** You should change that!

Example:

```json
{
    "item": "yubikey",
    "purchase": 2,
    "maxPrice": 6
}
```

### Environment variables

- `ARCADE_USER_ID`: User ID. It's in the URL when you're in the signed-in view.
- `FILLOUT_SESSION_TOKEN`: Find it in DevTools

## Running the sniper

To install dependencies:

```bash
npm install
```

To run:

```bash
tsx src/index.ts
```
