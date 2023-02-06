export type ChatMemberStatus =
  | 'creator'
  | 'administrator'
  | 'member'
  | 'restricted'
  | 'left'
  | 'kicked';

export type RecievedUser = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  is_bot?: boolean;
  language_code?: string;
  status?: ChatMemberStatus;
};
export type StoreUserInfo = {
  PK: string;
  SK: string;
  registration_date: number;
};
export type StoredUser = RecievedUser & StoreUserInfo;

export type UserTimersSettings = {
  reminder_timers: Array<string>;
  time_offset: number;
  notify: boolean;
};

export type UserState = {
  emotion: string;
  energy: number;
  timestamp: string;
};

import { Handler } from '@yandex-cloud/function-types';

export enum PATHS {
  settings = 'settings',
}

export enum Command {
  getState = 'getState',
  getSettings = 'getSettings',
  putState = 'putState',
  updateSettings = 'updateSettings',
  getUser = 'getUser',
  putUser = 'putUser',
  updateUserStatus = 'updateUserStatus',
}

type HandlerParameters = Parameters<Handler.Http>;

type RequestContext = {
  requestContext: {
    apiGateway?: {
      operationContext?: { command?: Command };
    };
    authorizer?: {
      userId?: number;
    };
  };
};

type Return = {
  statusCode: number;
  body: string;
};

export type Handler = (
  event: HandlerParameters[0] & RequestContext,
  context: HandlerParameters[1],
) => Promise<Return>;
