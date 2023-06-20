import * as core from '@actions/core'
import {failedTests, FailedTestInfo} from './failedTests'
import {fixPush} from './fixPush'
import {pushFiles} from './pushFiles'

async function run(): Promise<void> {
  try {
    const testResultsDir: string = core.getInput('testResultsDir')
    const openaiAPIKey: string = core.getInput('openaiAPIKey')
    const branchName: string = core.getInput('branchName')

    const failures: FailedTestInfo[] = await failedTests(testResultsDir)
    const updateContent = await fixPush(failures, openaiAPIKey, branchName)
    await pushFiles(updateContent)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
