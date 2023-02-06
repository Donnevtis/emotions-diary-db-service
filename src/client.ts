import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export default new DynamoDBClient({
  region: process.env.REGION,
  endpoint: process.env.DB_ENDPOINT,
})
