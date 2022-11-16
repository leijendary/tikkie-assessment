import SNS, { Types } from 'aws-sdk/clients/sns';

const sns = new SNS();
const topic = process.env.TOPIC;

export class PersonNotification {
  async publish(content: any) {
    const params: Types.PublishInput = {
      TopicArn: topic,
      Message: JSON.stringify(content),
    };

    return await sns.publish(params).promise();
  }
}

export default new PersonNotification();
