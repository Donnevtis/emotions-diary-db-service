import { Handler } from '@yandex-cloud/function-types'

export type ChatMemberStatus =
  | 'creator'
  | 'administrator'
  | 'member'
  | 'restricted'
  | 'left'
  | 'kicked'

export type RecievedUser = {
  id: number
  username: string
  first_name?: string
  last_name?: string
  is_bot?: boolean
  language_code?: string
  status?: ChatMemberStatus
}
export type StoreUserInfo = {
  PK: string
  SK: string
  registration_date: number
}
export type StoredUser = RecievedUser & StoreUserInfo

export type UserTimersSettings = {
  user_id: number
  reminder_timers: Array<string>
  time_offset: number
  notify: boolean
}

export type UserState = {
  emotion: string
  energy: number
  timestamp: number
  timezone: string
  state_id?: string
}

export enum PATHS {
  settings = 'settings',
}

export enum Command {
  getUser = 'getUser',
  putUser = 'putUser',
  getState = 'getState',
  putState = 'putState',
  getSettings = 'getSettings',
  putSettings = 'putSettings',
  updateSettings = 'updateSettings',
  updateUserStatus = 'updateUserStatus',
  findUsersByTimer = 'findUsersByTimer',
}

type HandlerParameters = Parameters<Handler.Http>

type RequestContext = {
  requestContext: {
    apiGateway?: {
      operationContext?: { command?: Command }
    }
    authorizer?: {
      userId?: number
    }
  }
}

type Return = {
  statusCode: number
  body: string
}

export type Handler = (
  event: HandlerParameters[0] & RequestContext,
  context: HandlerParameters[1],
) => Promise<Return>
