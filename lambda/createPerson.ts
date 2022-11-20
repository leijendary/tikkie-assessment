import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import topicNotification from '../notification/topic-notification';
import personRepository from '../repository/person-repository';
import { PersonInput, PersonInputSchema } from '../types/person';
import Response from '../utils/response';
import { validate } from '../utils/validator';

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const validation = await validate<PersonInput>(event.body, PersonInputSchema);

  if (!validation.success) return Response.validation(validation);

  try {
    const data = await personRepository.save(validation.data);

    await topicNotification.publish(data);

    return Response.success({ data });
  } catch (err) {
    console.log(err);

    return Response.serverError(err);
  }
};
