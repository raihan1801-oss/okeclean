export const username = [
	(value: string) => value.length > 3 || 'Min 4 characters',
	(value: string) => value.length < 17 || 'Max 16 characters',
	(value: string) => /^[a-zA-Z0-9_]+$/.test(value) || 'Invalid characters',
];
export const password = [
	(value: string) => value.length > 3 || 'Min 4 characters',
	(value: string) => value.length < 17 || 'Max 16 characters',
];
export const email = [
	(value: string) => !!value || 'Required',
	(value: string) =>
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			value
		) || 'Invalid Email.',
];
export const telp = [
	(value: string) => value.length > 10 || 'Min 11 characters',
	(value: string) => value.length < 14 || 'Max 13 characters',
	(value: string) => /^\d+$/.test(value) || 'Invalid characters',
];
export const name = [
	(value: string) => /^[a-zA-Z\s]+$/.test(value) || 'Invalid characters',
];
