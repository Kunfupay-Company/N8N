import type {
	ICredentialTestFunctions,
	ICredentialsDecrypted,
	IDataObject,
	IHookFunctions,
	INodeCredentialTestResult,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { createWebhookEventId, verifyWebhookSignature } from './webhookSignature';

type KunfupayEventType = 'payment.completed' | 'payment.failed';

interface KunfupayWebhookEnvelope {
	eventType: KunfupayEventType;
	payload: IDataObject;
	timestamp: number;
}

function isKunfupayWebhookEnvelope(value: unknown): value is KunfupayWebhookEnvelope {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Record<string, unknown>;

	return (
		(candidate.eventType === 'payment.completed' || candidate.eventType === 'payment.failed') &&
		typeof candidate.payload === 'object' &&
		candidate.payload !== null &&
		typeof candidate.timestamp === 'number' &&
		Number.isFinite(candidate.timestamp)
	);
}

function sendErrorResponse(
	context: IWebhookFunctions,
	statusCode: number,
	message: string,
): IWebhookResponseData {
	context.getResponseObject().status(statusCode).json({ error: message });

	return { noWebhookResponse: true };
}

export class KunfupayTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kunfupay Trigger',
		name: 'kunfupayTrigger',
		icon: {
			light: 'file:../Kunfupay/kunfupay.svg',
			dark: 'file:../Kunfupay/kunfupay.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when a verified Kunfupay payment event arrives',
		eventTriggerDescription: 'Waiting for a signed Kunfupay payment event',
		activationMessage:
			'Copy the Production URL into Kunfupay under Integrations > Webhooks.',
		defaults: {
			name: 'Kunfupay Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'kunfupayWebhookApi',
				required: true,
				testedBy: 'testWebhookSecret',
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'Use the Production URL when registering this endpoint in Kunfupay. The Test URL only works while listening for a test event.',
				name: 'webhookUrlNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				options: [
					{
						name: 'Payment Completed',
						value: 'payment.completed',
						description: 'A customer successfully completed the payment',
					},
					{
						name: 'Payment Failed',
						value: 'payment.failed',
						description: 'A payment attempt failed; the customer may retry',
					},
				],
				default: ['payment.completed', 'payment.failed'],
				description: 'The event types that should start this workflow',
			},
		],
	};

	methods = {
		credentialTest: {
			async testWebhookSecret(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const secret = credential.data?.webhookSecret;

				if (typeof secret !== 'string' || secret.trim().length < 32) {
					return {
						status: 'Error',
						message: 'The signing secret must contain at least 32 characters.',
					};
				}

				return {
					status: 'OK',
					message: 'The signing secret has a valid format.',
				};
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				return webhookData.webhookUrl === this.getNodeWebhookUrl('default');
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookUrl = this.getNodeWebhookUrl('default');

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				delete webhookData.webhookUrl;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const request = this.getRequestObject();

		if (!request.rawBody) {
			await request.readRawBody();
		}

		const rawBody = request.rawBody;

		if (!rawBody || rawBody.byteLength === 0) {
			return sendErrorResponse(this, 400, 'Request body is required');
		}

		const credentials = await this.getCredentials('kunfupayWebhookApi');
		const secret = credentials.webhookSecret;
		const signatureHeader = this.getHeaderData()['x-webhook-signature'];

		if (typeof secret !== 'string' || secret.length === 0) {
			return sendErrorResponse(this, 500, 'Webhook signing secret is not configured');
		}

		if (
			typeof signatureHeader !== 'string' ||
			!verifyWebhookSignature(rawBody, signatureHeader, secret)
		) {
			return sendErrorResponse(this, 401, 'Invalid webhook signature');
		}

		let parsedBody: unknown;

		try {
			parsedBody = JSON.parse(rawBody.toString('utf8')) as unknown;
		} catch {
			return sendErrorResponse(this, 400, 'Webhook body must be valid JSON');
		}

		if (!isKunfupayWebhookEnvelope(parsedBody)) {
			return sendErrorResponse(this, 400, 'Invalid Kunfupay webhook payload');
		}

		const selectedEvents = this.getNodeParameter('events') as KunfupayEventType[];

		if (!selectedEvents.includes(parsedBody.eventType)) {
			this.getResponseObject().status(200).json({ received: true, ignored: true });

			return { noWebhookResponse: true };
		}

		const output: IDataObject = {
			eventId: createWebhookEventId(rawBody),
			eventType: parsedBody.eventType,
			payload: parsedBody.payload,
			timestamp: parsedBody.timestamp,
			webhookId: this.getHeaderData()['x-webhook-id'] ?? null,
			signatureVerified: true,
		};

		return {
			workflowData: [this.helpers.returnJsonArray([output])],
		};
	}
}
