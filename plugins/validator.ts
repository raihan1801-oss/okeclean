import type {FastifyPluginAsync} from 'fastify';
import wrapper from 'fastify-plugin';
import Validator from 'fastest-validator';
import type {ValidatorConstructorOptions} from 'fastest-validator';

declare module 'fastify' {}

interface Options extends ValidatorConstructorOptions {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'validator';
const plugin: Plugin = async (server, opts) => {
	const fv = new Validator(opts);
	server.setValidatorCompiler(({schema}) => {
		let validator;
		// @ts-ignore
		if (schema.properties) schema = schema.properties;
		try {
			const check = fv.compile(schema);

			validator = (value: any) => {
				const result = check(value);
				if (result === true) return true;
				// @ts-ignore
				const message = (result[0] && result[0].message) || 'Validation Error';
				const error = new Error(message);
				return {
					error: {
						...error,
						statusCode: 422,
					},
				};
			};

			// @ts-ignore
			validator.errors = null;
		} catch (error: any) {
			validator = () => true;
			// @ts-ignore
			validator.errors = error;
		}

		return validator;
	});
};

declare const validator: Plugin;
export default wrapper(plugin, {name});
