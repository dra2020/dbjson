import * as FSM from '@terrencecrowley/fsm';
import * as Storage from '@terrencecrowley/storage';
import * as DB from '@terrencecrowley/dbabstract';
export declare class JsonBlob extends Storage.StorageBlob {
    options: any;
    value: any;
    fsm: FSM.Fsm;
    constructor(id: string, fsm: FSM.Fsm, options: any);
    endSave(br: Storage.BlobRequest): void;
    endLoad(br: Storage.BlobRequest): void;
    endDelete(br: Storage.BlobRequest): void;
    fromString(s: string): void;
    asString(): string;
}
export declare class JsonClient extends DB.DBClient {
    constructor(storageManager: Storage.StorageManager);
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
    constructor(typeName: string, client: JsonClient, name: string, options: any);
    save(): void;
    tick(): void;
}
export declare class JsonUpdate extends DB.DBUpdate {
    constructor(typeName: string, col: JsonCollection, query: any, values: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonDelete extends DB.DBDelete {
    constructor(typeName: string, col: JsonCollection, query: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonFind extends DB.DBFind {
    constructor(typeName: string, col: JsonCollection, filter: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonQuery extends DB.DBQuery {
    constructor(typeName: string, col: JsonCollection, filter: any);
    readonly blob: JsonBlob;
    tick(): void;
}
export declare class JsonIndex extends DB.DBIndex {
    constructor(typeName: string, col: JsonCollection, uid: string);
    tick(): void;
}
export declare class JsonClose extends DB.DBClose {
    constructor(typeName: string, client: JsonClient);
}
