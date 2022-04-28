#! /usr/bin/env node
import { CLI } from 'cliffy';
import fs from 'fs-extra';
import chalk from 'chalk';
import { ChildProcess, spawn } from 'child_process';
import { Seed } from '../utility/seed';
import { EnvConfig } from '../utility/env';
import { KeyPair } from '../utility/key-pair';

const child_process: Record<string, ChildProcess> = {};
const cli = new CLI()
	.setName('ada-ikan')
	.setVersion('v0.1.0')
	.setInfo('ada-ikan console')
	.setDelimiter('[ada-ikan] ')
	.addCommand('generate', {
		description: 'Generate key',
		action: (prams, options) => {
			cli.showHelp();
		},
		subcommands: {
			['auth-key']: {
				description: 'Generate Authentication key',
				options: ['verbose'],
				action: (prams, options) => {
					KeyPair.setup({ verbose: options.verbose });
					console.log(
						chalk.bgBlack.white`Generate Authentication key`,
						chalk.green`[Success]`
					);
				},
			},
			['vapid-key']: {
				description: 'Generate Vapid key',
				action: (prams, options) => {
					KeyPair.vapid({ verbose: options.verbose });
					console.log(
						chalk.bgBlack.white`Generate Vapid key`,
						chalk.green`[Success]`
					);
				},
			},
		},
	})
	.addCommand('build', {
		description: 'Build Source Server',
		options: ['clean'],
		action: (prams, options) => {
			let script = 'npm run build';
			if (options.clean) {
				script += ':clean';
			}
			spawn(script, [], {
				shell: true,
				stdio: 'inherit',
			}).once('close', (code, signal) => {
				if (code) {
					console.log(
						chalk.bgBlack.white`Build Source Server`,
						chalk.red`[Failed]`
					);
				} else {
					console.log(
						chalk.bgBlack.white`Build Source Server`,
						chalk.green`[Success]`
					);
				}
			});
		},
		subcommands: {
			bin: {
				description: 'Build Source Bin',
				parameters: [
					{
						label: 'mem',
						description: 'Memory limit',
						optional: true,
						type: 'number',
					},
				],
				options: ['clean'],
				action: (params, options) => {
					let script = 'npm run build:bin';
					if (params.mem) {
						script = 'MAX_OLD_SPACE_SIZE=' + params.mem;
					}
					if (options.clean) {
						script += ':clean';
					}
					spawn(script, [], {
						shell: true,
						stdio: 'inherit',
					}).once('close', (code, signal) => {
						if (code) {
							console.log(
								chalk.bgBlack.white`Build Source Bin`,
								chalk.red`[Failed]`
							);
						} else {
							console.log(
								chalk.bgBlack.white`Build Source Bin`,
								chalk.green`[Success]`
							);
						}
					});
				},
			},
			client: {
				description: 'Build Source Client',
				parameters: [
					{
						label: 'mem',
						description: 'Memory limit',
						optional: true,
						type: 'number',
					},
				],
				action: (params, options) => {
					let script = 'npm run build:client';
					if (params.mem) {
						script = 'MAX_OLD_SPACE_SIZE=' + params.mem;
					}
					spawn(script, [], {
						shell: true,
						stdio: 'inherit',
					}).once('close', (code, signal) => {
						if (code) {
							console.log(
								chalk.bgBlack.white`Build Source Client`,
								chalk.red`[Failed]`
							);
						} else {
							console.log(
								chalk.bgBlack.white`Build Source Client`,
								chalk.green`[Success]`
							);
						}
					});
				},
			},
			admin: {
				description: 'Build Source Admin',
				parameters: [
					{
						label: 'mem',
						description: 'Memory limit',
						optional: true,
						type: 'number',
					},
				],
				action: (params, options) => {
					let script = 'npm run build:admin';
					if (params.mem) {
						script = 'MAX_OLD_SPACE_SIZE=' + params.mem;
					}
					spawn(script, [], {
						shell: true,
						stdio: 'inherit',
						detached: true,
					}).once('close', (code, signal) => {
						if (code) {
							console.log(
								chalk.bgBlack.white`Build Source Admin`,
								chalk.red`[Failed]`
							);
						} else {
							console.log(
								chalk.bgBlack.white`Build Source Admin`,
								chalk.green`[Success]`
							);
						}
					});
				},
			},
		},
	})
	.addCommand('env', {
		description: 'configure environment',
		action: (params, options) => {
			cli.showHelp();
		},
		subcommands: {
			setup: {
				description: 'Generate environment',
				options: [
					{ label: 'prod', description: 'production env' },
					{ label: 'dev', description: 'development env' },
					{ label: 'verbose', description: 'show generated env' },
				],
				action: (params, options) => {
					EnvConfig.setup({
						production: options.prod,
						verbose: options.verbose,
					});
				},
			},
			set: {
				description: 'Generate environment',
				parameters: [
					{
						label: 'property',
						description: 'property of env',
						optional: false,
						type: 'string',
						rest: true,
					},
				],
				action: (params, options) => {
					const data = {} as any;
					for (const property of params.property as string[]) {
						if (!property.includes('=')) {
							console.log(
								'Invalid Parameter:',
								property,
								"The parameter must have assign symbol (=) and quote them ('k=v')"
							);
							return;
						}
						const [key, value] = property.split('=');
						data[key] = value;
					}
					EnvConfig.set(data);
				},
			},
		},
	})
	.addCommand('file', {
		description: 'File',
		action: (params, options) => {
			cli.showHelp();
		},
		subcommands: {
			create: {
				description: 'Create file',
				action: async (params, options) => {
					await fs.mkdir('public', { recursive: true });
					await fs.mkdir('private', { recursive: true });
					await fs.mkdir('logs', { recursive: true });
					await fs.createFile('logs/server.log');
					await fs.createFile('logs/client.log');
					await fs.writeJson(
						'data.json',
						{
							business: {
								productPriceIncrease: 500,
								productPriceIncreaseActive: false,
								deliveryCostCalculatePerDistance: 1000,
								deliveryCostCalculatePerDistanceActive: true,
								deliveryCostCalculatePerWeight: 0,
								deliveryCostCalculatePerWeightActive: false,
							},
							model: {
								open: false,
								openBy: '',
								openAt: '',
								link: '',
							},
							slides: [{ id: 0, src: '', href: '' }],
							subscription: [],
							config: {
								lockModel: false,
							},
						},
						{ spaces: '\t' }
					);
					console.log(chalk.bgBlack.white`Create file`, chalk.green`[Success]`);
				},
			},
		},
	})
	.addCommand('seed', {
		description: 'Seed database',
		options: ['prod'],
		action: (params, options) => {
			Seed.setup({ dev: !options.prod });
			console.log(chalk.bgBlack.white`Seed database`, chalk.green`[Success]`);
		},
	})
	.addCommand('db', {
		description: 'database configuration',
		options: ['prod'],
		action: (params, options) => {
			cli.showHelp();
		},
		subcommands: {
			preview: {
				description: 'show database management',
				action: (params, options) => {
					child_process.db_preview = spawn('prisma studio', [], {
						shell: true,
						stdio: 'inherit',
					})
						.once('spawn', () => {
							console.log(chalk.bgBlack.white`Database management spawned`);
						})
						.once('close', (code, signal) => {
							if (code) {
								console.log(
									chalk.bgBlack.white`Database management`,
									chalk.red`[Failed]`,
									chalk.blue`${code}`
								);
							} else {
								console.log(
									chalk.bgBlack.white`Database management`,
									chalk.green`[Success]`,
									chalk.blue`${code}`
								);
							}
						});
				},
			},
			reset: {
				action: (params, options) => {
					cli.showHelp();
				},
			},
			migrate: {
				action: (params, options) => {
					cli.showHelp();
				},
			},
			push: {
				description: 'Push Database to Schema ORM',
				action: (params, options) => {
					child_process.db_preview = spawn('prisma db push', [], {
						shell: true,
						stdio: 'inherit',
					})
						.once('spawn', () => {
							console.log(chalk.bgBlack.white`Push Database spawned`);
						})
						.once('close', (code, signal) => {
							if (code) {
								console.log(
									chalk.bgBlack.white`Push Database`,
									chalk.red`[Failed]`,
									chalk.blue`${code}`
								);
							} else {
								console.log(
									chalk.bgBlack.white`Push Database`,
									chalk.green`[Success]`,
									chalk.blue`${code}`
								);
							}
						});
				},
			},
			pull: {
				action: (params, options) => {
					cli.showHelp();
				},
			},
		},
	})
	.addCommand('exit', {
		description: 'Exit console',
		action: (params, options) => {
			for (const [key, sub_process] of Object.entries(child_process)) {
				try {
					sub_process.kill('SIGTERM');
					process.kill(sub_process.pid as any, 'SIGTERM');
				} catch (error: any) {}
				console.log(
					chalk`Kill sub process {blue ${key}} {yellow ${sub_process.pid}} ${
						sub_process.killed ? chalk`{green killed}` : chalk`{red not-killed}`
					}`.trim()
				);
			}
			console.log(chalk.bgBlack.green`Bye...`);
			process.exit(0);
		},
	})
	.show();
