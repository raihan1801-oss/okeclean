import { Promiseify } from "./helper";

const env = {
  debug: false,
};

export interface DBStoreScheme {
  // [store: string]: {} | string;
}

export interface DBIndexScheme {
  // [index: string]: {};
}

export interface DBScheme<Store =  {}, Index =  {}> {
  store: Store;
  index: Index;
}

interface Options {
  debug?: boolean;
}

type ExtractKey<O> = {
  [P in keyof O]: P;
};

export function open<Scheme extends DBScheme>(
  name: string,
  version?: number,
  opts?: Options
) {
  return new DBOpenRequest<Scheme>(indexedDB.open(name, version), opts);
}

class DBKeyRange {
  static bound(
    lower: any,
    upper: any,
    lowerOpen?: boolean | undefined,
    upperOpen?: boolean | undefined
  ) {
    return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
  }
  static only(value: string | number) {
    return IDBKeyRange.only(value);
  }
  static lowerBound(lower: string | number, open?: boolean | undefined) {
    return IDBKeyRange.lowerBound(lower, open);
  }
  static upperBound(upper: string | number, open?: boolean | undefined) {
    return IDBKeyRange.upperBound(upper, open);
  }
}

export class DBOpenRequest<Scheme extends DBScheme> extends Promiseify<
  DBDatabase<Scheme>
> {
  public options?: Options;
  protected onsuccess = (db: DBDatabase<Scheme>) => {
    this.options?.debug && console.info("[DB] success open", db.name);
  };
  protected onupgrade = (db: DBDatabase<Scheme>) => {
    this.options?.debug && console.info("[DB] success upgrade", db.name);
  };
  protected onerror = (error: any) => {
    this.options?.debug && console.error(error);
  };
  protected onblock = (error: any) => {
    this.options?.debug && console.error(error);
  };

  constructor(openRequest: IDBOpenDBRequest, opts?: Options) {
    super();

    let db: any;
    this.options = opts;

    openRequest.addEventListener("upgradeneeded", (event) => {
      this.onupgrade(
        (db = new DBDatabase<Scheme>(
          openRequest.result,
          openRequest,
          this.options
        ))
      );
    });
    openRequest.addEventListener("success", (event) => {
      this.resolver(
        db ??
          (db = new DBDatabase<Scheme>(
            openRequest.result,
            openRequest,
            this.options
          ))
      );
      this.onsuccess(db);
    });
    openRequest.addEventListener("error", (event) => {
      this.onerror(openRequest.error);
      this.rejector(openRequest.error);
    });
    openRequest.addEventListener("blocked", (event) => {
      this.onblock(openRequest.error);
      this.rejector(openRequest.error);
    });
  }

  onSuccess(handler: (db: DBDatabase<Scheme>) => void) {
    this.onsuccess = handler;
    return this;
  }
  onUpgrade(handler: (db: DBDatabase<Scheme>) => void) {
    this.onupgrade = handler;
    return this;
  }
  onError(handler: (error: any) => void) {
    this.onerror = handler;
    return this;
  }
  onBlock(handler: (error: any) => void) {
    this.onblock = handler;
    return this;
  }
}

type IDBTransactionOptions = {
  durability: "default" | "strict" | "relaxed";
};

class DBDatabase<Scheme extends DBScheme> {
  public options?: Options;
  protected onchange = (db: DBDatabase<Scheme>) => {
    this.options?.debug && console.info("[DB] change:", this.db.name);
  };
  protected onabort = (error: any) => {
    this.options?.debug && console.error(error);
  };
  protected onerror = (error: any) => {
    this.options?.debug && console.error(error);
  };
  protected onclose = (error: any) => {
    this.options?.debug && console.error(error);
  };

  public openRequest: IDBOpenDBRequest;
  public db: IDBDatabase;

  get objectStoreNames() {
    return this.db.objectStoreNames;
  }
  get name() {
    return this.db.name;
  }

  constructor(db: IDBDatabase, openRequest: IDBOpenDBRequest, opts?: Options) {
    this.db = db;
    this.openRequest = openRequest;
    this.options = opts;

    db.addEventListener("versionchange", (event) => {
      this.onchange(this);
    });
    db.addEventListener("abort", (event) => {
      this.onabort((event.target as IDBTransaction).error);
    });
    db.addEventListener("error", (event) => {
      this.onerror((event.target as IDBTransaction).error);
    });
    db.addEventListener("close", (event) => {
      this.onclose("db " + db.name + " closed");
    });
  }

