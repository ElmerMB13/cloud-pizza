import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpApi, HttpRouteKey } from '@aws-cdk/aws-apigatewayv2-alpha'
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'

export class TheStateMachineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const pineappleCheckLambda = new lambda.Function(this, 'pineappleCheckLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'orderPizza.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
    });

    const orderPizza = new tasks.LambdaInvoke(this, "Order Pizza Job", {
      lambdaFunction: pineappleCheckLambda,
      inputPath: '$.flavour',
      resultPath: '$.pineappleAnalysis',
      payloadResponseOnly: true
    })

    const createPizzaLambda = new lambda.Function(this, 'createPizzaLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'createPizza.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
    })

    const createPizza = new tasks.LambdaInvoke(this, "Create Pizza Job", {
      lambdaFunction: createPizzaLambda,
      inputPath: '$.throwCreateError',
      resultPath: '$.createPizza',
      payloadResponseOnly: true,
    })

    const deliveryLambda = new lambda.Function(this, 'deliveryLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'deliveryPizza.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
    })

    const deliveryPizza = new tasks.LambdaInvoke(this, "Delivery Pizza Job", {
      lambdaFunction: deliveryLambda,
      inputPath: '$.throwDeliveryError',
      resultPath: '$.deliveryPizza',
      payloadResponseOnly: true,
    })

    const supportNotificationLambda = new lambda.Function(this, 'supportNotificationLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'supportNotification.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
    })

    const pineappleDetected = new sfn.Fail(this, 'Sorry, We Dont add Pineapple', {
      cause: 'They asked for Pineapple',
      error: 'Failed To Make Pizza',
    })

    const supportNotification = new tasks.LambdaInvoke(this, "Support notification Job", {
      lambdaFunction: supportNotificationLambda,
      inputPath: '$',
      resultPath: '$.supportNotification',
      payloadResponseOnly: true,
    })

    createPizza.addCatch(sfn.Chain.start(supportNotification), { errors: ['States.All'] })
    deliveryPizza.addCatch(sfn.Chain.start(supportNotification), { errors: ['States.All'] })

    const definition = sfn.Chain
      .start(orderPizza)
      .next(new sfn.Choice(this, 'With Pineapple?') // Logical choice added to flow
        // Look at the "status" field
        .when(sfn.Condition.booleanEquals('$.pineappleAnalysis.containsPineapple', true), pineappleDetected) // Fail for pineapple
        .otherwise(createPizza)
        .afterwards()
      )
      .next(deliveryPizza)

    const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      timeout: cdk.Duration.minutes(5),
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.EXPRESS
    })

    const httpApiRole = new Role(this, 'HttpApiRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        AllowSFNExec: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['states:StartSyncExecution'],
              effect: Effect.ALLOW,
              resources: [stateMachine.stateMachineArn]
            })
          ]
        })
      }
    })

    const api = new HttpApi(this, 'the-state-machine-api', {
      createDefaultStage: true
    })

    const integ = new apigw.CfnIntegration(this, 'Integ', {
      apiId: api.httpApiId,
      integrationType: 'AWS_PROXY',
      connectionType: 'INTERNET',
      integrationSubtype: 'StepFunctions-StartSyncExecution',
      credentialsArn: httpApiRole.roleArn,
      requestParameters: {
        Input: "$request.body",
        StateMachineArn: stateMachine.stateMachineArn
      },
      payloadFormatVersion: '1.0',
      timeoutInMillis: 10000,
    })

    new apigw.CfnRoute(this, 'DefaultRoute', {
      apiId: api.httpApiId,
      routeKey: HttpRouteKey.DEFAULT.key,
      target: `integrations/${integ.ref}`,
    })

    // output the URL of the HTTP API
    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy'
    })
  }
}
