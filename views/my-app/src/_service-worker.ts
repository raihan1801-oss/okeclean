/// <reference no-default-lib="true"/>
/// <reference lib="WebWorker" />

import Service from '$lib/service';
import { build, files, timestamp } from '$service-worker';

const service = new Service({ cachename: timestamp + '', resources: [...build, ...files] });

service.route({
	url: /.*/,
	method: '*',
	handler: async (request, util) => {
		return {
			timeout: 5000,
			retry_interval: 10000,
			retry_times: 2,
			strategy: 'cache-first'
		};
	}
});
