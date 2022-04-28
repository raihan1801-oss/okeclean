import { wait } from "./helper.js";

export const env = {
  debug: false,
}

type Method = 'GET' | 'POST' | 'OPTION' | 'DELETE' | 'PUT' | 'PATCH';
type CacheStrategy = 'none' | 'net-first' | 'cache-first' | 'revalidate' | 'net-only' | 'cache-only';
type Body = ReadableStream | Blob | BufferSource | FormData | URLSearchParams | string;

interface Options {
  url?: string;
  endpoint?: string;
  query?: string;
  method?: Method;
  cors?: RequestMode;
  headers?: /* string[][] | Headers | */ Record<string, string>;
  cache?: RequestCache;
  strategy?: CacheStrategy;
  debug?: boolean;
  timeout?: number;
  timeretry?: number;
}

const defaultOptions: Options = {
  cache: 'no-store',
  cors: 'same-origin',
  headers: {},
  method: 'GET',
  strategy: 'none',
  url: '',
  endpoint: '',
  query: '',
  debug: true,
  timeout: 0,
  timeretry: 5000,
}
const ERR_NET_OFFLINE = 'The network offline';

function toQueries(query: object) {
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
}

export class ApiRequest {
  static toQueries = toQueries;

  abortController = new AbortController();
  options: Required<Options>;
  cacheName = 'ApiRequest';
  cacheOptions: CacheQueryOptions = {
    ignoreMethod: false,
    ignoreSearch: false,
    ignoreVary: true,
  }
  notFound: Response | undefined;

  protected retrying = false;
  protected retryId: any = 0;

  constructor(options?: Options) {
    this.options = Object.assign({}, defaultOptions, options) as Required<Options>;
  }
  retry(onsuccess: (response: Response) => void, onfailed: (error: any) => void) {
    if (this.retrying) {
      return;
    }
    this.retrying = true;
    this.retryId = setInterval(() => {
      this.send()
        .then((response) => {
          this.retrying = false;
          clearInterval(this.retryId);
          onsuccess(response);
        })
        .catch((error: any) => {
          if (error.message != ERR_NET_OFFLINE) {
            this.retrying = false;
            clearInterval(this.retryId);
          }
          onfailed(error);
        });
    }, this.options.timeretry);
    return this;
  }
  abortRetry() {
    if (this.retrying) {
      clearInterval(this.retryId);
      this.retrying = false;
    }
    return this;
  }
  abortSend() {
    this.abortController.abort();
    this.abortController = new AbortController();
    return this;
  }
  header(record: Record<string, string>) {
    Object.assign(this.options.headers, record);
    return this;
  }
  endpoint(path: string) {
    this.options.endpoint = '/' + path;
    return this;
  }
  query(param: object) {
    this.options.query = '?' + toQueries(param);
    return this;
  }
  async send(body: Body | null = null) {
    this.options.debug && console.time('Send Request');
    let id: any = 0;
    const request = new Request(this.options.url + this.options.endpoint + this.options.query, {
      body,
      cache: this.options.cache,
      headers: this.options.headers,
      method: this.options.method,
      mode: this.options.cors,
      signal: this.abortController.signal,
    });
    if (this.options.timeout) {
      id = setTimeout(() => {
        this.abortSend();
      }, this.options.timeout);
    }
    try {
      return this.sending(request);
    } catch (error: any) {
      console.dir(error);
      if (error.message == ERR_NET_OFFLINE) {
        throw new TypeError(ERR_NET_OFFLINE);
      } else {
        throw error.constructor(error.message);
      }
    } finally {
      clearTimeout(id);
      this.options.debug && console.timeEnd('Send Request');
    }
  }
  protected async sending(request: Request) {
    if (this.options.method == 'GET') {
      const cache = await caches.open(this.cacheName);
      if (this.options.strategy == 'revalidate') {
        return this.cacheRevalidate(request, cache);
      } else if (this.options.strategy == 'cache-first') {
        return this.cacheFirst(request, cache);
      } else if (this.options.strategy == 'net-first') {
        return this.netFirst(request, cache);
      } else if (this.options.strategy == 'cache-only') {
        return this.cacheOnly(cache, request);
      }
    }
    if (navigator.onLine) {
      return fetch(request);
    } else {
      throw new TypeError(ERR_NET_OFFLINE);
    }
  }
  protected async cacheRevalidate(request: Request, cache: Cache) {
    let response = await cache.match(request, this.cacheOptions);
    if (response) {
      this.waitCachePut(cache, request);
    } else {
      response = await fetch(request);
      this.waitCachePut(cache, request, response.clone());
    }
    return response;
  }
  protected async cacheFirst(request: Request, cache: Cache) {
    let response = await cache.match(request, this.cacheOptions);
    if (!response) {
      response = await fetch(request);
      this.waitCachePut(cache, request, response.clone());
    }
    return response;
  }
  protected netFirst(request: Request, cache: Cache) {
    return fetch(request)
      .then((response) => {
        if (response.ok) {
          this.waitCachePut(cache, request, response.clone());
          return response;
        } else {
          return this.cacheOnly(cache, request);
        }
      })
      .catch(async (error) => {
        return this.cacheOnly(cache, request);
      });
  }
  protected cacheOnly(cache: Cache, request: Request) {
    return cache.match(request, this.cacheOptions)
      .then((response) => {
        if (response) {
          return response;
        } else {
          return this.createNotFound();
        }
      });
  }
  protected waitCachePut(cache: Cache, request: Request, response?: Response) {
    return wait({
      timeout: 12,
      callback: async () => {
        if (!response) {
          response = await fetch(request);
        }
        if (response.ok) {
          cache.put(request, response);
        }
      },
    })
  }
  protected createNotFound() {
    if (this.notFound) {
      return this.notFound.clone();
    } else {
      this.notFound = new Response(null, {
        status: 404,
        statusText: 'Not Found'
      });
      return this.notFound.clone();
    }
  }
}
