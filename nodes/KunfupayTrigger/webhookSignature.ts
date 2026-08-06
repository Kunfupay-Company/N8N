import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_PREFIX = 'sha256=';
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i;

export function verifyWebhookSignature(
	rawBody: Buffer | string,
	signatureHeader: string,
	secret: string,
): boolean {
	if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) {
		return false;
	}

	const providedHex = signatureHeader.slice(SIGNATURE_PREFIX.length);

	if (!SHA256_HEX_PATTERN.test(providedHex)) {
		return false;
	}

	const expected = createHmac('sha256', secret).update(rawBody).digest();
	const provided = Buffer.from(providedHex, 'hex');

	return expected.byteLength === provided.byteLength && timingSafeEqual(expected, provided);
}

export function createWebhookEventId(rawBody: Buffer | string): string {
	return createHash('sha256').update(rawBody).digest('hex');
}
