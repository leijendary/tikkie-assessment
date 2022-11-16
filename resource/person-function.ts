import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { AppTopic } from '../construct/app-topic';
import { AppNodeJsFunction } from './../construct/app-nodejs-function';

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
  createTopic: Topic;
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
    this.createTopic = new AppTopic(this, 'CreatePersonQueue', {
      envName: this.envName,
      topicName: 'person-created-event',
    });
  }

  /**
   * POST /persons
   *
   * Add the createPerson function that will only be triggered by the API call of POST /persons
   */
  private addCreateFunction() {
    this.createFunction = new AppNodeJsFunction(this, 'CreatePersonFunction', {
      envName: this.envName,
      functionName: 'createPerson',
      entry: 'lambda/createPerson/app.ts',
      environment: {
        TABLE: this.table.tableName,
        TOPIC: this.createTopic.topicArn,
      },
    });

    const integration = new LambdaIntegration(this.createFunction);

    // Only POST /persons will trigger this lambda
    this.resource.addMethod('POST', integration);

    // Grant access to other services
    this.table.grantReadWriteData(this.createFunction);
    this.createTopic.grantPublish(this.createFunction);
  }

  /**
   * GET /persons
   *
   * Add the listPersons function triggered by calling GET /persons
   */
  private addListFunction() {
    this.listFunction = new AppNodeJsFunction(this, 'ListPersonsFunction', {
      envName: this.envName,
      functionName: 'listPersons',
      entry: 'lambda/listPersons/app.ts',
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
   * Only triggered by the person-created-event SNS.
   */
  private addOnCreatedFunction() {
    this.onCreatedFunction = new AppNodeJsFunction(this, 'OnPersonCreatedFunction', {
      envName: this.envName,
      functionName: 'onPersonCreated',
      entry: 'lambda/onPersonCreated/app.ts',
    });

    const source = new SnsEventSource(this.createTopic);

    this.onCreatedFunction.addEventSource(source);
  }
}
