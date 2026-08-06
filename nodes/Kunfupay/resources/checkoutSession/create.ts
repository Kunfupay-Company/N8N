import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCheckoutSessionCreate = {
	operation: ['create'],
	resource: ['checkoutSession'],
};

export const checkoutSessionCreateDescription: INodeProperties[] = [
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		typeOptions: {
			minValue: 0.01,
			numberPrecision: 2,
		},
		default: 1,
		required: true,
		displayOptions: {
			show: showOnlyForCheckoutSessionCreate,
		},
		description: 'Payment amount in EUR, not cents',
		routing: {
			send: {
				type: 'body',
				property: 'amount',
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCheckoutSessionCreate,
		},
		description: 'Description displayed to the customer at checkout',
		routing: {
			send: {
				type: 'body',
				property: 'description',
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForCheckoutSessionCreate,
		},
		options: [
			{
				displayName: 'Cancel URL',
				name: 'cancelUrl',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/payment/cancel',
				description: 'Absolute HTTPS URL used when the customer cancels or payment fails',
				routing: {
					send: {
						type: 'body',
						property: 'cancelUrl',
					},
				},
			},
			{
				displayName: 'External Reference',
				name: 'externalReference',
				type: 'string',
				default: '',
				description: 'Your own order or tracking ID, echoed in status responses and webhooks',
				routing: {
					send: {
						type: 'body',
						property: 'externalReference',
					},
				},
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'String key-value pairs echoed in status responses and webhooks',
				routing: {
					send: {
						type: 'body',
						property: 'metadata',
						value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
					},
				},
			},
			{
				displayName: 'Success URL',
				name: 'successUrl',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/payment/success',
				description: 'Absolute HTTPS URL used after a successful payment',
				routing: {
					send: {
						type: 'body',
						property: 'successUrl',
					},
				},
			},
		],
	},
];
