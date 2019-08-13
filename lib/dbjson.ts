// Node
import * as fs from 'fs';

// Shared libraries
import * as Util from '@dra2020/util';
import * as Context from '@dra2020/context';
import * as LogAbstract from '@dra2020/logabstract';
import * as FSM from '@dra2020/fsm';
import * as Storage from '@dra2020/storage';
import * as DB from '@dra2020/dbabstract';


interface DBJSONEnvironment
{
  context: Context.IContext;
  log: LogAbstract.ILog;
  fsmManager: FSM.FsmManager;
  storageManager: Storage.StorageManager;
}

// JSONDB Collection Options:
//  map: true if data is a map (object), false/nonexistent if an array
//  version: current state version (if undefined, value is directly contents of JSON blob)
//  name: if version specified, name is the property name of the value field in the JSON object
//  noobject: if set and true, indicates that the value is a direct value (string) rather than an object with fields
//

export class JsonBlob extends Storage.StorageBlob
{
  options: any;
  value: any;
  fsm: FSM.Fsm;

  constructor(env: DBJSONEnvironment, id: string, fsm: FSM.Fsm, options: any)
  {
    if (id.indexOf('.json') == -1)
      id += '.json';
    super(env, id);

    this.options = options;
    this.value = null;
    this.fsm = fsm;
  }

  get env(): DBJSONEnvironment { return this._env as DBJSONEnvironment; }

  endSave(br: Storage.BlobRequest): void
  {
    if (br.result() != Storage.ESuccess)
    {
      this.env.log.error('jsondb: json save failed');
    }
    else
    {
      this.env.log.event('jsondb: save succeeded');
    }
  }

  endLoad(br: Storage.BlobRequest): void
    {
      if (br.result() != Storage.ESuccess)
      {
        // Special case our bootstrapping state
        if (br.result() === Storage.ENotFound)
        {
          if (this.options.map)
            this.value = {};
          else
            this.value = [];
          this.setLoaded(Storage.StorageStateClean);
          this.env.log.event('jsondb: initializing ${this.id} to empty state');
          this.fsm.setState(FSM.FSM_DONE);
        }
        else
        {
          this.env.log.error(`JsonBlob: load of ${this.id} failed: ${br.asError()}`);
          this.fsm.setState(FSM.FSM_ERROR);
          this.env.log.error('jsondb: load failed');
        }
      }
      else
      {
        this.fromString(br.asString());
        this.fsm.setState(FSM.FSM_DONE);
        this.env.log.event('jsondb: load succeeded');
      }
    }

  endDelete(br: Storage.BlobRequest): void
    {
      if (br.result() != Storage.ESuccess)
      {
        this.env.log.event('jsondb: delete failed');
      }
    }

  fromString(s: string): void
    {
      try
      {
        let o: any = JSON.parse(s);
        if (this.options.version === undefined)
          this.value = o;
        else if (o.version != this.options.version)
          this.env.log.error(`jsonBlob: version mismatch for ${this.id}: expected ${this.options.version} != ${o.version}`);
        else if (o[this.options.name] === undefined)
          this.env.log.error(`jsonBlob: missing value for ${this.id}: expected ${this.options.name}`);
        else
          this.value = o[this.options.name];
        if (this.value)
        {
          if (this.options.map)
            this.env.log.event(`jsondb: JsonBlob: successful load of ${this.id}: hashmap`);
          else
            this.env.log.event(`INFO: JsonBlob: successful load of ${this.id}: array of ${this.value.length} items`);
        }
      }
      catch (err)
      {
        this.env.log.error(`JsonBlob: unexpected exception in JSON parse: ${err.message}`);
      }
    }

  asString(): string
    {
      let o: any;

      if (this.options.version !== undefined)
        o = { version: this.options.version, [this.options.name]: this.value };
      else
        o = this.value;
      return JSON.stringify(o);
    }
}

export class JsonClient extends DB.DBClient
{
  constructor(env: DBJSONEnvironment)
  {
    super(env);
  }

  get env(): DBJSONEnvironment { return this._env as DBJSONEnvironment; }

  createCollection(name: string, options: any): DB.DBCollection
  {  
    return new JsonCollection(this.env, this, name, options);
  }

  createUpdate(col: JsonCollection, query: any, values: any): DB.DBUpdate
  {
    return new JsonUpdate(this.env, col, query, values);
  }

  createDelete(col: JsonCollection, query: any): DB.DBDelete
  {
    return new JsonDelete(this.env, col, query);
  }

  createFind(col: JsonCollection, filter: any): DB.DBFind
  {
    return new JsonFind(this.env, col, filter);
  }

  createQuery(col: JsonCollection, filter: any): DB.DBQuery
  {
    return new JsonQuery(this.env, col, filter) as DB.DBQuery;
  }

  createIndex(col: JsonCollection, uid: string): DB.DBIndex
  {
    return new JsonIndex(this.env, col, uid) as DB.DBIndex;
  }

  createClose(): DB.DBClose
  {
    return new JsonClose(this.env, this) as DB.DBClose;
  }

  tick(): void
  {
    if (this.ready && this.state == FSM.FSM_STARTING)
    {
      // All the work is done at the collection level
      this.setState(FSM.FSM_DONE);
    }
    if (this.state == DB.FSM_NEEDRELEASE)
    {
      this.setState(FSM.FSM_RELEASED);
      this.env.log.event(`jsondb: client closed`);
    }
  }
}

