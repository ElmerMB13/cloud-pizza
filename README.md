# The State Machine

This is an example CDK stack to deploy The State Machine stack described by Jeremy Daly here - https://www.jeremydaly.com/serverless-microservice-patterns-for-aws/#statemachine

You would use this pattern for simple or complex business logic in a synchronous or an asynchronous setup. Step Functions come with lots of built in robustness features that will reduce your code liability 

![Architecture](img/statemachine-arch.png)

### Testing It Out

After deployment you should have an API Gateway HTTP API where on the base url you can send a POST request with a payload in the following format:

```json
// for a succesful execution
{
    "flavour": "pepperoni",
    "throwCreateError": false,
    "throwDeliveryError": false
}

//to see a failure
{
    "flavour": "pineapple",
    "throwCreateError": false,
    "throwDeliveryError": false
}

// or 
{
    "flavour": "pepperoni",
    "throwCreateError": true,
    "throwDeliveryError": false
}

// or

{
    "flavour": "pepperoni",
    "throwCreateError": false,
    "throwDeliveryError": true
}
```

If you pass in pineapple or hawaiian you should see the step function flow fail in the response payload
If you pass in throwCreateError/throwDeliveryError `true` you should see the step function flow fail in the response payload

The response returned is the raw and full output from the step function so will look something like this:

```json
// A successful execution, note the status of SUCCEEDED
{
    "billingDetails": {
        "billedDurationInMilliseconds": 500,
        "billedMemoryUsedInMB": 64
    },
    "executionArn": "arn:aws:...",
    "input": "{ \"flavour\": \"pepperoni\"}",
    "inputDetails": {
        "__type": "com.amazonaws.swf.base.model#CloudWatchEventsExecutionDataDetails",
        "included": true
    },
    "name": "6e520263-96db-4b80-9b70-659a6972c806",
    "output": "{\"containsPineapple\":false}",
    "outputDetails": {
        "__type": "com.amazonaws.swf.base.model#CloudWatchEventsExecutionDataDetails",
        "included": true
    },
    "startDate": 1.629880767853E9,
    "stateMachineArn": "arn:aws:...",
    "status": "SUCCEEDED",
    "stopDate": 1.629880768343E9,
    "traceHeader": "Root=1-612601bf-c54eff48a04f8cc9ce170772;Sampled=1"
}

// a failed execution, notice status: FAILED and the cause/error properties
{
    "billingDetails": {
        "billedDurationInMilliseconds": 500,
        "billedMemoryUsedInMB": 64
    },
    "cause": "They asked for Pineapple",
    "error": "Failed To Make Pizza",
    "executionArn": "arn:aws:...",
    "input": "{ \"flavour\": \"pineapple\"}",
    "inputDetails": {
        "__type": "com.amazonaws.swf.base.model#CloudWatchEventsExecutionDataDetails",
        "included": true
    },
    "name": "26d19050-7f9a-4b08-bea3-4106a403774f",
    "outputDetails": {
        "__type": "com.amazonaws.swf.base.model#CloudWatchEventsExecutionDataDetails",
        "included": true
    },
    "startDate": 1.629883060124E9,
    "stateMachineArn": "arn:aws:...",
    "status": "FAILED",
    "stopDate": 1.629883060579E9,
    "traceHeader": "Root=1-61260ab4-8c35f155b7a908d900562f1e;Sampled=1"
}

// another sample

{
    "billingDetails": {
        "billedDurationInMilliseconds": 300,
        "billedMemoryUsedInMB": 64
    },
    "cause": "{\"errorType\":\"Error\",\"errorMessage\":\"Error creating the pizza\",\"trace\":[\"Error: Error creating the pizza\",\"    at Runtime.handler (/var/task/createPizza.js:7:19)\",\"    at Runtime.handleOnceNonStreaming (/var/runtime/Runtime.js:74:25)\"]}",
    "error": "Error",
    "executionArn": "arn:aws:...",
    "input": "{\r\n    \"flavour\": \"pepperoni\",\r\n    \"throwCreateError\": true,\r\n    \"throwDeliveryError\": false\r\n}",
    "inputDetails": {
        "__type": "com.amazonaws.swf.base.model#CloudWatchEventsExecutionDataDetails",
        "included": true
    },
    "name": "b6dca2d7-630e-4e7d-97a0-5cc6357f2d53",
    "outputDetails": {
        "__type": "com.amazonaws.swf.base.model#CloudWatchEventsExecutionDataDetails",
        "included": true
    },
    "startDate": 1.690527938229E9,
    "stateMachineArn": "arn:aws:...",
    "status": "FAILED",
    "stopDate": 1.690527938435E9,
    "traceHeader": "Root=1-64c368c2-3577d7d40af0342cd0737213;Sampled=1"
}
```

## Common setup

Clone the repo and install the dependencies.

```bash
git clone git@github.com:ElmerMB13/cloud-pizza.git
cd cloud-pizza
```

```bash
npm install
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `npm run deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
