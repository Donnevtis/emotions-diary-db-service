import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { writeFileSync } from 'node:fs'
export const dynamodb = new DynamoDBClient({
  region: process.env.REGION,
  endpoint: process.env.DB_ENDPOINT,
})
const scanAll = async () => {
  const command = new ScanCommand({
    TableName: 'Users',
  })

  console.log('Сканирование таблицы Series')

  const data = await dynamodb.send(command)

  if (data.Items) {
    writeFileSync('./table.json', JSON.stringify(data.Items, null, 2))
    return
  }

  console.log(data)
}

scanAll()
