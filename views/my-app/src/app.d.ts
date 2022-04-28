/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	interface Locals {
		userid: string;
	}

	// interface Platform {}

	interface Session {
		splashed: boolean;
		checkout?: Checkout;
	}

	// interface Stuff {}
}

interface ImportMetaEnv {
	VITE_SERVER_ENV: string;
	VITE_SEVER_CONTEXT: string;
	VITE_SERVER_ORIGIN: string;
	VITE_SERVER_DOMAIN: string;
	VITE_API_SERVER_BASE_PATH: string;
	VITE_EVENT_SERVER_BASE_PATH: string;
	VITE_WS_SERVER_BASE_PATH: string;
	VITE_SERVER_STATIC_PATH: string;
	VITE_CLIENT_FETCH_MODE: RequestMode;
	VITE_CLIENT_BUILD_DIR: string;
	VITE_LANDING_URL: string;
	VITE_MAP_KEY: string;
	VITE_EMAIL_KEY: string;
	VITE_PAYMENT_KEY: string;
}

interface Checkout {
	id: number;
	status: string;
	address: { coord: [number, number], name: string };
	datetime: { timestamp: number; name: string };
	payment_method: { name: string };
	service: {
		daily_cleaning?: DailyCleaningService;
	};
	services: string[];
	total_cost: number;
}
interface DailyCleaningService {
	name: string;
	cost: number;
	cleaner?: { name: string };
	gender: { name: string };
	building_area: {
		hour: number;
		cost: number;
	};
	job_details: {
		name: string;
		image: string;
		count: number;
	}[];
}
