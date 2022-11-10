import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { SendMessageRequest } from 'aws-sdk/clients/sqs';
import { v4 as uuidv4 } from 'uuid';
import { PutItemInput } from './node_modules/aws-sdk/clients/dynamodb.d';
import { Errors, Person } from './types';

const table = process.env.TABLE as string;
const queue = process.env.QUEUE as string;
const dynamodb = new AWS.DynamoDB();
const sqs = new AWS.SQS();

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;

  const { body } = event;

  if (!body?.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors: {
          message: 'Request body is required',
        },
      }),
    };
  }

  const person = JSON.parse(body) as Person;
  const errors = validate(person);

  // If the error object has keys in it, then it has errors. Return the error
  if (Object.keys(errors).length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors,
      }),
    };
  }

  try {
    const result = await save(person);

    await send(result.id);

    response = {
      statusCode: 200,
      body: JSON.stringify({
        data: result,
      }),
    };
  } catch (err) {
    console.log(err);

    response = {
      statusCode: 500,
      body: JSON.stringify({
        errors: {
          message: err instanceof Error ? err.message : 'Something went wrong. :(',
        },
      }),
    };
  }

  return response;
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

/**
 * TODO: find a better way to validate.
 *
 * ...these todos are never done.
 */
const validate = (details: Person): Errors => {
  const errors: Errors = {};
  const { firstName, lastName, phoneNumber, address } = details;
  const { street, houseNumber, postCode, city, country } = address ?? {};

  if (!firstName?.trim()) {
    errors['firstName'] = 'Required Field';
  }

  if (!lastName?.trim()) {
    errors['lastName'] = 'Required Field';
  }

  if (!phoneNumber?.trim()) {
    errors['phoneNumber'] = 'Required Field';
  }

  if (!address) {
    errors['address'] = 'Required Field';
  }

  if (!street?.trim()) {
    errors['street'] = 'Required Field';
  }

  if (!houseNumber?.trim()) {
    errors['houseNumber'] = 'Required Field';
  }

  if (!postCode?.trim()) {
    errors['postCode'] = 'Required Field';
  }

  if (!city?.trim()) {
    errors['city'] = 'Required Field';
  }

  if (!country?.trim()) {
    errors['country'] = 'Required Field';
  }

  return errors;
};
