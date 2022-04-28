import type { FastifyPluginAsync } from 'fastify';
import wrapper from 'fastify-plugin';
import Jwt, { Algorithm } from 'fast-jwt';

declare module 'fastify' {
	interface FastifyInstance {
		jwt: {
			sign<Payload = any>(payload: Payload): Promise<string>;
			verify<Payload = any>(token: string): Promise<Payload | undefined>;
		};
	}
}

interface Options {
	private: string;
	public: string;
	pass: string;
}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'jwt';
const plugin: Plugin = async (server, opts) => {
	const PRIVATE = opts.private;
	const PUBLIC = opts.public;
	const PASS = opts.pass;
	const ALGORITHM: Algorithm = 'RS256';

	const signer = Jwt.createSigner({
		algorithm: ALGORITHM,
		key: PRIVATE,
	});
	const verifier = Jwt.createVerifier({
		algorithms: [ALGORITHM],
		key: PUBLIC,
	});

	server.decorate(name, {
		sign: (payload: object) => signer(payload),
		verify: (token: string) => verifier(token.split(' ')[1] || token),
	});
};

declare const jwt: Plugin;
export default wrapper(plugin, { name });
