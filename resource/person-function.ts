import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

type PersonFunctionProps = {
  envName: string;
  api: RestApi;
};

export class PersonFunction extends Construct {
  envName: string;
  api: RestApi;
  resource: Resource;
  table: Table;
  createQueue: Queue;
  createFunction: NodejsFunction;

  constructor(scope: Construct, props: PersonFunctionProps) {
    super(scope, `PersonFunction-${props.envName}`);

    this.envName = props.envName;
    this.api = props.api;

    this.addApiResource();
    this.createTable();
    this.createQueues();
    this.addCreateFunction();
  }

  /**
   * Add route for /persons
   */
  private addApiResource() {
    this.resource = this.api.root.addResource('persons');
  }

  /**
   * Create the person table
   */
  private createTable() {
    this.table = new Table(this, `PersonTable-${this.envName}`, {
      tableName: `Person-${this.envName}`,
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
   * Create the queues needed for the events
   */
  private createQueues() {
    this.createQueue = new Queue(this, `CreatePersonQueue-${this.envName}`, {
      queueName: `CreatePerson-${this.envName}`,
      retentionPeriod: Duration.days(1),
    });
  }

  /**
   * Add the createPerson function
   */
  private addCreateFunction() {
    this.createFunction = new NodejsFunction(this, `CreatePersonFunction-${this.envName}`, {
      functionName: `createPerson-${this.envName}`,
      entry: 'functions/createPerson/app.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      environment: {
        TABLE: this.table.tableName,
        QUEUE: this.createQueue.queueUrl,
      },
    });

    const integration = new LambdaIntegration(this.createFunction);

    // Only POST /persons will trigger this lambda
    this.resource.addMethod('POST', integration);

    // Grant access to other services
    this.table.grantReadWriteData(this.createFunction);
    this.createQueue.grantSendMessages(this.createFunction);
  }
}
