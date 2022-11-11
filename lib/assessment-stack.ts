import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { PersonFunction } from '../resource/person-function';

type AssessmentStackProps = StackProps & {
  envName: string;
};

export class AssessmentStack extends Stack {
  envName: string;
  api: RestApi;
  table: Table;
  personFunction: PersonFunction;

  constructor(scope: Construct, id: string, props: AssessmentStackProps) {
    super(scope, id, props);

    this.envName = props.envName;

    this.createApi();
    this.createTable();
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
   * Create the tikkie table
   */
  private createTable() {
    this.table = new Table(this, `TikkieTable-${this.envName}`, {
      tableName: `Tikkie-${this.envName}`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      // For the sake of easy cleanup, i will put this here.
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  /**
   * Create all the functions related to /persons
   */
  private createPersonFunction() {
    this.personFunction = new PersonFunction(this, {
      envName: this.envName,
      api: this.api,
      table: this.table,
    });
  }
}
