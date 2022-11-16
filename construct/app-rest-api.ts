import { EndpointType, RestApi, RestApiProps } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { EnvNameProps } from '../types/env';

type AppRestApiProps = RestApiProps & EnvNameProps;

const defaults = {
  endpointConfiguration: {
    types: [EndpointType.REGIONAL],
  },
};

export class AppRestApi extends RestApi {
  constructor(scope: Construct, id: string, props: AppRestApiProps) {
    const { envName, restApiName, ...rest } = props;

    super(scope, `${id}-${envName}`, {
      restApiName: `${restApiName}-${envName}`,
      deployOptions: {
        stageName: envName,
      },
      ...defaults,
      ...rest,
    });
  }
}
