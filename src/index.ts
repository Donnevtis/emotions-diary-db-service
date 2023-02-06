import { addState, getSettingsById, getStateById, putUser, setStatus, updateSettings } from './api';
import { ChatMemberStatus, Command, Handler } from './types';
import { logger } from './utils';

export const handler: Handler = async ({ body, requestContext, queryStringParameters }) => {
  const response = (data: any) => ({ body: JSON.stringify(data), statusCode: 200 });
  const success = { message: 'ok' };
  const { apiGateway, authorizer } = requestContext;
  const id = authorizer?.userId || Number(queryStringParameters.user_id);
  const command = apiGateway?.operationContext?.command;

  if (!id) {
    return { body: 'Id not found', statusCode: 400 };
  }

  try {
    switch (command) {
      case Command.getState: {
        return response(await getStateById(id));
      }
      case Command.putState: {
        await addState(id, JSON.parse(body));
        return response(success);
      }
      case Command.getSettings: {
        return response(await getSettingsById(id));
      }
      case Command.updateSettings: {
        await updateSettings(id, JSON.parse(body));
        return response(success);
      }
      case Command.putUser: {
        await putUser(JSON.parse(body));
        return response(success);
      }
      case Command.updateUserStatus: {
        await setStatus(id, body as ChatMemberStatus);
        return response(success);
      }
      default:
        return { body: `command '${command}' not found`, statusCode: 400 };
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(JSON.stringify(error.cause));
      return { body: error.message, statusCode: 400 };
    }
    throw error;
  }
};
