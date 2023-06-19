import * as fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import axios, {AxiosResponse} from 'axios'
import {Octokit} from '@octokit/rest'
import {Context} from '@actions/github/lib/context'
import {FailedTestInfo} from './failedTests'
import dotenv from 'dotenv'

const commitMessage = 'Fix function based on suggestion from ChatGPT API'
const openaiAPIEndpoint = 'https://api.openai.com/v1/completions'

dotenv.config()
function buildPrompt(
  fileContent: string,
  regexPattern: RegExp,
  testFailureMsg: string
): string {
  // Find the Kotlin function in the file
  const match: RegExpExecArray | null = regexPattern.exec(fileContent)

  if (!match) {
    throw new Error(`Function not found in the Kotlin file.`)
  }

  const kotlinFunction: string = match[0] // Extracted Kotlin function

  // Prepare the prompt for the ChatGPT API
  return (
    `Improve the following Kotlin function to fix the failed test case.\n\n` +
    `Current function:\n${kotlinFunction}\n\n` +
    `Constraints: The solution should be compatible with Kotlin version 1.9.\n\n` +
    `Failed test case prompt: ${testFailureMsg}\n\n` +
    `Suggested Kotlin function:`
  )
}

async function getFixSuggestion(
  fileContent: string,
  regexPattern: RegExp,
  testFailureMsg: string,
  openAIAPIKey: string
): Promise<string> {
  const prompt: string = buildPrompt(fileContent, regexPattern, testFailureMsg)

  return new Promise(async (resolve, reject) => {
    // Send the prompt to the ChatGPT API for improvement
    try {
      const response: AxiosResponse = await axios.post(
        openaiAPIEndpoint,
        {
          model: 'text-davinci-003',
          prompt,
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIAPIKey}`
          }
        }
      )
      // Extracted suggestion from ChatGPT API
      const suggestion: string = response.data.choices[0].text.trim()
      resolve(suggestion)
    } catch (error) {
      reject(error)
    }
  })
}

async function commitAndPush(
  filePath: string,
  updatedContent: string,
  branchName: string
): Promise<void> {
  // Initialize GitHub context
  const context: Context = github.context

  // Get the GitHub token from the action's inputs
  const githubToken: string = core.getInput('githubToken')

  try {
    // Create a new Octokit client using the token
    const octokit = new Octokit({auth: githubToken})

    // Commit and push the changes to the given branch
    await octokit.repos.createOrUpdateFileContents({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: filePath,
      content: updatedContent,
      message: commitMessage,
      branch: branchName,
      sha: context.sha
    })
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `Failed to push changes to branch: ${branchName}. Error: ${error.message}`
      )
    } else {
      core.setFailed(`Failed to push changes to branch: ${branchName}.`)
    }
  }
}

export async function fixPush(
  failures: FailedTestInfo[],
  openaiAPIKey: string,
  branchName = 'master'
): Promise<void> {
  for (const failure of failures) {
    const regexPattern = new RegExp(
      `fun\\s+${failure.targetFunction}\\s*\\([^)]*\\)\\s*:\\s*[\\w.]+\\s*{[^}]*}`,
      's'
    )
    const fileContent: string = fs.readFileSync(
      failure.functionSourcePath,
      'utf-8'
    )

    const suggestion: string = await getFixSuggestion(
      fileContent,
      regexPattern,
      failure.message,
      openaiAPIKey
    )
    // Replace the Kotlin function with the suggestion
    const updatedContent: string = fileContent.replace(regexPattern, suggestion)
    // Write the updated content back to the Kotlin file
    fs.writeFileSync(failure.functionSourcePath, updatedContent, 'utf-8')
    await commitAndPush(failure.functionSourcePath, updatedContent, branchName)
  }
}
