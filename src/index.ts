import { EventStore } from './contract/eventstore';
import { PrivateData } from './contract/privatedata';
import { BaseEvent, Commit, createInstance } from './ledger-api';

export { BaseEvent, EventStore, Commit, createInstance };

export const contracts: any[] = [EventStore, PrivateData];
