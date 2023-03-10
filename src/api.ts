import {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  QueryOutput,
} from '@aws-sdk/client-dynamodb'

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import dynamodb from './client'
import {
  validateSettings,
  validateState,
  validateStatus,
  validateUser,
} from './validators'
import { errorHandler } from './utils'
import { ChatMemberStatus, RecievedUser, UserState } from './types'
import { StoredUser, UserTimersSettings } from './types'
import crypto from 'node:crypto'

const CONDITION_CHECK_FAILED = 'ConditionalCheckFailedException'

const dbErrorHandler = errorHandler('Database exception')

export const getUser = async (id: number): Promise<StoredUser | null> => {
  try {
    const input = new GetItemCommand({
      TableName: 'Users',
      Key: marshall({
        PK: `user#${id}`,
        SK: `#metadata#${id}`,
      }),
    })

    const { Item } = await dynamodb.send(input)

    return Item ? (unmarshall(Item) as StoredUser) : null
  } catch (error) {
    return dbErrorHandler(error, getUser.name, {
      id,
    })
  }
}

export const findUsersByTimer = async (time: string) => {
  try {
    const input = new QueryCommand({
      TableName: 'Users',
      IndexName: 'InvertedIndex',
      KeyConditionExpression: 'SK = :sk',
      FilterExpression: 'contains(reminder_timers, :t)',
      ExpressionAttributeValues: marshall({
        ':sk': 'reminders',
        ':t': time,
      }),
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'user_id, notify, time_offset',
    })

    const { Items } = await dynamodb.send(input)

    return Items?.length
      ? (Items.map(user => unmarshall(user)) as UserTimersSettings[])
      : null
  } catch (error) {
    return dbErrorHandler(error, findUsersByTimer.name, {
      time,
    })
  }
}

export const putUser = async (user: RecievedUser) => {
  if (!validateUser(user)) {
    throw new Error('Validation exception: invalid user data', {
      cause: validateUser.errors,
    })
  }

  const {
    id,
    first_name = null,
    last_name = null,
    username,
    language_code,
    is_bot,
  } = user

  try {
    const input = new PutItemCommand({
      TableName: 'Users',
      Item: marshall({
        PK: `user#${id}`,
        SK: `#metadata#${id}`,
        id,
        first_name,
        last_name,
        username,
        is_bot,
        registration_date: Date.now(),
        language_code,
        status: 'member',
      }),
      ConditionExpression: 'attribute_not_exists(SK)',
    })

    return await dynamodb.send(input)
  } catch (error) {
    if (error instanceof Error && error.name === CONDITION_CHECK_FAILED) {
      return setStatus(id, 'member')
    }

    return dbErrorHandler(error, putUser.name, user)
  }
}

export const setStatus = (id: number, status: ChatMemberStatus) => {
  if (!validateStatus(status)) {
    throw new Error('Validation exception: invalid status', {
      cause: validateUser.errors,
    })
  }

  dynamodb
    .send(
      new UpdateItemCommand({
        TableName: 'Users',
        Key: marshall({
          PK: `user#${id}`,
          SK: `#metadata#${id}`,
        }),
        UpdateExpression: 'set status = :s',
        ExpressionAttributeValues: marshall({
          ':s': status,
        }),
      }),
    )
    .catch(error => dbErrorHandler(error, setStatus.name, { id, status }))
}

//ISSUE: TransactWriteItemsCommand does not work with a single table
export const kickUser = (id: number) => {
  const input = new DeleteItemCommand({
    TableName: 'Users',
    Key: marshall({
      PK: `user#${id}`,
      SK: 'reminders',
    }),
  })

  return Promise.all([setStatus(id, 'kicked'), dynamodb.send(input)]).catch(
    error => dbErrorHandler(error, kickUser.name, { id }),
  )
}

export const getSettingsById = async (id: number) => {
  try {
    const input = new GetItemCommand({
      TableName: 'Users',
      Key: marshall({
        PK: `user#${id}`,
        SK: 'reminders',
      }),
      ProjectionExpression: 'reminder_timers, time_offset, notify',
    })

    const { Item } = await dynamodb.send(input)

    return Item ? (unmarshall(Item) as UserTimersSettings) : null
  } catch (error) {
    return dbErrorHandler(error, getSettingsById.name, {
      id,
    })
  }
}

