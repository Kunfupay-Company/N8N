import {
	NodeOperationError,
	type IHttpRequestOptions,
	type INodeProperties,
	type PreSendAction,
} from 'n8n-workflow';
import { checkoutSessionCreateDescription } from './create';
import { checkoutSessionGetDescription } from './get';

const CHECKOUT_SESSION_PATH = '/external/checkout/sessions';
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

export const addCheckoutSessionIdToUrl: PreSendAction = async function (
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const checkoutSessionId = this.getNodeParameter('checkoutSessionId');

	if (typeof checkoutSessionId !== 'string' || !OBJECT_ID_PATTERN.test(checkoutSessionId)) {
		throw new NodeOperationError(
			this.getNode(),
			'Checkout Session ID must be a 24-character hexadecimal ObjectId',
		);
	}

	return {
		...requestOptions,
		url: `${CHECKOUT_SESSION_PATH}/${encodeURIComponent(checkoutSessionId)}`,
	};
};

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
						url: CHECKOUT_SESSION_PATH,
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
						url: CHECKOUT_SESSION_PATH,
					},
					send: {
						preSend: [addCheckoutSessionIdToUrl],
					},
				},
			},
		],
		default: 'create',
	},
	...checkoutSessionCreateDescription,
	...checkoutSessionGetDescription,
];
