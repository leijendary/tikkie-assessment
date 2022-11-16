import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvNameProps } from '../types/env';

type AppNodeJsFunctionProps = NodejsFunctionProps & EnvNameProps;

const defaults: NodejsFunctionProps = {
  handler: 'handler',
  runtime: Runtime.NODEJS_16_X,
  architecture: Architecture.ARM_64,
  logRetention: RetentionDays.ONE_DAY,
};

export class AppNodeJsFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: AppNodeJsFunctionProps) {
    const { envName, functionName, ...rest } = props;

    super(scope, `${id}-${envName}`, {
      functionName: `${functionName}-${envName}`,
      ...defaults,
      ...rest,
    });
  }
}
