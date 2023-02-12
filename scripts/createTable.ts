import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb'

export const dynamodb = new DynamoDBClient({
  region: process.env.REGION,
  endpoint: process.env.DB_ENDPOINT,
})

dynamodb
  .send(
    new CreateTableCommand({
      TableName: 'Users',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'InvertedIndex',
          KeySchema: [
            { AttributeName: 'SK', KeyType: 'HASH' },
            { AttributeName: 'PK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
    }),
  )
  .then(data => {
    const dataJson = JSON.stringify(data, null, 2)
    console.log('Table created. Scheme JSON: ', dataJson)
  })
  .catch(err => {
    console.error(
      `Table wasn't created. Error JSON: ${JSON.stringify(err, null, 2)}`,
    )
  })
