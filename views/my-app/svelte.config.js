/// <reference types="./src/app" />

import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import adapter_node from '@sveltejs/adapter-node';
import liveReload from 'vite-plugin-live-reload';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import url from 'url';

dotenv.config({ debug: true });

/**
 * @type {{env: ImportMetaEnv}}
 */
const { env } = process;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const { dependencies } = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'package.json'))
);

/**
 * @type {import('vite').UserConfig}
 */
const vite = {
	server: {
		proxy: {
			[env.VITE_SERVER_STATIC_PATH]: {
				target: env.VITE_SERVER_ORIGIN,
				changeOrigin: true,
				rewrite: (path) => path,
			},
			[env.VITE_API_SERVER_BASE_PATH]: {
				target: env.VITE_SERVER_ORIGIN,
				changeOrigin: true,
				rewrite: (path) => path,
			},
			[env.VITE_EVENT_SERVER_BASE_PATH]: {
				target: env.VITE_SERVER_ORIGIN,
				changeOrigin: true,
				rewrite: (path) => path,
			},
			[env.VITE_WS_SERVER_BASE_PATH]: {
				target: env.VITE_SERVER_ORIGIN,
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path,
			},
		}
	},
	resolve: {
		alias: {
			$components: path.resolve(__dirname, 'src/components'),
			$apis: path.resolve(__dirname, 'src/apis'),
			$features: path.resolve(__dirname, 'src/features'),
			$server: path.resolve(__dirname, '../../')
		}
	},
	plugins: [liveReload.default(['src/routes/**'])],
	// ssr: {
	// 	noExternal: Object.keys(dependencies || {}),
	// },
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		scss: {
			includePaths: [path.join(__dirname, 'theme')],
		},
	}),

	kit: {
		adapter: adapter_node({
			precompress: true,
		}),
		vite,
		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		}
	}
};

export default config;