export class JsonCollection extends DB.DBCollection
{
  blob: JsonBlob;

  constructor(env: DBJSONEnvironment, client: JsonClient, name: string, options: any)
  {
    super(env, client, name, options);
    this.waitOn(client);
    this.blob = new JsonBlob(env, name, this, options);
    this.save = this.save.bind(this);
    setTimeout(this.save, 30000);
  }

  save(): void
  {
    this.blob.checkSave(this.client.env.storageManager);
    setTimeout(this.save, 30000);
  }

  tick(): void
  {
    if (this.ready && this.state == FSM.FSM_STARTING)
    {
      this.setState(FSM.FSM_PENDING);
      this.blob.startLoad(this.client.env.storageManager);  // Done or failed state set in endLoad
    }
  }
}

export class JsonUpdate extends DB.DBUpdate
{
  constructor(env: DBJSONEnvironment, col: JsonCollection, query: any, values: any)
  {
    super(env, col, query, values);
    this.waitOn(col);
  }

  get blob(): JsonBlob
  {
    let c: JsonCollection = this.col as JsonCollection;
    return c.blob;
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready && this.state == FSM.FSM_STARTING)
    {
      let value: any = this.blob.value;
      if (this.col.options.map)
      {
        let o: any = value[this.query.id];
        if (this.col.options.noobject)
        {
          value[this.query.id] = Util.shallowCopy(this.values.value);
        }
        else
        {
          if (o === undefined)
            value[this.query.id] = Util.shallowCopy(this.values);
          else
            Util.shallowAssign(o, this.values);
        }
      }
      else
      {
        let o: any = undefined;
        for (let i: number = 0; o === undefined && i < value.length; i++)
          if (value[i]['id'] == this.query.id)
            o = value[i];
        if (o === undefined)
          value.push(Util.shallowCopy(this.values))
        else
          Util.shallowAssign(o, this.values);
      }
      this.blob.setDirty();
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class JsonDelete extends DB.DBDelete
{
  constructor(env: DBJSONEnvironment, col: JsonCollection, query: any)
  {
    super(env, col, query);
    this.waitOn(col);
  }

  get blob(): JsonBlob
  {
    let c: JsonCollection = this.col as JsonCollection;
    return c.blob;
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready && this.state == FSM.FSM_STARTING)
    {
      let value: any = this.blob.value;
      if (this.col.options.map)
        delete value[this.query.id];
      else
      {
        for (let i: number = 0; i < value.length; i++)
          if (value[i]['id'] == this.query.id)
          {
            value.splice(i, 1);
            break;
          }
      }
      this.blob.setDirty();
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class JsonFind extends DB.DBFind
{
  constructor(env: DBJSONEnvironment, col: JsonCollection, filter: any)
  {
    super(env, col, filter);
    this.waitOn(col);
  }

  get blob(): JsonBlob
  {
    let c: JsonCollection = this.col as JsonCollection;
    return c.blob;
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready && this.state == FSM.FSM_STARTING)
    {
      let value: any = this.blob.value;
      if (this.col.options.map)
      {
        if (this.filter.id !== undefined)
        {
          let result: any = value[this.filter.id];
          if (result && this.col.options.noobject)
            result = { id: this.filter.id, value: result };
          if (result !== undefined && Util.partialEqual(result, this.filter))
            this.result = result;
        }
        else
        {
          if (this.col.options.noobject)
            throw 'error: cannot call Find without id property on noobject collection';
          for (let id in value) if (value.hasOwnProperty(id))
            if (Util.partialEqual(value[id], this.filter))
            {
              this.result = value[id];
              break;
            }
        }
      }
      else
      {
        for (let i: number = 0; i < value.length; i++)
          if (Util.partialEqual(value[i], this.filter))
          {
            this.result = value[i];
            break;
          }
      }
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class JsonQuery extends DB.DBQuery
{
  constructor(env: DBJSONEnvironment, col: JsonCollection, filter: any)
  {
    super(env, col, filter);
    this.waitOn(col);
  }

  get blob(): JsonBlob
  {
    let c: JsonCollection = this.col as JsonCollection;
    return c.blob;
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready && this.state == FSM.FSM_STARTING)
    {
      this.result = [];
      let value: any = this.blob.value;
      if (this.col.options.map)
      {
        if (this.col.options.noobject)
          throw 'error: cannot call Query on noobject collection';

        for (let id in value) if (value.hasOwnProperty(id))
          if (Util.partialEqual(value[id], this.filter))
            this.result.push(value[id]);
      }
      else
      {
        for (let i: number = 0; i < value.length; i++)
          if (Util.partialEqual(value[i], this.filter))
            this.result.push(value[i]);
      }
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class JsonIndex extends DB.DBIndex
{
  constructor(env: DBJSONEnvironment, col: JsonCollection, uid: string)
  {
    super(env, col, uid);
    this.waitOn(col);
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready && this.state == FSM.FSM_STARTING)
    {
      // No index necessary - we do linear search
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class JsonClose extends DB.DBClose
{
  constructor(env: DBJSONEnvironment, client: JsonClient)
  {
    super(env, client);
  }
}
