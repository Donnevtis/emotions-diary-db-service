import Ajv, { JSONSchemaType } from 'ajv';
import { ChatMemberStatus, RecievedUser, UserState, UserTimersSettings } from './types';

const ajv = new Ajv();

const userSchema: JSONSchemaType<RecievedUser> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    is_bot: { type: 'boolean', nullable: true },
    first_name: { type: 'string', nullable: true },
    last_name: { type: 'string', nullable: true },
    username: { type: 'string' },
    language_code: { type: 'string', nullable: true },
    status: { type: 'string', nullable: true },
  },
  required: ['id', 'username'],
  additionalProperties: true,
};

export const validateUser = ajv.compile(userSchema);

const stateSchema: JSONSchemaType<UserState> = {
  type: 'object',
  properties: {
    emotion: { type: 'string' },
    energy: { type: 'number' },
    timestamp: { type: 'string' },
  },
  required: ['emotion', 'timestamp', 'energy'],
};

export const validateState = ajv.compile(stateSchema);

const settingsSchema: JSONSchemaType<UserTimersSettings> = {
  type: 'object',
  properties: {
    reminder_timers: { type: 'array', items: { type: 'string' } },
    time_offset: { type: 'number' },
    notify: { type: 'boolean' },
  },
  required: ['reminder_timers', 'time_offset', 'notify'],
};

export const validateSettings = ajv.compile(settingsSchema);

const userStatusSchema: JSONSchemaType<ChatMemberStatus> = {
  type: 'string',
};

export const validateStatus = ajv.compile(userStatusSchema);
