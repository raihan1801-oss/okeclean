import * as PathMapping from 'tsconfig-paths';
import path from 'path';
import fs from 'fs';
import mri from 'mri';
import chalk from 'chalk';
import json from 'comment-json';

const opts = mri(process.argv.slice(2), {
	default: {
		prefix: '',
		proxy: false,
		log: true,
		verbose: false,
	} as Options,
}) as Options & mri.Argv;
// @ts-ignore
const tsconfig: typeof TsConfig = json.parse(
	fs.readFileSync(path.join(__dirname, 'tsconfig.json')).toString()
);
const pathsAlias = tsconfig.compilerOptions.paths;
const paths = Object.entries(pathsAlias).reduce(
	(prev, curr) => ({
		...prev,
		[opts.prefix + curr[0]]: curr[1],
	}),
	{} as { [key: string]: string[] }
);

PathMapping.register({
	baseUrl: __dirname,
	paths,
});

import type TsConfig from 'tsconfig.json';

import App, { defaultOptions, Options } from 'utility/app';

serve();

async function serve() {
	try {
		console.time(chalk.blue`Warming App`);

		const app = new App(opts);

		await app.main();
		await app.up();
	} catch (error: any) {
		console.error(error);
	} finally {
		console.timeEnd(chalk.blue`Warming App`);
	}
}
