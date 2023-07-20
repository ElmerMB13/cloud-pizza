#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { TheStateMachineStack } from '../lib/the-state-machine-stack'

const app = new cdk.App()
new TheStateMachineStack(app, 'TheStateMachineStack')