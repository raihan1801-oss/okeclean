import mri from 'mri';
import { Seed, defOpts, Options } from './utility/seed';

const opts = mri(process.argv.slice(2), {
	default: {
		...defOpts,
		cwd: __dirname,
	} as Options,
}) as Options & mri.Argv;

Seed.setup(opts);
