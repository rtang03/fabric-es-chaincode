import util from 'util';
import { Context } from 'fabric-contract-api';
import { keys, omit } from 'lodash';
import { Commit } from '..';
import { serialize, splitKey } from '.';

export class StateList {
  constructor(public ctx: Context, public name: string) {}

  async getQueryResult(
    attributes: string[],
    plainObject?: boolean
  ): Promise<Record<string, Partial<Commit>> | Buffer> {
    const promises = this.ctx.stub.getStateByPartialCompositeKey('entities', attributes);
    const result: Record<string, Partial<Commit>> = {};

    try {
      for await (const res of promises) {
        const commit = JSON.parse(res.value.toString()) as Commit;
        result[commit.commitId] = omit(commit, 'key');
      }
    } catch (e) {
      console.error(e);
      throw new Error(util.format('fail to getQueryResult, %j', e));
    }
    return plainObject ? result : Buffer.from(JSON.stringify(result));
  }

  // Return values:
  //  0 - entity lifecycle not started
  //  1 - entity lifecycle started
  // -1 - entity lifecycle ended
  // -2 - entity lifecycle ended without starting
  async checkLifecycle(attributes: string[]): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      const promises = this.ctx.stub.getStateByPartialCompositeKey('entities', attributes);
      try {
        let started = 0;
        let ended = 0;
        for await (const res of promises) {
          const commit = omit(JSON.parse(res.value.toString()) as Commit, 'key');
          started += commit.events.filter(e => e.lifeCycle && e.lifeCycle === 1).length;
          ended += commit.events.filter(e => e.lifeCycle && e.lifeCycle === 2).length;
        }

        if (started > 0 && ended === 0) {
          resolve(1);
        } else if (started > 0 && ended > 0) {
          resolve(-1);
        } else if (started === 0 && ended > 0) {
          console.log('Lifecycle ended without starting');
          resolve(-2);
        } else {
          resolve(0);
        }
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async addState(commit: Commit): Promise<void> {
    await this.ctx.stub.putState(
      this.ctx.stub.createCompositeKey(this.name, splitKey(commit.key)),
      serialize(commit)
    );
  }

  async getState(key: string): Promise<Commit | Record<string, unknown>> {
    let result: Commit | Record<string, unknown>;

    const data = await this.ctx.stub.getState(
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

  async deleteState(commit: Commit): Promise<void> {
    await this.ctx.stub.deleteState(
      this.ctx.stub.createCompositeKey(this.name, splitKey(commit.key))
    );
  }

  async deleteStateByEnityId(attributes: string[]): Promise<Buffer> {
    const promises = this.ctx.stub.getStateByPartialCompositeKey('entities', attributes);
    const result = {};
    try {
      for await (const res of promises) {
        const { key, commitId } = JSON.parse(res.value.toString()) as {
          key: string;
          commitId: string;
        };
        await this.ctx.stub.deleteState(
          this.ctx.stub.createCompositeKey('entities', splitKey(key))
        );
        result[commitId] = {};
      }
    } catch (e) {
      console.error(e);
      throw new Error(util.format('fail to deleteStateByEnityId, %j', e));
    }

    const message = `${keys(result).length} record(s) deleted`;

    return Buffer.from(JSON.stringify({ status: 'SUCCESS', message, result }));
  }
}
