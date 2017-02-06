# Schema Webhooks Example

Schema provides webhooks for your application to be notified of important events, for example when an order is placed, a product is updated, or a payment is made. A full reference of events is available at https://schema.io/docs#webhooks.

This example should provide a quick reference or starting point for your own webhooks.

## Run the example

Before starting, few variables should be replaced inline or with environment variables.

```javascript
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'your endpoint url';
```

Set to the public URL that your webhook can be accessed from. If you're testing on `localhost` then we recommend using https://ngrok.com/. Ngrok will provide a URL such as `http://bfae1d11.ngrok.io` to access your webhook script.

```bash
./ngrok http 8080
```

```javascript
const SCHEMA_CLIENT_ID = process.env.SCHEMA_CLIENT_ID || 'your client id';
```

Set to your Schema client ID.

```javascript
const SCHEMA_CLIENT_KEY = process.env.SCHEMA_CLIENT_KEY || 'your client key';
```

Set to your Schema client key found in System / Account / Keys.

### Install and start

```bash
nvm install && nvm use && npm install
npm run watch
```

## Need help?

Join our Slack channel at https://slack.schema.io

## License

MIT
