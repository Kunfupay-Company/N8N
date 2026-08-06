import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
	createWebhookEventId,
	verifyWebhookSignature,
} from '../nodes/KunfupayTrigger/webhookSignature';

const secret = 'a-safe-test-secret-that-is-never-used-outside-this-test';
const rawBody = Buffer.from(
	JSON.stringify({
		eventType: 'payment.completed',
		payload: { checkoutSessionId: 'checkout_123', status: 'completed' },
		timestamp: 1_725_000_000_000,
	}),
);

describe('verifyWebhookSignature', () => {
	it('accepts the HMAC-SHA256 signature of the exact raw body', () => {
		const digest = createHmac('sha256', secret).update(rawBody).digest('hex');

		expect(verifyWebhookSignature(rawBody, `sha256=${digest}`, secret)).toBe(true);
	});

	it('rejects a signature after the raw body changes', () => {
		const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
		const changedBody = Buffer.concat([rawBody, Buffer.from(' ')]);

		expect(verifyWebhookSignature(changedBody, `sha256=${digest}`, secret)).toBe(false);
	});

	it('rejects malformed signatures', () => {
		expect(verifyWebhookSignature(rawBody, 'invalid', secret)).toBe(false);
		expect(verifyWebhookSignature(rawBody, 'sha256=not-hex', secret)).toBe(false);
	});
});

describe('createWebhookEventId', () => {
	it('is deterministic and changes with the body', () => {
		expect(createWebhookEventId(rawBody)).toBe(createWebhookEventId(rawBody));
		expect(createWebhookEventId(rawBody)).not.toBe(createWebhookEventId('different body'));
	});
});
