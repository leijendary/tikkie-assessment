import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import SQS, { SendMessageRequest } from 'aws-sdk/clients/sqs';
import { v4 as uuidv4 } from 'uuid';
import { Person } from './types';
import { required } from './validator';

const table = process.env.TABLE as string;
const queue = process.env.QUEUE as string;
const pk = 'PERSON';
const dynamodb = new DynamoDB.DocumentClient();
const sqs = new SQS();

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return await processRequest(event);
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

const processRequest = async (event: APIGatewayProxyEvent) => {
  const { body } = event;

  if (!body?.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors: [
          {
            code: 'required',
            field: 'body',
            message: 'Request body is required',
          },
        ],
      }),
    };
  }

  const person = JSON.parse(body) as Person;
  const errors = [
    ...required('body', ['firstName', 'lastName', 'phoneNumber'], person),
    ...required('address', ['street', 'houseNumber', 'postCode', 'city', 'country'], person?.address),
  ];

  // If the error object has keys in it, then it has errors. Return the error
  if (Object.keys(errors).length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors,
      }),
    };
  }

  const result = await save(person);

  await send(result.id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: result,
    }),
  };
};

const save = async (person: Person) => {
  const id = uuidv4();
  const sk = `ID:${id}|FIRST_NAME:${person.firstName}|LAST_NAME:${person.lastName}`;
  const params: DocumentClient.PutItemInput = {
    TableName: table,
    Item: {
      pk,
      sk,
      ...person,
      createdAt: new Date().toISOString(),
    },
  };

  await dynamodb.put(params).promise();

  return { id };
};

const send = async (id: string) => {
  var params: SendMessageRequest = {
    MessageAttributes: {
      id: {
        DataType: 'String',
        StringValue: id,
      },
    },
    MessageBody: 'person-created-event',
    QueueUrl: queue,
  };

  await sqs.sendMessage(params).promise();
};
