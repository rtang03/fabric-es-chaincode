import { assign } from 'lodash';
import { BaseEvent, Commit } from './commit';

export const splitKey: (key: string) => string[] = (key) => key.split('~');

export const makeKey: (keyParts: string[]) => string = (keyParts) =>
  keyParts.map((part) => JSON.stringify(part)).join('~');

export const serialize: (object: any) => Buffer = (object) => Buffer.from(JSON.stringify(object));

export const toRecord: (commit: Partial<Commit>) => Record<string, Partial<Commit>> = (commit) =>
  assign({}, { [commit.commitId]: commit });

export const createCommitId: () => string = () =>
  `${new Date(Date.now()).toISOString().replace(/[^0-9]/g, '')}`;

export const createInstance: (option: {
  id: string;
  entityName: string;
  version: string;
  mspId: string;
  events: BaseEvent[];
  commitId: string;
  signedRequest: string;
}) => Commit = (option) =>
  option.signedRequest
    ? new Commit({
        id: option.id,
        entityName: option.entityName,
        commitId: option.commitId,
        version: parseInt(option.version, 10),
        mspId: option.mspId,
        events: option.events,
        entityId: option.id,
        signedRequest: option.signedRequest,
      })
    : new Commit({
        id: option.id,
        entityName: option.entityName,
        commitId: option.commitId,
        version: parseInt(option.version, 10),
        mspId: option.mspId,
        events: option.events,
        entityId: option.id,
        signedRequest: '',
      });

// type guard for transient data
export const isEventArray = (
  value: unknown
): value is { type: string; lifeCycle?: number; payload: any }[] =>
  Array.isArray(value) && value.every((item: { type: string }) => typeof item?.type === 'string');

export const isCommit = (
  value:
    | {
        commitId: string;
        id: string;
        key: string;
        entityId: string;
        version: string | number;
        entityName: string;
      }
    | Record<string, unknown>
): value is Partial<Commit> =>
  value?.commitId !== undefined &&
  value?.id !== undefined &&
  value?.key !== undefined &&
  value?.entityId !== undefined &&
  value?.version !== undefined &&
  value?.entityName !== undefined;
