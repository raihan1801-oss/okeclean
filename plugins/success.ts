import type { FastifyPluginAsync } from 'fastify';
import FormData from 'form-data';
import wrapper from 'fastify-plugin';
import statusCodes from 'http-status-codes';
import Api from '../utility/api';

declare module 'fastify' {
	interface FastifyReply {
		/**
		 * send ok / 200 response
		 * @param data payload
		 * @package success plugin
		 */
		ok<Payload = object>(data?: Payload): this;
		/**
		 * send accept / 201 response
		 * @param data payload
		 * @package success plugin
		 */
		accept<Payload = object>(data?: Payload): this;
		/**
		 * send created / 202 response
		 * @param data payload
		 * @package success plugin
		 */
		created<Payload = object>(data?: Payload): this;
		/**
		 * send form data response
		 * @param data Form Data
		 * @package success plugin
		 */
		sendForm<Payload = object | any[]>(data: Payload): this;
		/**
		 * send 400 Bad Request Response
		 * @param error
		 * @package success plugin
		 */
		badRequest(error?: Error): this;
		/**
		 * send 401
		 * @param error
		 * @package success plugin
		 */
		unauthorized(error?: Error): this;
		/**
		 * send 403
		 * @param error
		 * @package success plugin
		 */
		forbidden(error?: Error): this;
		/**
		 * send 404
		 * @param error
		 * @package success plugin
		 */
		notFound(error?: Error): this;
		/**
		 * send 406
		 * @param error
		 * @package success plugin
		 */
		notAcceptable(error?: Error): this;
		/**
		 * send 408
		 * @param error
		 * @package success plugin
		 */
		requestTimeout(error?: Error): this;
		/**
		 * send 410
		 * @param error
		 * @package success plugin
		 */
		gone(error?: Error): this;
		/**
		 * send 415
		 * @param error
		 * @package success plugin
		 */
		unsupportedMediaType(error?: Error): this;
		/**
		 * send 415
		 * @param error
		 * @package success plugin
		 */
		unsupportedMediaType(error?: Error): this;
		/**
		 * send 418
		 * @param error
		 * @package success plugin
		 */
		imATeapot(error?: Error): this;
		/**
		 * send 429
		 * @param error
		 * @package success plugin
		 */
		tooManyRequests(error?: Error): this;
		/**
		 * send 500
		 * @param error
		 * @package success plugin
		 */
		internalServerError(error?: Error): this;
		/**
		 * send 501
		 * @param error
		 * @package success plugin
		 */
		notImplemented(error?: Error): this;
		/**
		 * send 502
		 * @param error
		 * @package success plugin
		 */
		badGateway(error?: Error): this;
		/**
		 * send 503
		 * @param error
		 * @package success plugin
		 */
		serviceUnavailable(error?: Error): this;
		/**
		 * send 504
		 * @param error
		 * @package success plugin
		 */
		gatewayTimeout(error?: Error): this;
		/**
		 * send 511
		 * @param error
		 * @package success plugin
		 */
		networkAuthenticationRequired(error?: Error): this;
		/**
		 * send 507
		 * @param error
		 * @package success plugin
		 */
		insufficientStorage(error?: Error): this;
	}
}

