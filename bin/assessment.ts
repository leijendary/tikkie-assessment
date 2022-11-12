#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import 'source-map-support/register';
import { AssessmentStack } from '../lib/assessment-stack';

dotenv.config();

const envs: { [key: string]: Environment } = {
  dev: {
    account: process.env.DEV_AWS_ACCOUNT_ID,
    region: process.env.DEV_AWS_REGION,
  },
  prod: {
    account: process.env.PROD_AWS_ACCOUNT_ID,
    region: process.env.PROD_AWS_REGION,
  },
};

const app = new App();

// Create multiple stacks based on the environment.
Object.keys(envs).forEach((key) => {
  const env = envs[key];

  new AssessmentStack(app, `AssessmentStack-${key}`, {
    env,
    envName: key,
    tags: {
      Environment: key,
    },
  });
});

app.synth();
