import { MiBtoByte } from './utils'
import environment from './environment'
import { deploy } from './function-service'
import { FunctionConfig } from './types'

const { FUNCTION_ID, SA_ID, LOCKBOX_ID, LOCKBOX_VERSION } = environment

const partial: FunctionConfig = {
  functionId: FUNCTION_ID,
  runtime: 'nodejs16',
  entrypoint: 'index.handler',
  resources: {
    memory: MiBtoByte(256),
  },
  executionTimeout: { seconds: 10 },
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
    {
      id: LOCKBOX_ID,
      versionId: LOCKBOX_VERSION,
      environmentVariable: 'DB_ENDPOINT',
      key: 'DB_ENDPOINT',
    },
    {
      id: LOCKBOX_ID,
      versionId: LOCKBOX_VERSION,
      environmentVariable: 'REGION',
      key: 'REGION',
    },
  ],
}

deploy(partial, 'dist/')
