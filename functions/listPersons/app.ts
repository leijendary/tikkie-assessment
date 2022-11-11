import { APIGatewayProxyResult, Handler } from 'aws-lambda';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';

const table = process.env.TABLE as string;
const pk = 'PERSON';
const dynamodb = new DynamoDB.DocumentClient();

export const handler: Handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    return await list();
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

const list = async () => {
  const params: DocumentClient.QueryInput = {
    TableName: table,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'pk',
    },
    ExpressionAttributeValues: {
      ':pk': pk,
    },
    ProjectionExpression: 'firstName,lastName,phoneNumber,address',
  };
  const result = await dynamodb.query(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: result.Items,
      count: result.Count,
    }),
  };
};
