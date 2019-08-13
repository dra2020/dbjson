import * as Context from '@dra2020/context';
import * as LogAbstract from '@dra2020/logabstract';
import * as FSM from '@dra2020/fsm';
import * as Storage from '@dra2020/storage';
import * as DB from '@dra2020/dbabstract';
interface DBJSONEnvironment {
    context: Context.IContext;
    log: LogAbstract.ILog;
    fsmManager: FSM.FsmManager;
    storageManager: Storage.StorageManager;
}
export declare class JsonBlob extends Storage.StorageBlob {
    options: any;
    value: any;
    fsm: FSM.Fsm;
    constructor(env: DBJSONEnvironment, id: string, fsm: FSM.Fsm, options: any);
    readonly env: DBJSONEnvironment;
    endSave(br: Storage.BlobRequest): void;
    endLoad(br: Storage.BlobRequest): void;
    endDelete(br: Storage.BlobRequest): void;
    fromString(s: string): void;
    asString(): string;
}
export declare class JsonClient extends DB.DBClient {
    constructor(env: DBJSONEnvironment);
    readonly env: DBJSONEnvironment;
    createCollection(name: string, options: any): DB.DBCollection;
    createUpdate(col: JsonCollection, query: any, values: any): DB.DBUpdate;
    createDelete(col: JsonCollection, query: any): DB.DBDelete;
    createFind(col: JsonCollection, filter: any): DB.DBFind;
    createQuery(col: JsonCollection, filter: any): DB.DBQuery;
    createIndex(col: JsonCollection, uid: string): DB.DBIndex;
    createClose(): DB.DBClose;
    tick(): void;
}
export declare class JsonCollection extends DB.DBCollection {
    blob: JsonBlob;
    constructor(env: DBJSONEnvironment, client: JsonClient, name: string, options: any);
    save(): void;
    tick(): void;
}
export declare class JsonUpdate extends DB.DBUpdate {
    constructor(env: DBJSONEnvironment, col: JsonCollection, query: any, values: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonDelete extends DB.DBDelete {
    constructor(env: DBJSONEnvironment, col: JsonCollection, query: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonFind extends DB.DBFind {
    constructor(env: DBJSONEnvironment, col: JsonCollection, filter: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonQuery extends DB.DBQuery {
    constructor(env: DBJSONEnvironment, col: JsonCollection, filter: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonIndex extends DB.DBIndex {
    constructor(env: DBJSONEnvironment, col: JsonCollection, uid: string);
    tick(): void;
}
export declare class JsonClose extends DB.DBClose {
    constructor(env: DBJSONEnvironment, client: JsonClient);
}
export {};
