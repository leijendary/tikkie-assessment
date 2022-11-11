import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';

const table = process.env.TABLE as string;
const pk = 'PERSON';
const dynamodb = new DynamoDB.DocumentClient();

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { lastKey } = event.queryStringParameters ?? {};

  try {
    return await list(lastKey);
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        errors: [
          {
            code: 'server',
            message: err instanceof Error ? err.message : 'Something went wrong. :(',
          },
        ],
      }),
    };
  }
};

const list = async (startKey?: string) => {
  const params: DocumentClient.QueryInput = {
    TableName: table,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'pk',
    },
    ExpressionAttributeValues: {
      ':pk': pk,
    },
    ScanIndexForward: false,
    ProjectionExpression: 'firstName,lastName,phoneNumber,address,createdAt',
    Limit: 50,
  };

  if (startKey) {
    params.ExclusiveStartKey = {
      pk,
      sk: Buffer.from(startKey, 'base64').toString(),
    };
  }

  const result = await dynamodb.query(params).promise();
  const lastKey = result.LastEvaluatedKey?.sk ? Buffer.from(result.LastEvaluatedKey.sk).toString('base64') : null;

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: result.Items,
      count: result.Count,
      lastKey,
    }),
  };
};
