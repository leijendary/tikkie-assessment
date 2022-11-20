import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import personRepository from '../repository/person-repository';
import Response from '../utils/response';

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { lastKey } = event.queryStringParameters ?? {};

  try {
    const data = await personRepository.list({
      projection: 'firstName,lastName,phoneNumber,address,createdAt',
      startKey: lastKey,
    });

    return Response.success(data);
  } catch (err) {
    console.log(err);

    return Response.serverError(err);
  }
};
