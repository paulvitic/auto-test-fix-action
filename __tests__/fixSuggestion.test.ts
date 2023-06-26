import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {fixSuggestion} from '../src/fixSuggestion'

dotenv.config({path: path.resolve(__dirname, '../.env')})
describe('fixSuggestion', () => {
  const openaiAPIKey: string = process.env.SUGGESTION_KEY || ''
  const sourceCodeDir = path.join(__dirname, 'test_source_code_files')
  const targetTestFileName = 'SelfHealingTest'

  it('should fix failures and push changes', async () => {
    const failures = [
      {
        targetFunction: 'myFunction',
        functionSourcePath: `${sourceCodeDir}/${targetTestFileName}Copy.kt`,
        message:
          'expected output was 42 ==> Unexpected exception thrown: kotlin.NotImplementedError: An operation is not implemented: It will be soon'
      }
      // Add more failure objects as needed
    ]
    const res = await fixSuggestion(failures, openaiAPIKey)
    expect(res).toHaveLength(1)
  })

  beforeAll(() => {
    // Create test files for the test cases
    fs.copyFileSync(
      `${sourceCodeDir}/${targetTestFileName}.kt`,
      `${sourceCodeDir}/${targetTestFileName}Copy.kt`
    )
  })

  afterAll(() => {
    // Remove the test files
    fs.rmSync(`${sourceCodeDir}/${targetTestFileName}Copy.kt`)
  })
})
