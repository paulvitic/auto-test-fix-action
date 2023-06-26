import * as core from '@actions/core'
import * as github from '@actions/github'
import {failedTests, FailedTestInfo} from './failedTests'
import {fixSuggestion, UpdatedContent} from './fixSuggestion'
import {pushFiles} from './pushFiles'

async function run(): Promise<void> {
  try {
    const testResultsDir: string = core.getInput('testResultsDir')
    const suggestionKey: string = core.getInput('suggestionKey')
    const commitToken: string = core.getInput('commitToken')
    //process.env.GITHUB_TOKEN = commitToken

    const failures: FailedTestInfo[] = await failedTests(testResultsDir)
    const updatedContent: UpdatedContent[] = await fixSuggestion(
      failures, suggestionKey
    )

    await pushFiles(updatedContent, github.context)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
