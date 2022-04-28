import type { FastifyPluginAsync } from 'fastify';
import wrapper from 'fastify-plugin';

import { Mail, Options as MailOptions, ListenOptions, SendOptions } from 'utility/mail';

declare module 'fastify' {
	interface FastifyInstance {
		mail: {
			send(options: SendOptions): Promise<any>;
			listen(port?: number, host?: string): void;
		};
	}
}

interface Options extends Omit<MailOptions, 'app'> {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'mail';
const plugin: Plugin = async (server, opts) => {
	Mail.setup({
		app: server,
		...opts,
	});
	server.decorate(name, {
		listen(port?: number, host?: string) {
			return Mail.listen(port, host);
		},
		send(options: SendOptions) {
			return Mail.send(options);
		},
	});
};

declare const mail: Plugin;
export default wrapper(plugin, { name });
