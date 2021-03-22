import { values } from 'lodash';
import { Commit, EventStore } from '..';
import { StateList } from '../ledger-api';

const ctx: any = {
  stub: {
    createCompositeKey: jest.fn(),
    deleteState: jest.fn(),
    getState: jest.fn(),
    putState: jest.fn(),
    setEvent: jest.fn(),
    getStateByPartialCompositeKey: jest.fn(),
    getCreator: jest.fn(),
  },
  clientIdentity: { getID: jest.fn() },
};
const context = {
  stateList: new StateList(ctx, 'entities'),
  ...ctx,
};

ctx.stub.createCompositeKey.mockResolvedValue('entities"en""entId""2019"');
ctx.stub.putState.mockResolvedValue(Buffer.from(''));
ctx.stub.setEvent.mockImplementation((name, args) => console.log(`Event sent: ${name}: ${args}`));
ctx.stub.getCreator.mockImplementation(() => {
  return { mspid: 'Org1MSP' };
});
ctx.clientIdentity.getID.mockImplementation(() => 'Org1MSP');

const cc = new EventStore(context);
const entityName = 'cc_test';
const id = 'cc_01';
const entityId = id;
const version = '0';
const events = [{ type: 'mon', payload: { name: 'jun' } }];
const eventStr = JSON.stringify(events);
const commitId = '123';
const committedAt = '2019';
const value = JSON.stringify({
  key: '123', // any non-null string
  commitId,
  committedAt,
  version,
  entityName,
  id,
  entityId,
  events,
});

ctx.stub.getStateByPartialCompositeKey.mockImplementation(() => {
  let counter = 1;
  return {
    [Symbol.asyncIterator]: () => ({
      next: () => {
        if (counter > 0) {
          counter--;
          return Promise.resolve({ value: { value }, done: false });
        } else return Promise.resolve({ done: true });
      },
    }),
  };
});
ctx.stub.getState.mockResolvedValue(value);

