interface Options {
	max: number;
	time: number;
	timeout: number;
	progress: number;
	completion: number;
	alwaysReset: boolean;
}

export default class {
	time = 0;
	progress = 0;
	timeout = 2000;

	startValue = 0;
	max = 100;

	private interval = 16;
	private delay = 100;
	private percent = 0;
	private id: any = 0;
	private idEnd: any = 0;

	options: Options;

	constructor(options?: Partial<Options>) {
		const opts = Object.assign({}, {max: 100, time: 0, progress: 0, timeout: 2000, completion: 1000, alwaysReset: false} as Options, options);
		this.max = opts.max;
		this.time = opts.time;
		this.timeout = opts.timeout;
		this.progress = opts.progress;
		this.percent = this.genPercent();
		this.options = opts;
	}

	onStart?: () => void;
	onProgress?: (value: number) => void;
	onFinish?: () => void;

	start() {
		this.addStart();
		this.addFinish();
	}
	resume() {
		this.addStart();
		this.addFinish();
	}
	pause() {
		clearInterval(this.id);
		clearTimeout(this.idEnd);
	}
	finish() {
		this.pause();
		this.time = 0;
		this.timeout = this.options.completion;
		this.percent = this.genPercent();
		this.addStart();
		this.addFinish();	
	}
	stop() {
		this.pause();
	}
	reset() {
		this.time = 0;
		this.timeout = this.options.timeout;
		this.percent = this.genPercent();
		this.progress = 0;
	}
	private genPercent() {
		return this.max / this.timeout;
	}
	private addStart() {
		const interval = this.interval;
		const percent = this.percent;

		this.onStart?.();

		this.id = setInterval(() => {
			this.onProgress?.(this.progress);

			this.time += interval;
			this.progress += percent * interval;
		}, interval);
	}
	private addFinish() {
		this.idEnd = setTimeout(() => {
			clearInterval(this.id);

			this.onFinish?.();
			this.stop();

			if (this.options.alwaysReset) {
				this.reset();
			}
		}, this.timeout + this.delay - this.time);
	}
}
