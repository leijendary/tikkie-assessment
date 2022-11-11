import { Handler, SQSEvent } from 'aws-lambda';

/**
 * BONUS! this will get triggered when the SQS queue is fired
 */
export const handler: Handler = async (event: SQSEvent) => {
  console.log('Received SQS event', JSON.stringify(event, null, 2))

  for (const record of event.Records) {
    console.log('Record', JSON.stringify(record, null, 2))
  }
};
