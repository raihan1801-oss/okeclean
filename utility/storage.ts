import fs from 'fs-extra';
import sharp from 'sharp';
import _path from 'path';

interface Options {
	root: string;
}

const DEFAULT_OPTIONS: Options = {
	root: '',
};

export interface DirTree {
	name: string;
	href: string;
	path: string;
	files: DirFile[];
	subs: DirTree[];
}
export interface DirFile {
	name: string;
	href: string;
	path: string;
}
export class PromiseExt<T = any, S = any, I = any> extends Promise<T> {
	static get [Symbol.species]() {
		return Promise;
	}
	public resolver!: (value?: T) => void;
	public rejector!: (error: any) => void;
	public stream: S;
	public instance: I;
	constructor(
		executor?: (
			this: PromiseExt<T, S, I>,
			resolve: (value: T) => void,
			reject: (error: any) => any
		) => void,
		opts?: { stream: S; instance: I }
	) {
		let resolver: any;
		let rejector: any;
		super((resolve, reject) => {
			resolver = resolve;
			rejector = reject;
		});
		this.resolver = resolver;
		this.rejector = rejector;
		executor?.bind(this, resolver, rejector)();
		this.stream = opts?.stream as any;
		this.instance = opts?.instance as any;
	}
}

export class FileStorage {
	static path = _path;
	static fs = fs;

	public options: Options;
	constructor(options?: Partial<Options>) {
		this.options = Object.assign({}, DEFAULT_OPTIONS, options);
	}
	public create(options?: Partial<Options>) {
		return new FileStorage(Object.assign({}, this.options, options));
	}
	public async init() {
		await fs.mkdir(this.options.root, { recursive: true });
	}
	public save_file(
		source: NodeJS.ReadableStream,
		opts: {
			path: string;
			href: string;
		}
	) {
		const abs_dir = _path.join(this.options.root, opts.path);
		const dir_file = () =>
			this.dir_file(opts.path, _path.join(opts.href, _path.dirname(opts.path)));
		const dir_tree = () => this.dir_tree(abs_dir, opts.href);
		return new PromiseExt<DirTree | DirFile, fs.WriteStream, this>(
			async function () {
				if (_path.extname(abs_dir)) {
					this.stream = source.pipe(fs.createWriteStream(abs_dir));
					this.stream.on('finish', () => {
						this.resolver(dir_file());
					});
				} else {
					await fs.mkdir(abs_dir, { recursive: true });
					this.resolver(await dir_tree());
				}
			}
		);
	}
	public remove_file(path: string) {
		const abs_dir = _path.join(this.options.root, path);
		return new PromiseExt<boolean, fs.WriteStream, this>(async function () {
			try {
				if (_path.extname(abs_dir)) {
					await fs.rm(abs_dir);
					// if (await fs.pathExists(abs_dir)) {
					// 	await fs.rm(abs_dir);
					// }
				} else {
					await fs.rm(abs_dir, { recursive: true });
				}
				this.resolver(true);
			} catch (error) {
				throw error;
			}
		});
	}
	public saveImage(
		source: NodeJS.ReadableStream,
		opts: {
			dirname: string;
			filename: string;
			compress?: boolean;
			keep?: boolean;
		}
	) {
		const dir = _path.join(this.options.root, opts.dirname);
		const file = _path.join(dir, opts.filename);

		return new PromiseExt<any, fs.WriteStream, this>(async function () {
			if (!opts.keep) {
				await fs.emptyDir(dir);
			}
			if (opts.compress) {
				this.stream = source
					.pipe(sharp())
					.resize({ width: 150, height: 150, fit: 'cover', position: 'centre' })
					.webp({ lossless: true })
					.pipe(fs.createWriteStream(file));
			} else {
				this.stream = source.pipe(fs.createWriteStream(file));
			}
			this.stream.on('finish', () => {
				this.resolver();
			});
		});
	}
	public loadImage() {}
	public async dir_tree(abs_dir: string, href: string) {
		const rel_dir = _path.basename(abs_dir);
		return this._dir_tree(
			abs_dir,
			_path.join(_path.sep, rel_dir),
			_path.join(_path.sep, href)
		);
	}
	protected async _dir_tree(abs_dir: string, path: string, href: string) {
		const name = _path.basename(abs_dir);
		const files: { name: string; href: string; path: string }[] = [];
		const subs: DirTree[] = [];
		for (const dir of await fs.readdir(abs_dir)) {
			if (_path.extname(dir)) {
				files.push(this.dir_file(_path.join(path, dir), href));
			} else {
				subs.push(
					await this._dir_tree(
						_path.join(abs_dir, dir),
						_path.join(path, dir),
						_path.join(href, dir)
					)
				);
			}
		}
		const data: DirTree = {
			name,
			path: path,
			href: href,
			files,
			subs,
		};
		return data;
	}
	public dir_file(rel_dir: string, href: string) {
		const name = _path.basename(rel_dir);
		const data: DirFile = {
			name,
			path: _path.join(_path.sep, rel_dir),
			href: _path.join(href, name),
		};
		return data;
	}
}