  async create<Name extends keyof Scheme['store']>(
    name: Name,
    options?: IDBObjectStoreParameters
  ): Promise<DBReadWriteObjectStore<Scheme['store'][Name], Scheme['index']>> {
    if (this.openRequest.transaction) {
      return new DBReadWriteObjectStore(
        this.db.createObjectStore(name as string, options)
      );
    } else {
      this.db.close();
      return (
        await open<Scheme>(this.db.name, this.db.version + 1)
      ).create<Name>(name, options);
    }
  }
  delete<Name extends keyof Scheme['store']>(name: Name) {
    this.db.deleteObjectStore(name as string);
    return this;
  }
  close() {
    this.db.close();
    return this;
  }
  contains<Name extends keyof Scheme['store']>(name: Name) {
    return this.db.objectStoreNames.contains(name as string);
  }

  read<Name extends keyof Scheme['store'] | (keyof Scheme['store'])[], Result>(
    name: Name,
    handler: (
      store: Name extends keyof Scheme['store']
        ? DBReadOnlyObjectStore<Scheme['store'][Name], Scheme['index']>
        : { [N in keyof Scheme['store']]: DBReadOnlyObjectStore<Scheme[N], Scheme['index']> }
    ) => Result
  ): DBOperation<Result>;
  read<Name extends keyof Scheme['store'], Result>(
    name: Name,
    handler: (store: DBReadOnlyObjectStore<Scheme['store'][Name], Scheme['index']>) => Result
  ) {
    return new DBOperation<Result>(
      this.db.transaction(name as string | Array<string>, "readonly"),
      handler,
      this.options
    );
  }

  write<Name extends keyof Scheme['store'] | (keyof Scheme['store'])[], Result>(
    name: Name,
    handler: (
      store: Name extends keyof Scheme['store']
        ? DBReadWriteObjectStore<Scheme['store'][Name], Scheme['index']>
        : { [N in keyof Scheme['store']]: DBReadWriteObjectStore<Scheme[N], Scheme['index']> }
    ) => Result
  ): DBOperation<Result>;
  write<Name extends keyof Scheme['store'], Result>(
    name: Name,
    handler: (store: DBReadWriteObjectStore<Scheme['store'][Name], Scheme['index']>) => Result
  ) {
    return new DBOperation<Result>(
      this.db.transaction(name as string | Array<string>, "readwrite"),
      handler,
      this.options
    );
  }

  onChange(handler: (db: DBDatabase<Scheme>) => void) {
    this.onchange = handler;
    return this;
  }
  onAbort(handler: (error: any) => void) {
    this.onabort = handler;
    return this;
  }
  onError(handler: (error: any) => void) {
    this.onerror = handler;
    return this;
  }
  onClose(handler: (error: any) => void) {
    this.onclose = handler;
    return this;
  }
}

// type HandlerOperation<I> = (store: DBStoreOperation<I>) => any;
type InferRequest<O> = O extends IDBRequest<infer T> ? T : never;

class DBRequest {
  promiseifyRequest<T extends IDBRequest<R>, R = InferRequest<T>>(request: T) {
    const promiseify = new Promiseify<R>();
    request.addEventListener("success", (event) => {
      promiseify.resolver((event.target as IDBRequest).result);
    });
    request.addEventListener("error", (event) => {
      promiseify.rejector((event.target as IDBRequest).error);
    });
    return promiseify;
  }
}

class DBReadOnlyObjectStore<Store, Index> extends DBRequest {
  objectStore: IDBObjectStore;
  get name() {
    return this.objectStore.name;
  }
  constructor(objectStore: IDBObjectStore) {
    super();
    this.objectStore = objectStore;
  }
  get(query: IDBValidKey | IDBKeyRange) {
    return this.promiseifyRequest(this.objectStore.get(query)) as Promiseify<
      Store | undefined
    >;
  }
  getAll(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    count?: number | undefined
  ) {
    return this.promiseifyRequest(this.objectStore.getAll(query, count)) as Promiseify<
      Array<Store>
    >;
  }
  getKey(query: IDBValidKey | IDBKeyRange) {
    return this.promiseifyRequest(this.objectStore.getKey(query));
  }
  getAllKeys(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    count?: number | undefined
  ) {
    return this.promiseifyRequest(this.objectStore.getAllKeys(query, count));
  }
  count(key?: IDBValidKey | IDBKeyRange | undefined) {
    return this.promiseifyRequest(this.objectStore.count(key));
  }
  index<Name extends keyof Index>(name: Name) {
    return new DBReadOnlyIndex<Store, any>(this.objectStore.index(name as any));
  }
  openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    direction?: IDBCursorDirection | undefined
  ) {
    return this.objectStore.openKeyCursor(query, direction);
  }
}

