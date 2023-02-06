import { MiBtoByte } from './utils';
import environment from './environment';
import { deploy } from './function-service';
import { FunctionConfig } from './types';

const { FUNCTION_ID, SA_ID, DB_ENDPOINT, REGION, LOCKBOX_ID, LOCKBOX_VERSION } = environment;

const partial: FunctionConfig = {
  functionId: FUNCTION_ID,
  runtime: 'nodejs16',
  entrypoint: 'index.handler',
  resources: {
    memory: MiBtoByte(128),
  },
  executionTimeout: { seconds: 60 },
  environment: {
    DB_ENDPOINT,
    REGION,
  },
  serviceAccountId: SA_ID,
  secrets: [
    {
      id: LOCKBOX_ID,
      versionId: LOCKBOX_VERSION,
      environmentVariable: 'AWS_ACCESS_KEY_ID',
      key: 'SA_KEY_ID',
    },
    {
      id: LOCKBOX_ID,
      versionId: LOCKBOX_VERSION,
      environmentVariable: 'AWS_SECRET_ACCESS_KEY',
      key: 'SA_KEY_SECRET',
    },
  ],
};

deploy(partial, 'dist/');
