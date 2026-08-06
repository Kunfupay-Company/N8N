import type { INodeProperties } from 'n8n-workflow';
import { checkoutSessionCreateDescription } from './create';
import { checkoutSessionGetDescription } from './get';

const showOnlyForCheckoutSessions = {
	resource: ['checkoutSession'],
};

export const checkoutSessionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCheckoutSessions,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a checkout session',
				description: 'Create a single-use hosted checkout URL',
				routing: {
					request: {
						method: 'POST',
						url: '/external/checkout/sessions',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a checkout session',
				description: 'Retrieve a checkout session by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/external/checkout/sessions/{{$parameter.checkoutSessionId}}',
					},
				},
			},
		],
		default: 'create',
	},
	...checkoutSessionCreateDescription,
	...checkoutSessionGetDescription,
];
