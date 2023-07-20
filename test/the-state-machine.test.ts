import { Template } from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';
import { TheStateMachineStack } from '../lib/the-state-machine-stack';

test('API Gateway Proxy Created', () => {
  const app = new cdk.App();

  const stateMachineStack = new TheStateMachineStack(app, "TheStateMachineStack");
  const template = Template.fromStack(stateMachineStack);

  template.hasResourceProperties("AWS::ApiGatewayV2::Integration", {
    "IntegrationType": "AWS_PROXY",
    "ConnectionType": "INTERNET",
    "IntegrationSubtype": "StepFunctions-StartSyncExecution",
    "PayloadFormatVersion": "1.0",
    "RequestParameters": {
      "Input": "$request.body",
      "StateMachineArn": {
      }
    },
    "TimeoutInMillis": 10000
  })
})