const plugin: FastifyPluginAsync = async (server, opts) => {
	const {
		OK,
		ACCEPTED,
		CREATED,
		BAD_REQUEST, // 400
		UNAUTHORIZED, // 401
		FORBIDDEN, // 403
		NOT_FOUND, // 404
		METHOD_NOT_ALLOWED, // 405
		NOT_ACCEPTABLE, // 406
		REQUEST_TIMEOUT, // 408
		CONFLICT, // 409
		GONE, // 410
		REQUEST_TOO_LONG, // 413
		REQUEST_URI_TOO_LONG, // 414
		UNSUPPORTED_MEDIA_TYPE, // 415
		IM_A_TEAPOT, // 418
		TOO_MANY_REQUESTS, // 429
		INTERNAL_SERVER_ERROR, // 500
		NOT_IMPLEMENTED, // 501
		BAD_GATEWAY, // 502
		SERVICE_UNAVAILABLE, // 503
		GATEWAY_TIMEOUT, // 504
		INSUFFICIENT_STORAGE, // 507
		NETWORK_AUTHENTICATION_REQUIRED, // 511
	} = statusCodes;

	server.decorateReply(
		'ok',
		function (data: string | number | object | Array<any> = '') {
			this.code(OK);
			this.type('application/json');
			this.send(data);
		}
	);
	server.decorateReply(
		'accept',
		function (data: string | number | object | Array<any> = '') {
			this.code(ACCEPTED);
			this.type('application/json');
			this.send(data);
		}
	);
	server.decorateReply(
		'created',
		function (data: string | number | object | Array<any> = '') {
			this.code(CREATED);
			this.type('application/json');
			this.send(data);
		}
	);
	server.decorateReply('sendForm', function (data: object | any[]) {
		const form = new FormData({autoDestroy: true});
		if (Array.isArray(data) && data.length) {
			const item = data[0];
			for (const key of Object.keys(item)) {
				for (const item of data) {
					form.append(key, item[key]);
				}
			}
		} else {
			for (const [key, value] of Object.entries(data)) {
				form.append(key, value);
			}
		}
		this.code(OK);
		this.headers(form.getHeaders());
		this.send(form);
	});

	server.setErrorHandler(function (error, request, reply) {
		reply.log.error(error);
		if (error instanceof Api.Error.Class) {
			reply.code(error.statusCode);
			reply.type('application/json');
			reply.headers(error.headers);
			reply.send({
				name: error.name,
				type: error.type,
				code: error.code,
				message: error.message,
				args: error.args,
				stack: error.stack,
			});
		} else {
			switch (error.code) {
				case 'P2002':
					reply.badRequest(Api.Error.FailedRegister('Email already exist'));
					break;

				default:
					reply.internalServerError(error);
					break;
			}
		}
	});

	server.decorateReply('badRequest', function (error?: Error) {
		this.code(BAD_REQUEST);
		this.type('application/json');
		this.send(error ?? new Error('Bad Request'));
	});
	server.decorateReply('unauthorized', function (error?: Error) {
		this.code(UNAUTHORIZED);
		this.type('application/json');
		this.send(error ?? new Error('Unauthorized'));
	});
	server.decorateReply('forbidden', function (error?: Error) {
		this.code(FORBIDDEN);
		this.type('application/json');
		this.send(error ?? new Error('Forbidden'));
	});
	server.decorateReply('notFound', function (error?: Error) {
		this.code(NOT_FOUND);
		this.type('application/json');
		this.send(error ?? new Error('Not Found'));
	});
	server.decorateReply('notAcceptable', function (error?: Error) {
		this.code(NOT_ACCEPTABLE);
		this.type('application/json');
		this.send(error ?? new Error('Not Acceptable'));
	});
	server.decorateReply('requestTimeout', function (error?: Error) {
		this.code(REQUEST_TIMEOUT);
		this.type('application/json');
		this.send(error ?? new Error('Request Timeout'));
	});
	server.decorateReply('gone', function (error?: Error) {
		this.code(GONE);
		this.type('application/json');
		this.send(error ?? new Error('Gone'));
	});
	server.decorateReply('unsupportedMediaType', function (error?: Error) {
		this.code(UNSUPPORTED_MEDIA_TYPE);
		this.type('application/json');
		this.send(error ?? new Error('Unsupported Media Type'));
	});
	server.decorateReply('imATeapot', function (error?: Error) {
		this.code(IM_A_TEAPOT);
		this.type('application/json');
		this.send(error ?? new Error('Im A Teapot'));
	});
	server.decorateReply('tooManyRequests', function (error?: Error) {
		this.code(TOO_MANY_REQUESTS);
		this.type('application/json');
		this.send(error ?? new Error('Too Many Requests'));
	});
	server.decorateReply('internalServerError', function (error?: Error) {
		this.code(INTERNAL_SERVER_ERROR);
		this.type('application/json');
		this.send(error ?? new Error('Internal Server Error'));
	});
	server.decorateReply('notImplemented', function (error?: Error) {
		this.code(NOT_IMPLEMENTED);
		this.type('application/json');
		this.send(error ?? new Error('Not Implemented'));
	});
	server.decorateReply('badGateway', function (error?: Error) {
		this.code(BAD_GATEWAY);
		this.type('application/json');
		this.send(error ?? new Error('Bad Gateway'));
	});
	server.decorateReply('serviceUnavailable', function (error?: Error) {
		this.code(SERVICE_UNAVAILABLE);
		this.type('application/json');
		this.send(error ?? new Error('Service Unavailable'));
	});
	server.decorateReply('gatewayTimeout', function (error?: Error) {
		this.code(GATEWAY_TIMEOUT);
		this.type('application/json');
		this.send(error ?? new Error('Gateway Timeout'));
	});
	server.decorateReply(
		'networkAuthenticationRequired',
		function (error?: Error) {
			this.code(NETWORK_AUTHENTICATION_REQUIRED);
			this.type('application/json');
			this.send(error ?? new Error('Network Authentication Required'));
		}
	);
	server.decorateReply('insufficientStorage', function (error?: Error) {
		this.code(INSUFFICIENT_STORAGE);
		this.type('application/json');
		this.send(error ?? new Error('Insufficient Storage'));
	});
};

export default wrapper(plugin, { name: 'success' });
