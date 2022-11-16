import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { PersonInput } from './../types/person';

const prefix = 'PERSON#';
const type = 'PERSON';
const table = process.env.TABLE as string;
const dynamodb = new DocumentClient();

type ListProps = {
  projection?: string;
  startKey?: string;
};

export class PersonRepository {
  async save(input: PersonInput) {
    const { firstName, lastName } = input;
    const id = uuidv4();
    const pk = `${prefix}${id}`;
    const sk = `${prefix}|FIRST_NAME#${firstName}|LAST_NAME#${lastName}`;
    const params: DocumentClient.PutItemInput = {
      TableName: table,
      Item: {
        pk,
        sk,
        gsi1pk: type,
        ...input,
        createdAt: new Date().toISOString(),
      },
    };

    await dynamodb.put(params).promise();

    return { id };
  }

  async list(props: ListProps) {
    const { projection, startKey } = props;
    const params: DocumentClient.QueryInput = {
      TableName: table,
      IndexName: 'gsi1',
      KeyConditionExpression: '#gsi1pk = :gsi1pk',
      ExpressionAttributeNames: {
        '#gsi1pk': 'gsi1pk',
      },
      ExpressionAttributeValues: {
        ':gsi1pk': type,
      },
      ScanIndexForward: false,
      Limit: 50,
    };

    if (projection) {
      params.ProjectionExpression = projection;
    }

    if (startKey) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(startKey, 'base64').toString());
    }

    const result = await dynamodb.query(params).promise();
    let lastKey = null;

    if (result.LastEvaluatedKey) {
      lastKey = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return {
      data: result.Items,
      count: result.Count,
      lastKey,
    };
  }
}

export default new PersonRepository();
