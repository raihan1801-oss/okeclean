import type { Env } from 'global';
import type EnvType from '../.env.json';

import type { FastifyInstance } from 'fastify';

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import patcher, { Operation } from 'fast-json-patch';
import validator from 'fastest-validator';

export interface Options {
	path: string;
	schema: object;
	data?: any;
	verbose?: boolean;
}

export const default_options: Options = {
	path: '',
	schema: {},
	data: {},
	verbose: true,
};

export class Data {
	public static url = 'smtp://username:password@smtp.example.com/?pool=true';
	public static options: Options;
	public static create<D = any>(options: Options) {
		const assign_options = Object.assign(
			{},
			default_options,
			options
		) as Required<Options>;
		return new DataJson<D>(assign_options);
	}
	public static setup(opts: Options) {
		this.options = Object.assign(
			{},
			default_options,
			opts
		) as Required<Options>;
		const {} = this.options;

		console.log(chalk.bgBlack.white`Mail Server Created`, chalk.green`[*]`);
	}
	public static load(opts: Options) {}
}

class DataJson<D = any> {
	protected temp!: D;
	public validator;
	public patcher = patcher;
	constructor(public options: Options) {
		this.validator = new validator({ debug: options.verbose }).compile(
			options.schema
		);
		if (options.data) {
			this.temp = options.data as any;
		}
	}
	public set(value: D) {
		this.temp = value;
		return this;
	}
	public get(): D {
		return this.temp;
	}
	public undo() {
		return this;
	}
	public redo() {
		return this;
	}
	public async load() {
		const data: D = await fs.readJson(this.options.path);
		return (this.temp = data);
	}
	public save() {
		const valid = this.validator(this.temp);
		if (typeof valid == 'boolean') {
			return fs.writeJson(this.options.path, this.temp, { spaces: '\t' });
		} else {
			throw valid;
		}
	}
	public validate(value: any) {
		return this.validator(value);
	}
	public compare(value: any) {
		return patcher.compare(this.temp, value);
	}
	public apply(operation: Operation) {
		patcher.applyOperation(this.temp, operation);
		return this;
	}
}
