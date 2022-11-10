import { Stack, StackProps } from 'aws-cdk-lib';
import { EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { PersonFunction } from '../resource/person-function';

type AssessmentStackProps = StackProps & {
  envName: string;
};

export class AssessmentStack extends Stack {
  envName: string;
  api: RestApi;
  personFunction: PersonFunction;

  constructor(scope: Construct, id: string, props: AssessmentStackProps) {
    super(scope, id, props);

    this.envName = props.envName;

    this.createApi();
    this.createPersonFunction();
  }

  private createApi() {
    this.api = new RestApi(this, `AssessmentAPI-${this.envName}`, {
      restApiName: `Assessment-${this.envName}`,
      deployOptions: {
        stageName: this.envName,
      },
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },
    });
  }

  /**
   * Create all the functions related to /persons
   */
  private createPersonFunction() {
    this.personFunction = new PersonFunction(this, {
      envName: this.envName,
      api: this.api,
    });
  }
}
