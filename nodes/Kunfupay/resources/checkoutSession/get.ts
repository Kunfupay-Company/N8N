import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCheckoutSessionGet = {
	operation: ['get'],
	resource: ['checkoutSession'],
};

export const checkoutSessionGetDescription: INodeProperties[] = [
	{
		displayName: 'Checkout Session ID',
		name: 'checkoutSessionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCheckoutSessionGet,
		},
		description: 'The checkout session ID returned by the create operation',
	},
];
