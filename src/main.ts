import * as core from '@actions/core'
import * as github from '@actions/github'
import {failedTests, FailedTestInfo} from './failedTests'
import {fixSuggestion, UpdatedContent} from './fixSuggestion'
import {pushFiles} from './pushFiles'

async function run(): Promise<void> {
  try {
    const testResultsDir: string = core.getInput('testResultsDir')
    const openaiAPIKey: string = core.getInput('openaiAPIKey')
    const githubToken: string = core.getInput('githubToken')

    const failures: FailedTestInfo[] = await failedTests(testResultsDir)
    const updatedContent: UpdatedContent[] = await fixSuggestion(
      failures,
      openaiAPIKey
    )

    await pushFiles(updatedContent, github.context, githubToken)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
