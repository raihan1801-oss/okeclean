import mri from 'mri';
import { KeyPair, defOpts, Options } from './utility/key-pair';

const opts = mri(process.argv.slice(2), {
	default: {
		...defOpts,
		cwd: __dirname,
	} as Options,
}) as Options & mri.Argv;

KeyPair.setup(opts);