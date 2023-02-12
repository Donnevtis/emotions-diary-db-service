import { DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'

export const dynamodb = new DynamoDBClient({
  region: process.env.REGION,
  endpoint: process.env.DB_ENDPOINT,
})

dynamodb
  .send(
    new DeleteTableCommand({
      TableName: 'Users',
    }),
  )
  .then(data => {
    console.log('Table deleted. JSON: ', JSON.stringify(data, null, 2))
  })
  .catch(err => {
    console.log(`Table wasn't deleted. Error: ${err}`)
  })
