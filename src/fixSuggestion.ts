import * as fs from 'fs'
import axios, {AxiosResponse} from 'axios'
import {FailedTestInfo} from './failedTests'

const openaiAPIEndpoint = 'https://api.openai.com/v1/completions'

export type UpdatedContent = {
  path?: string | undefined
  content?: string | undefined
}

export async function fixSuggestion(
  failures: FailedTestInfo[],
  suggestionKey: string
): Promise<UpdatedContent[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const res: UpdatedContent[] = []
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
          suggestionKey
        )
        // Replace the Kotlin function with the suggestion
        const updatedContent: string = fileContent.replace(
          regexPattern,
          suggestion
        )
        // Write the updated content back to the Kotlin file
        // fs.writeFileSync(failure.functionSourcePath, updatedContent, 'utf-8')
        res.push({
          path: failure.functionSourcePath,
          content: updatedContent
        })
      }
      resolve(res)
    } catch (e) {
      reject(e)
    }
  })
}

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
  suggestionKey: string
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
            Authorization: `Bearer ${suggestionKey}`
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
