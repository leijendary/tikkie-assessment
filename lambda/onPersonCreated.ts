import { Handler, SNSEvent } from 'aws-lambda';

/**
 * BONUS! this will get triggered when the SNS queue is fired
 */
export const handler: Handler = async (event: SNSEvent) => {
  console.log('Received SNS event', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    console.log('Record', JSON.stringify(record, null, 2));
  }
};
