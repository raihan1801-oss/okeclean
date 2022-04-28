import mri from 'mri';
import { EnvConfig, defOpts, Options } from './utility/env';

const opts = mri(process.argv.slice(2), {
	default: {
		...defOpts,
		cwd: __dirname,
	} as Options,
}) as Options & mri.Argv;

EnvConfig.setup(opts);
