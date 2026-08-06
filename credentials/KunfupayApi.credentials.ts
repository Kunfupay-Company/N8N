import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class KunfupayApi implements ICredentialType {
	name = 'kunfupayApi';

	displayName = 'Kunfupay API';

	icon: Icon = {
		light: 'file:../nodes/Kunfupay/kunfupay.svg',
		dark: 'file:../nodes/Kunfupay/kunfupay.dark.svg',
	};

	documentationUrl = 'https://github.com/Kunfupay-Company/N8N#kunfupay-api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'The API key generated in Kunfupay under Integrations > API Keys',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://shop.kunfupay.com/api/v1',
			url: '/integrations/me',
			method: 'GET',
		},
	};
}
