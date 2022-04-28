import type {
	ResponseBody,
	ResponseBodyError,
	WithJWT,
	ToObject,
	ToOptional,
} from '../global';

export type Version = 'v0-alpha.1' | 'v1';

class ApiError extends Error {
	type: string;
	code: number;
	statusCode: number;
	headers: Record<string, string>;
	args?: any;
	stack!: string;
	constructor({
		args,
		message,
		code,
		statusCode,
		type,
		headers,
	}: {
		type: string;
		message?: string;
		code?: number;
		statusCode?: number;
		headers?: Record<string, string>;
		args?: any;
	}) {
		super();
		this.name = type;
		this.type = type;
		this.message = message ?? '';
		this.code = code ?? 0;
		this.statusCode = statusCode ?? 400;
		this.headers = headers ?? {};
		this.args = args;
		Error.captureStackTrace(this);
	}
}
export enum TypeError {
	InvalidArgument = 'Invalid Argument.',
	UNAUTHORIZED = 'Unauthorized.',
	DATA_NOT_FOUND = 'Data not found.',
	USER_NOT_FOUND = 'User not found',
	PASSWORD_INVALID = 'Password invalid.',
	USERNAME_INVALID = 'Username invalid.',
	EMAIL_ALREADY_EXIST = 'Email already exist.',
	File_NOT_FOUND = 'File not found.',
	DIR_NOT_FOUND = 'Dir not found.',
	IMAGE_MIME_INVALID = 'Mimetype must be image/*.',
	FailedRegister = 'Failed Register',
}

export default class Api {
	static version = { lastest: 'v0-alpha.1' };

	static toQueryString(query: object) {
		const queries = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (Array.isArray(value)) {
				for (const item of value) {
					queries.set(key, item);
				}
			} else {
				queries.set(key, value);
			}
		}
		return queries.toString();
	}
	static toFormData(data: object | any[]) {
		const form = new FormData();
		if (Array.isArray(data) && data.length) {
			const item = data[0];
			for (const key of Object.keys(item)) {
				for (const item of data) {
					form.append(key, item);
				}
			}
		} else {
			for (const [key, value] of Object.entries(data)) {
				form.append(key, value);
			}
		}
		return form;
	}
	static toObjectForm<Data = unknown>(
		form: globalThis.FormData
	): ToObject<Data> {
		const data = Object.create(null);
		for (const [key, value] of form.entries()) {
			if (data[key]) {
				if (Array.isArray(data[key])) {
					data[key].push(value);
				} else {
					data[key] = [data[key], value];
				}
			} else {
				data[key] = value;
			}
		}
		return data;
	}
	static toObject<Data = unknown>(
		form: globalThis.FormData,
		array = false
	): Data {
		const data = Object.create(null);
		if (array) {
			const keys: string[] = [];
			for (const [key, value] of form.entries()) {
				if (keys.includes(key)) {
					continue;
				} else {
					keys.push(key);
					data[key] = value;
				}
			}
			const list: any[] = [];
			const length = form.getAll(keys[0]).length;
			for (const key of keys) {
				data[key] = form.getAll(key);
			}
			for (let index = 0; index < length; index++) {
				const item = Object.create(null);
				for (const key of keys) {
					item[key] = data[key][index];
				}
				list.push(item);
			}
			return list as any;
		} else {
			for (const [key, value] of form.entries()) {
				data[key] = value;
			}
			return data;
		}
	}
	static Header = class {
		static contentType(type: 'json' | 'form') {
			if (type == 'json') {
				return { 'content-type': 'application/json' };
			} else if (type == 'form') {
				return { 'content-type': 'multipart/form-data' };
			} else {
				throw new Error('');
			}
		}
		static accept(type: 'json' | 'form') {
			if (type == 'json') {
				return { accept: 'application/json' };
			} else if (type == 'form') {
				return { accept: 'multipart/form-data' };
			} else {
				throw new Error('');
			}
		}
		static authorization(token: string) {
			return { authorization: `Bearer ${token}` };
		}
	};

	static Error = class {
		static Class = ApiError;
		static Const = class {
			static FailedRegister = {
				type: 'Failed Register',
				code: 10,
				statusCode: 400,
			};
			static FailedUnregister = {
				type: 'Failed Unregister',
				code: 10,
				statusCode: 400,
			};
			static FailedLogin = {
				type: 'Failed Login',
				code: 10,
				statusCode: 400,
			};
			static FailedAuthentication = {
				type: 'Failed Authentication',
				code: 10,
				statusCode: 401,
				headers: { 'www-authenticate': 'Bearer realm="user", charset="UTF-8' },
			};
			static FailedAuthorization = {
				type: 'Failed Authorization',
				code: 10,
				statusCode: 410,
			};
			static InvalidArgument = {
				type: 'Invalid Argument',
				code: 5,
				statusCode: 400,
			};
			static Failed = {
				type: 'Failed',
				code: 1,
				statusCode: 500,
			};
			static FailedVerifyOtp = {
				type: 'Failed Verify Otp',
				code: 1,
				statusCode: 400,
			};
			static FailedProccessingImage = {
				type: 'Failed Proccessing Image',
				code: 10,
				statusCode: 400,
			};
		};

		static FailedRegister(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.FailedRegister });
		}
		static FailedUnregister(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.FailedUnregister });
		}
		static FailedLogin(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.FailedLogin });
		}
		static FailedAuthentication(message?: string, args?: any) {
			return new ApiError({
				args,
				message,
				...this.Const.FailedAuthentication,
			});
		}
		static FailedAuthorization(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.FailedAuthorization });
		}
		static InvalidArgument(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.InvalidArgument });
		}
		static Failed(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.Failed });
		}
		static FailedVerifyOtp(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.FailedVerifyOtp });
		}
		static FailedProccessingImage(message?: string, args?: any) {
			return new ApiError({ args, message, ...this.Const.FailedProccessingImage });
		}

		static From = class extends Error {
			type: string = '';
			code: number = 0;
			statusCode: number = 0;
			args: any;
			constructor(error?: ApiError) {
				super();
				Error?.captureStackTrace?.(this);
				if (typeof error == 'object') {
					const { args, message, stack, code, statusCode, type } = error;
					this.name = type;
					this.type = type;
					this.message = message;
					this.args = args;
					this.code = code;
					this.statusCode = statusCode;
					this.stack = stack;
				}
			}
		};
	};
}
