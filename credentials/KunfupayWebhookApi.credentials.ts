import type { ICredentialType, Icon, INodeProperties } from 'n8n-workflow';

export class KunfupayWebhookApi implements ICredentialType {
	name = 'kunfupayWebhookApi';

	displayName = 'Kunfupay Webhook API';

	icon: Icon = {
		light: 'file:../nodes/Kunfupay/kunfupay.svg',
		dark: 'file:../nodes/Kunfupay/kunfupay.dark.svg',
	};

	documentationUrl = 'https://github.com/Kunfupay-Company/N8N#kunfupay-webhook';

	properties: INodeProperties[] = [
		{
			displayName: 'Signing Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'The signing secret configured for this endpoint in Kunfupay under Integrations > Webhooks',
		},
	];
}
