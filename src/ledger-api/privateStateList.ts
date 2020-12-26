import util from 'util';
import { Context } from 'fabric-contract-api';
import omit from 'lodash/omit';
import { Commit } from '..';
import { isCommit, serialize, splitKey } from '.';

export class PrivateStateList {
  constructor(public ctx: Context, public name: string) {}

  async getQueryResult(collection: string, attributes: string[]): Promise<Buffer> {
    const promises = this.ctx.stub.getPrivateDataByPartialCompositeKey(
      collection,
      'entities',
      attributes
    );
    const result: any = {};

    try {
      for await (const res of promises) {
        const commit = JSON.parse(res.value.toString()) as Commit;

        if (isCommit(commit)) {
          result[commit.commitId] = omit(commit, 'key');
        } else
          console.error('unexpect error: when running getQueryResult, the commit is malformed.');
      }
    } catch (e) {
      console.error(e);
      throw new Error(util.format('fail to getQueryResult, %j', e));
    }

    return Buffer.from(JSON.stringify(result));
  }

  async addState(collection: string, commit: Commit): Promise<void> {
    await this.ctx.stub.putPrivateData(
      collection,
      this.ctx.stub.createCompositeKey(this.name, splitKey(commit.key)),
      serialize(commit)
    );
  }

  async getState(collection: string, key: string): Promise<Commit | Record<string, unknown>> {
    let result: Commit | Record<string, unknown>;

    const data = await this.ctx.stub.getPrivateData(
      collection,
      this.ctx.stub.createCompositeKey(this.name, splitKey(key))
    );

    try {
      result = data.toString() ? (JSON.parse(data.toString()) as Commit) : {};
    } catch (e) {
      console.error(e);
      throw new Error(util.format('fail to parse data, %j', e));
    }

    return result;
  }

  async deleteState(collection: string, { key }: Commit): Promise<void> {
    await this.ctx.stub.deletePrivateData(
      collection,
      this.ctx.stub.createCompositeKey(this.name, splitKey(key))
    );
  }
}
