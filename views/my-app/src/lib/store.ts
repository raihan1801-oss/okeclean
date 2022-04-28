import { ObserverUnsafe } from '$lib/helper';
import type { ClientApi } from '$apis/index';

export interface MySetting {
	installed: boolean;
	subscribed: boolean;
	notification: boolean;
	loaded: boolean;
}

export const setting = new ObserverUnsafe<MySetting>({
	installed: false,
	subscribed: false,
	notification: false,
	loaded: false
});
export const user = new ObserverUnsafe<ClientApi.User | null>(null);

export type Setting = typeof setting;
export type User = typeof user;
