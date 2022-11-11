import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

type PersonFunctionProps = {
  envName: string;
  api: RestApi;
  table: Table;
};

export class PersonFunction extends Construct {
  envName: string;
  api: RestApi;
  table: Table;
  resource: Resource;
  createQueue: Queue;
  createFunction: NodejsFunction;
  listFunction: NodejsFunction;
  onCreatedFunction: NodejsFunction;

  constructor(scope: Construct, props: PersonFunctionProps) {
    super(scope, `PersonFunction-${props.envName}`);

    this.envName = props.envName;
    this.api = props.api;
    this.table = props.table;

    this.addApiResource();
    this.createQueues();
    this.addCreateFunction();
    this.addListFunction();
    this.addOnCreatedFunction();
  }

  /**
   * Add route for /persons
   */
  private addApiResource() {
    this.resource = this.api.root.addResource('persons');
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

  /**
   * Add the listPersons function
   */
  private addListFunction() {
    this.listFunction = new NodejsFunction(this, `ListPersonsFunction-${this.envName}`, {
      functionName: `listPersons-${this.envName}`,
      entry: 'functions/listPersons/app.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      environment: {
        TABLE: this.table.tableName,
      },
    });

    const integration = new LambdaIntegration(this.listFunction);

    // Only GET /persons will trigger this lambda
    this.resource.addMethod('GET', integration);

    // Grant read access to the table
    this.table.grantReadData(this.listFunction);
  }

  /**
   * BONUS! Add the onPersonCreated function.
   *
   * Only triggered by the CreatePerson SQS queue.
   */
  private addOnCreatedFunction() {
    this.onCreatedFunction = new NodejsFunction(this, `OnPersonCreatedFunction-${this.envName}`, {
      functionName: `onPersonCreated-${this.envName}`,
      entry: 'functions/onPersonCreated/app.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
    });

    const source = new SqsEventSource(this.createQueue);

    this.onCreatedFunction.addEventSource(source);
  }
}
