import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { PersonFunction } from '../resource/person-function';
import { AppRestApi } from './../construct/app-rest-api';
import { AppTable } from './../construct/app-table';

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
    this.api = new AppRestApi(this, 'AssessmentAPI', {
      envName: this.envName,
      restApiName: 'assessment',
    });
  }

  /**
   * Create the tikkie table
   */
  private createTable() {
    this.table = new AppTable(this, 'TikkieTable', {
      envName: this.envName,
      tableName: 'Tikkie',
    });
    this.table.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: {
        name: 'gsi1pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'gsi1sk',
        type: AttributeType.STRING,
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
      table: this.table,
    });
  }
}
