# Tikkie technical assessment

This is a simple assessment from Tikkie to create two APIs:

- Create person
- List persons
- (Bonus) trigger a lambda function from an SNS topic

The tech stack is really nice and i prefer this over long running servers. But of course, servers are useful in some cases.

**_Written in TypeScript! πππΎ_**

# Folder structure

```
assessment
β   README.md
β   .env.example <-- copy this to .env and add your values
β   .env <-- you should create this from .env.example
β
ββββbin
β   assessment.ts <-- starting point of the app
β
ββββconstruct
β   app-nodejs-function.ts <-- the default construct for NodeJS functions
β   app-rest-api.ts <-- the default construct for REST API gateway
β   app-table.ts <-- the default construct for the DynamoDB tables
β   app-topic.ts <-- the default construct for SNS topics
β
ββββlambda
β   β   createPerson <-- the lambda function that can create a person
β   β   listPersons <-- the lambda function that can get the list of persons
β   β   onPersonCreated <-- the lambda function that is called by person-created-event topic
β
ββββlib
β   assessment-stack.ts <-- starting point of the actual stack
β
ββββnotification
β   topic-notification.ts <-- an abstraction to publish SNS topics
β
ββββrepository
β   person-repository.ts <-- an abstraction to access person records
β
ββββresource
β   person-function.ts <-- contains all the constructs for the /persons API
β
ββββtypes <-- contains the data types
ββββutils <-- contains utility classes
```

# Running the stack

In your terminal, simply run:

`cdk deploy AssessmentStack-{stageName}`

Where `stageName` could be any of the following:

- dev
- prod

Example:

`cdk deploy AssessmentStack-dev`

Or you could deploy all stacks at once:

`cdk deploy --all`

All up to you.

# Environment variables

Currently, only `dev` and `prod` are written in `assessment.ts`. You could add more environments if you wish.

You could add more account IDs by creating a copy of `.env.example` and naming it `.env`.

As starting point, here is a sample `.env` file:

```
DEV_AWS_ACCOUNT_ID=
DEV_AWS_REGION=
PROD_AWS_ACCOUNT_ID=
PROD_AWS_REGION=
```

# Packages

List of packages installed on all lambda functions:

- uuid
- zod

# API usage

_Examples are using curl_

## Create person

### Request

```bash
curl --location --request POST 'https://{apiGatewayId}.execute-api.eu-central-1.amazonaws.com/{stageName}/persons' \
--header 'Content-Type: application/json' \
--data-raw '{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+31 600000000",
  "address": {
    "street": "Straat 1",
    "houseNumber": "1A",
    "postCode": "5622GH",
    "city": "Eindhoven",
    "country": "Netherlands"
  }
}'
```

### Response

```json
{
  "data": {
    "id": "d225e9e2-2c27-4b94-b056-2bafd710b657"
  }
}
```

The response only contains the ID of the created resource, to save GET calls from DynamoDB.

## List persons

### Request

```bash
curl --location --request GET 'https://{apiGatewayId}.execute-api.eu-central-1.amazonaws.com/{stageName}/persons?lastKey={optionalLastKey}'
```

Where `optionalLastKey` is an **optional** query parameter to get the next page. You can get this value from the response.

### Response

```json
{
  "data": [
    {
      "phoneNumber": "+31 600000000",
      "address": {
        "houseNumber": "1A",
        "country": "Netherlands",
        "postCode": "5622GH",
        "city": "Eindhoven",
        "street": "Straat 1"
      },
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2022-11-10T19:29:45.903Z"
    }
  ],
  "count": 1,
  "lastKey": "{lastKeyGoesHere}"
}
```

`lastKey` can be used as the "next token" for paginating the next list request.