describe('Chaincode Tests', () => {
  it('should instantiate', async () =>
    cc.Init(context).then((response) => expect(response).toEqual('Init Done')));

  it('should createCommit', async () =>
    cc
      .createCommit(context, entityName, id, version, eventStr, commitId, '')
      .then<Commit>((response: any) => values(JSON.parse(response))[0])
      .then(({ id, entityName, version, entityId }) => ({
        id,
        entityName,
        version,
        entityId,
        events,
      }))
      .then((commit) => expect(commit).toMatchSnapshot()));

  it('should queryByEntityName', async () =>
    cc
      .queryByEntityName(context, entityName)
      .then<Record<string, Commit>>((response: any) => JSON.parse(response))
      .then((response) => expect(response).toMatchSnapshot()));

  it('should queryByEntityId', async () =>
    cc
      .queryByEntityId(context, entityName, id)
      .then<Record<string, Commit>>((response: any) => JSON.parse(response))
      .then((response) => expect(response).toMatchSnapshot()));

  it('should queryByEntityIdCommitId', async () =>
    cc
      .queryByEntityIdCommitId(context, entityName, id, commitId)
      .then<Record<string, Commit>>((response: any) => JSON.parse(response))
      .then((response) => expect(response).toMatchSnapshot()));

  it('should deleteByEntityIdCommitId', async () =>
    cc
      .deleteByEntityIdCommitId(context, entityName, id, commitId)
      .then<Record<string, Commit>>((response: any) => JSON.parse(response))
      .then(({ status }) => expect(status).toBe('SUCCESS')));

  it('should deleteByEntityId', async () =>
    cc
      .deleteByEntityId(context, entityName, id)
      .then<Record<string, Commit>>((response: any) => JSON.parse(response))
      .then(({ status }) => expect(status).toBe('SUCCESS')));

  it('should createCommit with signedRequest', async () => {
    const jwt =
      'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE2MTY0MDAzNjEsImV4cCI6MTk1NzQ2MzQyMSwiYXVkIjoiZGlkOmZhYjoweGEzMGUwODJkNjJkZjE2MDFkOGUyZjgyMjQ3N2JjZjI5N2MwZGIxN2YiLCJlbnRpdHlOYW1lIjoiZGlkRG9jdW1lbnQiLCJlbnRpdHlJZCI6IjB4YTMwZTA4MmQ2MmRmMTYwMWQ4ZTJmODIyNDc3YmNmMjk3YzBkYjE3ZiIsInZlcnNpb24iOjAsImV2ZW50cyI6W3sidHlwZSI6IkRpZERvY3VtZW50Q3JlYXRlZCIsImxpZmVDeWNsZSI6MSwicGF5bG9hZCI6eyJjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnL25zL2RpZC92MSIsImlkIjoiZGlkOmZhYjoweGEzMGUwODJkNjJkZjE2MDFkOGUyZjgyMjQ3N2JjZjI5N2MwZGIxN2YiLCJjb250cm9sbGVyIjoiZGlkOmZhYjoweGEzMGUwODJkNjJkZjE2MDFkOGUyZjgyMjQ3N2JjZjI5N2MwZGIxN2YiLCJhdXRoZW50aWNhdGlvbiI6W3siaWQiOiJkaWQ6ZmFiOjB4YTMwZTA4MmQ2MmRmMTYwMWQ4ZTJmODIyNDc3YmNmMjk3YzBkYjE3ZiIsInR5cGUiOiJTZWNwMjU2azFTaWduYXR1cmVBdXRoZW50aWNhdGlvbjIwMTgiLCJwdWJsaWNLZXlIZXgiOiIwNGJjMGJkMjI5MzQwNjk3MWI3NDFiODk2Mjc1ZGRlZTYzZGYwYzI5ZjExNDg4NmFkNjA5NGE5Nzc1MTM3NTY0MjNmMzM3ODlhNThiZjhhYjI1NTQ3NTdhOTgxNmYxZWFkZjIyMTliYWZhZjdkNzQ3MTE4YWFmYzk4MzU3ZGM0OGY4IiwiY29udHJvbGxlciI6ImRpZDpmYWI6MHhhMzBlMDgyZDYyZGYxNjAxZDhlMmY4MjI0NzdiY2YyOTdjMGRiMTdmIn1dLCJ2ZXJpZmljYXRpb25NZXRob2QiOlt7ImlkIjoiZGlkOmZhYjoweGEzMGUwODJkNjJkZjE2MDFkOGUyZjgyMjQ3N2JjZjI5N2MwZGIxN2YiLCJ0eXBlIjoiU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOCIsInB1YmxpY0tleUhleCI6IjA0YmMwYmQyMjkzNDA2OTcxYjc0MWI4OTYyNzVkZGVlNjNkZjBjMjlmMTE0ODg2YWQ2MDk0YTk3NzUxMzc1NjQyM2YzMzc4OWE1OGJmOGFiMjU1NDc1N2E5ODE2ZjFlYWRmMjIxOWJhZmFmN2Q3NDcxMThhYWZjOTgzNTdkYzQ4ZjgiLCJjb250cm9sbGVyIjoiZGlkOmZhYjoweGEzMGUwODJkNjJkZjE2MDFkOGUyZjgyMjQ3N2JjZjI5N2MwZGIxN2YifV0sImNyZWF0ZWQiOiIyMDIxLTAzLTIyVDA4OjA2OjAxLjYxMVoiLCJ1cGRhdGVkIjoiMjAyMS0wMy0yMlQwODowNjowMS42MTFaIiwiX3RzIjpudWxsfX1dLCJpc3MiOiJkaWQ6ZmFiOjB4YTMwZTA4MmQ2MmRmMTYwMWQ4ZTJmODIyNDc3YmNmMjk3YzBkYjE3ZiJ9.x0X9XHqVF4vcCQrwqPjh9QmPM5L3TiT9SbBBGI1Ptm_5zraGEyerztNzNbYaRfiKDggCjiY9glTxE73L85tVXA';

    return cc
      .createCommit(context, entityName, id, version, eventStr, commitId, jwt)
      .then<Commit>((response: any) => values(JSON.parse(response))[0])
      .then(({ id, entityName, version, entityId, signedRequest }) => ({
        id,
        entityName,
        version,
        entityId,
        signedRequest,
      }))
      .then((commit) => {
        expect(commit?.id).toEqual('cc_01');
        expect(commit?.entityName).toEqual('cc_test');
      });
  });
});
