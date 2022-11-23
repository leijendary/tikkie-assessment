import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import personService from '../service/person-service';
import Response from '../utils/response';

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return await personService.create(event.body);
  } catch (err) {
    console.log(err);

    return Response.serverError(err);
  }
};