class DBReadWriteObjectStore<Store, Index> extends DBReadOnlyObjectStore<Store, Index> {
  clear() {
    return this.promiseifyRequest(this.objectStore.clear());
  }
  add(value: Store) {
    return this.promiseifyRequest(this.objectStore.add(value));
  }
  addAll(values: Array<Store>) {
    const requests: Array<Promiseify<IDBValidKey>> = [];
    for (const value of values) {
      requests.push(this.promiseifyRequest(this.objectStore.add(value)));
    }
    return Promise.allSettled(requests);
  }
  put(value: Store, key?: IDBValidKey | undefined) {
    return this.promiseifyRequest(this.objectStore.put(value, key));
  }
  delete(key: IDBValidKey | IDBKeyRange) {
    return this.promiseifyRequest(this.objectStore.delete(key));
  }
  createIndex<Name extends keyof Index, Key extends keyof Store>(
    name: Name,
    keyPath: Key | Array<Key>,
    options?: IDBIndexParameters | undefined
  ) {
    return new DBReadWriteIndex<Store, Index[Name]>(
      this.objectStore.createIndex(name as string, keyPath as any, options)
    );
  }
  deleteIndex(name: string) {
    return this.objectStore.deleteIndex(name);
  }
  openCursor(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    direction?: IDBCursorDirection | undefined
  ) {
    return this.objectStore.openCursor(query, direction);
  }
}

class DBReadOnlyIndex<Value, Name> extends DBRequest {
  index: IDBIndex;
  constructor(index: IDBIndex) {
    super();
    this.index = index;
  }
  count(key?: IDBValidKey | IDBKeyRange | undefined) {
    return this.promiseifyRequest(this.index.count(key));
  }
  get(key: IDBValidKey | IDBKeyRange) {
    return this.promiseifyRequest(this.index.get(key)) as Promiseify<
      Value | undefined
    >;
  }
  getKey(key: IDBValidKey | IDBKeyRange) {
    return this.promiseifyRequest(this.index.getKey(key));
  }
  getAll(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    count?: number | undefined
  ) {
    return this.promiseifyRequest(
      this.index.getAll(query, count)
    ) as Promiseify<Array<Value>>;
  }
  getAllKeys(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    count?: number | undefined
  ) {
    return this.promiseifyRequest(this.index.getAllKeys(query, count));
  }
  openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    direction?: IDBCursorDirection | undefined
  ) {
    return this.index.openKeyCursor(query, direction);
  }
}

class DBReadWriteIndex<Value, Name> extends DBReadOnlyIndex<Value, Name> {
  openCursor(
    query?: IDBValidKey | IDBKeyRange | null | undefined,
    direction?: IDBCursorDirection | undefined
  ) {
    return this.index.openCursor(query, direction);
  }
}

class DBCursor<Value> {
  constructor() {}
}

class DBOperation<Result> extends Promiseify<Result> {
  public options?: Options;
  protected oncomplete = (result: Result) => {
    this.options?.debug && console.info("[DB] operation complete", result);
  };
  protected onerror = (error: any) => {
    this.options?.debug && console.error(error);
  };
  protected onabort = (error: any) => {
    this.options?.debug && console.error(error);
  };

  constructor(
    transaction: IDBTransaction,
    handler: (store: any) => Result,
    opts?: Options
  ) {
    super();
    let store: any;
    this.options = opts;
    const Construct =
      transaction.mode == "readonly"
        ? DBReadOnlyObjectStore
        : DBReadWriteObjectStore;
    if (transaction.objectStoreNames.length > 1) {
      for (const name of transaction.objectStoreNames) {
        store[name] = new Construct(transaction.objectStore(name));
      }
    } else {
      store = new Construct(
        transaction.objectStore(transaction.objectStoreNames[0])
      );
    }
    const result = handler(store);
    transaction.addEventListener("complete", (event) => {
      this.resolver(result);
      this.oncomplete(result);
    });
    transaction.addEventListener("error", (event) => {
      const error = (event.target as IDBRequest<Result>).error;
      this.rejector(error);
      this.onerror(error);
    });
    transaction.addEventListener("abort", (event) => {
      const error = (event.target as IDBRequest<Result>).error;
      this.rejector(error);
      this.onabort(error);
    });
  }

  complete(handler: (result: Result) => void) {
    this.oncomplete = handler;
    return this;
  }
  error(handler: (error: any) => void) {
    this.onerror = handler;
    return this;
  }
  abort(handler: (error: any) => void) {
    this.onabort = handler;
    return this;
  }
}