export const putSettings = (user_id: number, settings: UserTimersSettings) => {
  if (!validateSettings(settings)) {
    throw new Error('Validation exception: invalid user settings', {
      cause: validateSettings.errors,
    })
  }

  const { reminder_timers, time_offset, notify } = settings

  return dynamodb
    .send(
      new PutItemCommand({
        TableName: 'Users',
        Item: marshall({
          PK: `user#${user_id}`,
          SK: 'reminders',
          reminder_timers,
          time_offset,
          notify,
          user_id,
        }),
        ConditionExpression: 'attribute_not_exists(reminder_timers)',
      }),
    )
    .catch(error => {
      if (error instanceof Error && error.name === CONDITION_CHECK_FAILED) {
        return 'Attribute already exists'
      }

      return dbErrorHandler(error, updateSettings.name, settings)
    })
}

export const updateSettings = (id: number, settings: UserTimersSettings) => {
  if (!validateSettings(settings)) {
    throw new Error('Validation exception: invalid user settings', {
      cause: validateSettings.errors,
    })
  }

  const { reminder_timers, time_offset, notify } = settings

  return dynamodb
    .send(
      new UpdateItemCommand({
        TableName: 'Users',
        Key: marshall({
          PK: `user#${id}`,
          SK: 'reminders',
        }),
        UpdateExpression:
          'set reminder_timers = :r, user_id = :u, time_offset = :t, notify = :n',
        ExpressionAttributeValues: marshall({
          ':r': reminder_timers,
          ':t': time_offset,
          ':n': notify,
          ':u': id,
        }),
      }),
    )
    .catch(error =>
      dbErrorHandler(error, updateSettings.name, {
        id,
        reminder_timers,
        time_offset,
      }),
    )
}

export const updateLanguageSettings = (id: number, language_code: string) =>
  dynamodb
    .send(
      new UpdateItemCommand({
        TableName: 'Users',
        Key: marshall({
          PK: `user#${id}`,
          SK: `#metadata#${id}`,
        }),
        UpdateExpression: 'set language_code = :l',
        ExpressionAttributeValues: marshall({
          ':l': language_code,
        }),
      }),
    )
    .catch(error =>
      dbErrorHandler(error, updateLanguageSettings.name, {
        id,
        language_code,
      }),
    )

export const getStateById = async (
  id: number,
  start = '0',
  end = Date.now().toString(),
  ExclusiveStartKey?: QueryOutput['LastEvaluatedKey'],
) => {
  try {
    const input = new QueryCommand({
      TableName: 'Users',
      KeyConditionExpression: 'PK = :pk and SK BETWEEN :start AND :end',
      ExpressionAttributeValues: marshall({
        ':pk': `user#${id}#state`,
        ':start': start,
        ':end': end,
      }),
      ProjectionExpression: 'state_id, emotion, energy, timestamp, timezone',
      ScanIndexForward: false,
      ExclusiveStartKey,
    })

    const { Items, LastEvaluatedKey } = await dynamodb.send(input)

    const states = Items?.length
      ? (Items.map(emotion => unmarshall(emotion)) as UserState[])
      : null

    if (LastEvaluatedKey) {
      const recursionStates = await getStateById(
        id,
        start,
        end,
        LastEvaluatedKey,
      )
      if (recursionStates) {
        states?.push(...recursionStates)
      }
    }

    return states
  } catch (error) {
    return dbErrorHandler(error, getStateById.name, {
      id,
    })
  }
}

export const addState = (id: number, state: UserState) => {
  if (!validateState(state)) {
    throw new Error('Validation exception: invalid state data', {
      cause: validateState.errors,
    })
  }

  const { timestamp, emotion, energy, timezone } = state

  return dynamodb
    .send(
      new PutItemCommand({
        TableName: 'Users',
        Item: marshall({
          PK: `user#${id}#state`,
          SK: String(timestamp),
          state_id: crypto.randomUUID(),
          emotion,
          energy,
          timestamp,
          timezone,
        }),
      }),
    )
    .catch(error =>
      dbErrorHandler(error, addState.name, {
        id,
        emotion,
        energy,
        timestamp,
      }),
    )
}

export const updateState = (id: number, state: UserState) => {
  if (!validateState(state)) {
    throw new Error('Validation exception: invalid state data', {
      cause: validateState.errors,
    })
  }

  const { timestamp, emotion, energy } = state

  return dynamodb
    .send(
      new UpdateItemCommand({
        TableName: 'Users',
        Key: marshall({
          PK: `user#${id}#state`,
          SK: String(timestamp),
        }),
        UpdateExpression: 'set emotion = :em, energy = :en',
        ExpressionAttributeValues: marshall({
          ':em': emotion,
          ':en': energy,
        }),
      }),
    )
    .catch(error =>
      dbErrorHandler(error, addState.name, {
        id,
        emotion,
        energy,
        timestamp,
      }),
    )
}
