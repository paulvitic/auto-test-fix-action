import * as core from '@actions/core'
import {failedTests, FailedTestInfo} from "./failedTests"
import {fixAndPush} from "./fixAndPush"

async function run(): Promise<void> {
  try {
    const testResultsDir: string = core.getInput('testResultsDir')
    const openaiAPIKey: string = core.getInput('openaiAPIKey')
    const branchName: string = core.getInput('branchName')

    const failures: FailedTestInfo[] = await failedTests(testResultsDir)
    await fixAndPush(failures, branchName, openaiAPIKey)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
