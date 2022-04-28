import type { Env } from 'global';
import type EnvType from '../.env.json';

import type { FastifyInstance } from 'fastify';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { createTransport, Transporter } from 'nodemailer';

export interface Options extends ListenOptions {
	verbose?: boolean;
	app: FastifyInstance;
	url: string;
}
export interface ListenOptions {
	port?: number;
	host?: string;
}
export interface SendOptions {
	from: string | { name: string; address: string };
	to:
		| string
		| { name: string; address: string }
		| (string | { name: string; address: string })[];
	replyTo?: string | { name: string; address: string };
	priority?: 'high' | 'low' | 'normal';
	subject?: string;
	html?: string;
	text?: string;
}

export const default_options: Options = {
	verbose: true,
	url: '',
	app: null as any,
	host: '0.0.0.0',
	port: 5020,
};

export class Mail {
	public static server: SMTPServer;
	public static client: Transporter;
	public static client_url =
		'smtp://username:password@smtp.example.com/?pool=true';
	public static options: Options;
	public static setup(options: Options) {
		this.options = Object.assign({}, default_options, options) as Required<Options>;
		const { url, app } = this.options;
		if (!app && !url) {
			throw new Error('App or Url on options not exist');
		}
		this.server = new SMTPServer({
			logger: this.options.verbose,
			onData(stream, session, cb) {
				stream.once('close', cb);
				simpleParser(stream, (error, message) => {
					if (error) {
						app.log.error(error);
					} else {
						app.log.info(message);
					}
				});
			},
			disabledCommands: ['AUTH'],
		});
		this.client_url = `${url}/?pool=true`;
		this.client = createTransport(this.client_url, {
			secure: false,
			logger: this.options.verbose,
		});

		console.log(chalk.bgBlack.white`Mail Server Created`, chalk.green`[*]`);
	}
	public static listen(port?: number, host?: string) {
		this.server.listen(port ?? this.options.port, host ?? this.options.host);
		this.server.server.once('listening', () => {
			const address = this.server.server.address() as {
				address: string;
				family: string;
				port: number;
			};
			if (!address) {
				throw new Error('Mail address ' + address);
			}
			this.options.app.log.info(
				chalk`Mail Server Listening on ` +
					chalk.blueBright`http://${address.address}:${address.port}`
			);
		});
	}
	public static async send(options: SendOptions) {
		this.options.app.log.info(
			chalk`{white Client Mail Send} {yellow from: ${options.from} to: ${options.to} reply-to: ${options.replyTo}}`
		);
		const message = await this.client.sendMail(options);
		return message;
	}
	public static load(opts: Options) {}
}
