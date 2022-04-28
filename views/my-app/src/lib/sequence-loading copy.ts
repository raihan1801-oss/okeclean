export default class {
	time = 100;
	interval = this.time;
	timeout = 2000;
  timeStep = 250;
	progressInc = this.time / this.timeout;
	id: any = 0;
	start(handler: {
		begin?: () => void;
		load: (chunk: number) => void;
		preEnd?: () => void;
		end?: () => void;
	}) {
		const interval = this.interval;
		const timeout = this.timeout;
    const timeStep = this.timeStep;
		const progressInc = this.progressInc;
		let time = this.time;
		let id = this.id;

		handler.begin?.();
		id = setInterval(() => {
			handler.load(progressInc * time);
			time += interval;
		}, interval);
		setTimeout(() => {
			clearInterval(id);
			handler.preEnd?.();
			setTimeout(() => {
				handler.end?.();
			}, timeStep);
		}, timeout + timeStep);
	}
}
