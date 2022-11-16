import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { EnvNameProps } from '../types/env';

type AppTopicProps = TopicProps & EnvNameProps;

export class AppTopic extends Topic {
  constructor(scope: Construct, id: string, props: AppTopicProps) {
    const { envName, topicName, ...rest } = props;

    super(scope, `${id}-${envName}`, {
      topicName: `${topicName}-${envName}`,
      ...rest,
    });
  }
}
