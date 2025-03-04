import * as core from '@actions/core'
import * as github from '@actions/github'
import {FailedTestInfo, failedTests} from './failedTests'
import {fixSuggestion, UpdatedContent} from './fixSuggestion'
import {pushFiles} from './pushFiles'

async function run(): Promise<void> {
  try {
    const testResultsDir: string = core.getInput('testResultsDir')
    const suggestionKey: string = core.getInput('suggestionKey')
    process.env.GITHUB_TOKEN = core.getInput('commitToken')

    const failures: FailedTestInfo[] = await failedTests(testResultsDir)
    const updatedContent: UpdatedContent[] = await fixSuggestion(
      failures,
      suggestionKey
    )

    await pushFiles(updatedContent, github.context)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
