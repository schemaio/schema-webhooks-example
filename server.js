const express = require('express');
const bodyParser = require('body-parser');
const Schema = require('schema-client');

// Map webhook events to handlers
// See https://schema.io/docs#webhooks for a complete list of events
const webhookEvents = {
  'webhook.test': handleWebhookTest,
  'product.updated': handleProductUpdated,
  'order.submitted': handleOrderSubmitted,
  'payment.succeeded': handlePaymentSucceeded
};

// URL this server will receive events at
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'your endpoint url';

// Alias to identify this webhook and ensure we update a single configuration
const WEBHOOK_ALIAS = process.env.WEBHOOK_ALIAS || 'example';

// Port this server will listen on
// Note: if using ngrok, your tunnel should point to this port on localhost
const PORT = process.env.PORT || 8080;

// Connect to Schema using ID and Key
const SCHEMA_CLIENT_ID = process.env.SCHEMA_CLIENT_ID || 'your client id';
const SCHEMA_CLIENT_KEY = process.env.SCHEMA_CLIENT_KEY || 'your client key';
const schema = new Schema.Client(SCHEMA_CLIENT_ID, SCHEMA_CLIENT_KEY);

// Initiate express
const app = express();
app.use(bodyParser.json());

// Receive webhook events on POST
app.post('/', (req, res) => {
  receiveEvent(req.body).then(() => {
    res.status(200).end();
  }).catch(err => {
    res.status(500).end(err);
  });
});

// Listen for webhooks
app.listen(PORT, () => {
  console.log(`> Listening on port ${PORT} for events to ${WEBHOOK_URL}\n`);

  // Register webhook endpoint and send a test event
  registerWebhook().then(sendTestEvent).catch(console.error);
});

// Create or update a webhook endpoint configuration
function registerWebhook() {
  return schema.get('/:webhooks/:last', { alias: WEBHOOK_ALIAS }).then(existingWebhook => {
    if (existingWebhook) {
      // Update existing webhook
      return schema.put('/:webhooks/{id}', {
        id: existingWebhook.id,
        url: WEBHOOK_URL,
        events: { $set: Object.keys(webhookEvents) },
        enabled: true
      });
    } else {
      // Create new webhook
      return schema.post('/:webhooks', {
        alias: WEBHOOK_ALIAS,
        url: WEBHOOK_URL,
        events: Object.keys(webhookEvents),
        enabled: true
      });
    }
  }).then(webhook => {
    if (webhook.errors) {
      throw new Error(`Unable to register webhook! ${JSON.stringify(webhook.errors)}`);
    }
    return webhook;
  });
}

// Send a test event
function sendTestEvent(webhook) {
  return schema.post('/events', {
    model: ':webhooks',
    type: 'webhook.test',
    data: { id: webhook.id }
  });
}

// Receive and handle webhook events
function receiveEvent(event) {
  const { type, model, data } = event;
  const now = new Date();

  console.log(`[${now.toISOString()}] Received ${type} for /${model}/${data.id}`);
  console.log(JSON.stringify(event, null, 2));

  // Get handler from event map
  const handler = webhookEvents[event.type];

  // Throw an error if the event is not defined
  if (handler === undefined) {
    throw new Error(`Unable to handle ${event.type} event`);
  }

  return Promise.resolve(handler(event));
}

// ============================================
// Event handlers
// --------------------------------------------

function handleWebhookTest(event) {
  console.log('> Webhook test successful');
}

function handleProductUpdated(event) {
  return schema.get('/products/{id}', {
    id: event.data.id
  }).then(product => {
    // TODO: something with updated product
  });
}

function handleOrderSubmitted(event) {
  return schema.get('/orders/{id}', {
    id: event.data.id
  }).then(order => {
    // TODO: something with submitted order
  });
}

function handlePaymentSucceeded(event) {
  return schema.get('/payments/{id}', {
    id: event.data.id
  }).then(payment => {
    // TODO: something with successful payment
  });
}
