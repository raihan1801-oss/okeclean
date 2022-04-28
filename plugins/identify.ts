import type { FastifyPluginAsync } from 'fastify';
import type { JWTPayload, UserInfo } from './../global';

import wrapper from 'fastify-plugin';
import Api from '../utility/api';

declare module 'fastify' {
	interface FastifyRequest {
		/**
		 * Identify User
		 *
		 * Request must provide Bearer Token
		 */
		identify(role?: string, access?: any): Promise<UserInfo>;
	}
}

interface Options {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'identify';
const plugin: Plugin = async (server, opts) => {
	const { jwt, rbac } = server;

	server.decorateRequest<() => Promise<UserInfo>>(
		name,
		async function (role?: string, access?: any) {
			try {
				const payload = await jwt.verify<JWTPayload>(
					this.headers.authorization as string
				);
				if (payload) {
					const { role: p_role, sub } = payload;
					let username = 'system';
					switch (p_role) {
						case 'customer':
							break;
						case 'cleaner':
							break;
						case 'admin':
							break;

						default:
							throw Api.Error.FailedAuthentication('Invalid Role');
					}
					if (role) {
						if (role != p_role) {
							throw Api.Error.FailedAuthorization("Invalid Role");
						}
					}
					return {
						sub,
						role: p_role,
						username,
						entity: `${p_role}::${username}`,
						time: new Date(),
					};
				} else {
					throw Api.Error.FailedAuthentication('Unknown User');
				}
			} catch (error: any) {
				return {
					sub: 0,
					role: 'system',
					time: new Date(),
					username: 'automatic',
					entity: `system::automatic`,
				};
			}
		}
	);
};

declare const orm: Plugin;
export default wrapper(plugin, { name });
