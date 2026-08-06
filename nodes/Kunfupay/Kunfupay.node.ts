import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { checkoutSessionDescription } from './resources/checkoutSession';

export class Kunfupay implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kunfupay',
		name: 'kunfupay',
		icon: {
			light: 'file:kunfupay.svg',
			dark: 'file:kunfupay.dark.svg',
		},
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create and retrieve Kunfupay hosted checkout sessions',
		defaults: {
			name: 'Kunfupay',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'kunfupayApi', required: true }],
		requestDefaults: {
			baseURL: 'https://shop.kunfupay.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Checkout Session',
						value: 'checkoutSession',
					},
				],
				default: 'checkoutSession',
			},
			...checkoutSessionDescription,
		],
	};
}
