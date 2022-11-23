import { PersonInput, PersonInputSchema } from '../types/person';

import topicNotification from '../notification/topic-notification';
import personRepository from '../repository/person-repository';
import Response from '../utils/response';
import { validate } from '../utils/validator';

class PersonService {
  async create(body: string | null) {
    const validation = await validate<PersonInput>(body, PersonInputSchema);

    if (!validation.success) return Response.validation(validation);

    const data = await personRepository.save(validation.data);

    await topicNotification.publish(data);

    return Response.success({ data });
  }
}

export default new PersonService();
