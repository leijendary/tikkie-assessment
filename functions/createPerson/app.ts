import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import SQS, { SendMessageRequest } from 'aws-sdk/clients/sqs';
import { v4 as uuidv4 } from 'uuid';
import { PutItemInput } from './node_modules/aws-sdk/clients/dynamodb.d';
import { Person } from './types';
import { required } from './validator';

const table = process.env.TABLE as string;
const queue = process.env.QUEUE as string;
const dynamodb = new DynamoDB();
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

const save = async (person: Person) => {
  const id = uuidv4();
  const params: PutItemInput = {
    TableName: table,
    Item: {
      id: {
        S: id,
      },
      firstName: {
        S: person.firstName,
      },
      lastName: {
        S: person.lastName,
      },
      phoneNumber: {
        S: person.phoneNumber,
      },
      address: {
        M: {
          street: {
            S: person.address.street,
          },
          houseNumber: {
            S: person.address.houseNumber,
          },
          postCode: {
            S: person.address.postCode,
          },
          city: {
            S: person.address.city,
          },
          country: {
            S: person.address.country,
          },
        },
      },
    },
  };

  // Save the person (no hidden meaning) if the person's details are all good.
  await dynamodb.putItem(params).promise();

  return { id };
};
