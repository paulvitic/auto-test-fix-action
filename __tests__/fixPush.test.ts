import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {fixPush} from '../src/fixPush'

dotenv.config({path: path.resolve(__dirname, '../.env')})
const openaiAPIKey: string = process.env.OPENAI_API_KEY || ''

describe('fixPush', () => {
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
    await fixPush(failures, openaiAPIKey)
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
