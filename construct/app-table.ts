import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { EnvNameProps } from './../types/env';

type AppTableProps = EnvNameProps & Omit<TableProps, 'partitionKey'>;

const defaults = {
  partitionKey: {
    name: 'pk',
    type: AttributeType.STRING,
  },
  sortKey: {
    name: 'sk',
    type: AttributeType.STRING,
  },
  billingMode: BillingMode.PAY_PER_REQUEST,
  // For the sake of easy cleanup, i will put this here.
  removalPolicy: RemovalPolicy.DESTROY,
};

export class AppTable extends Table {
  constructor(scope: Construct, id: string, props: AppTableProps) {
    const { envName, tableName, ...rest } = props;

    super(scope, `${id}-${envName}`, {
      tableName: `${tableName}-${envName}`,
      ...defaults,
      ...rest,
    });
  }
}
