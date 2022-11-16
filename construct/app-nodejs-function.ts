import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { EnvNameProps } from '../types/env';

type AppNodeJsFunctionProps = NodejsFunctionProps & EnvNameProps;

const defaults = {
  handler: 'handler',
  runtime: Runtime.NODEJS_16_X,
  architecture: Architecture.ARM_64,
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
