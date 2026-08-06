import type { IExecuteSingleFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { describe, expect, it } from 'vitest';
import { addCheckoutSessionIdToUrl } from '../nodes/Kunfupay/resources/checkoutSession';

const requestOptions: IHttpRequestOptions = {
	method: 'GET',
	url: '/external/checkout/sessions',
};

function executionContext(checkoutSessionId: unknown): IExecuteSingleFunctions {
	return {
		getNode: () => ({ name: 'Kunfupay' }),
		getNodeParameter: () => checkoutSessionId,
	} as unknown as IExecuteSingleFunctions;
}

describe('addCheckoutSessionIdToUrl', () => {
	it('adds an encoded canonical ObjectId as a single path segment', async () => {
		const checkoutSessionId = '507F1F77BCF86CD799439011';

		await expect(
			addCheckoutSessionIdToUrl.call(executionContext(checkoutSessionId), requestOptions),
		).resolves.toMatchObject({
			url: `/external/checkout/sessions/${encodeURIComponent(checkoutSessionId)}`,
		});
	});

	it.each([
		'../../../integrations/products',
		'507f1f77bcf86cd79943901',
		'507f1f77bcf86cd7994390110',
		'507f1f77bcf86cd79943901g',
		'',
	])('rejects a non-canonical ObjectId: %s', async (checkoutSessionId) => {
		await expect(
			addCheckoutSessionIdToUrl.call(executionContext(checkoutSessionId), requestOptions),
		).rejects.toThrow('Checkout Session ID must be a 24-character hexadecimal ObjectId');
	});
});
