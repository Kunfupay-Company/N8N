# n8n-nodes-kunfupay

Official n8n community nodes for [Kunfupay](https://kunfupay.com/). Create hosted one-time checkout sessions, retrieve their status, and start workflows from signed payment webhooks.

[n8n](https://n8n.io/) is a workflow automation platform.

## Installation

Install `n8n-nodes-kunfupay` from **Settings > Community Nodes** in n8n, or follow the [n8n community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Nodes

### Kunfupay

The action node supports these checkout session operations:

- **Create**: creates a single-use hosted checkout URL that expires after 24 hours.
- **Get**: retrieves the current status and details of a checkout session.

Amounts are expressed in EUR, not cents. For example, `10.50` means EUR 10.50.

### Kunfupay Trigger

The trigger starts a workflow when Kunfupay sends either of these events:

- `payment.completed`
- `payment.failed`

Every delivery is verified with HMAC-SHA256 before it reaches the workflow. Invalid signatures receive an HTTP 401 response and do not start an execution.

The trigger output includes a deterministic `eventId`, calculated from the signed raw body. Store this value in a durable data store if the workflow performs non-idempotent work, because webhook deliveries can be retried.

## Credentials

### Kunfupay API

1. In the Kunfupay business dashboard, open **Integrations > API Keys**.
2. Create or copy an API key.
3. In n8n, create a **Kunfupay API** credential and paste the key.

The credential test calls a read-only account endpoint. It never creates a checkout or moves money.

### Kunfupay Webhook

1. Add a **Kunfupay Trigger** to a workflow and select the events to receive.
2. Publish the workflow and copy the trigger's **Production URL**.
3. In the Kunfupay business dashboard, open **Integrations > Webhooks**.
4. Add the Production URL, select the same events, and generate or enter a signing secret.
5. In n8n, create a **Kunfupay Webhook** credential with that exact signing secret.

Use the Production URL for registered webhooks. The Test URL only listens temporarily while the editor is waiting for a test event.

## Webhook safety

- Fulfil orders only after `payment.completed`.
- A `payment.failed` event is not terminal: the customer may retry.
- Deliveries can be duplicated or arrive out of order. Use `eventId`, `timestamp`, and `checkoutSessionId` to make downstream processing idempotent.
- Never expose the API key or webhook signing secret in workflow output.

## Compatibility

Built with the official `@n8n/node-cli` and the current `n8n-workflow` API. The package is intended for current n8n releases that support community nodes.

## Development

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
pnpm dev
```

`pnpm dev` starts a local n8n development instance with these nodes linked.

## Resources

- [Kunfupay](https://kunfupay.com/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
