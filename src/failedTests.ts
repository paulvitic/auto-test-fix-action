import * as fs from 'fs'
import * as path from 'path'
import {parseString} from 'xml2js'
import {Stats} from 'fs'

type JUnitFailure = {
  _: string
  $: {
    message: string
    type: string
  }
}
type JUnitTestCase = {
  $: {
    name: string
    classname: string
  }
  failure?: JUnitFailure[]
}

type JUnitTestSuite = {
  $: {
    name: string
    tests: string
    failures: string
    errors: string
    skipped: string
  }
  testcase?: JUnitTestCase[]
}

export type FailedTestInfo = {
  targetFunction: string
  functionSourcePath: string
  message: string
}

export async function failedTests(
  directoryPath: string
): Promise<FailedTestInfo[]> {
  // Read all files in the directory
  const files: string[] = getTestResultPaths(directoryPath, '.xml')
  return await getFailedTests(files)
}

function getTestResultPaths(
  directoryPath: string,
  extension: string
): string[] {
  const filePaths: string[] = []

  if (!fs.existsSync(directoryPath)) return filePaths
  // Read all files in the directory
  const files: string[] = fs.readdirSync(directoryPath)

  // Filter files with the given extension
  for (const file of files) {
    const filePath: string = path.join(directoryPath, file)
    const fileStats: Stats = fs.statSync(filePath)
    if (fileStats.isFile() && path.extname(file) === extension) {
      filePaths.push(filePath)
    }
  }
  return filePaths
}

export async function getFailedTests(
  filePaths: string[]
): Promise<FailedTestInfo[]> {
  return new Promise(async (resolve, reject) => {
    const failedTestsInfo: FailedTestInfo[] = []
    try {
      for (const filePath of filePaths) {
        const testSuite: JUnitTestSuite = await parseJUnitXML(filePath)
        const promptInfo: FailedTestInfo[] = extractTestFailureInfo(testSuite)
        failedTestsInfo.push(...promptInfo)
      }
      resolve(failedTestsInfo)
    } catch (error) {
      reject(error)
    }
  })
}

async function parseJUnitXML(filePath: string): Promise<JUnitTestSuite> {
  const fileContent: string = fs.readFileSync(filePath, 'utf-8')
  return new Promise((resolve, reject): void => {
    parseString(fileContent, (err: Error | null, result): void => {
      if (err) {
        reject(new Error(`Failed to parse JUnit XML: ${err}`))
      }
      if (!result.testsuite) {
        reject(new Error(`Failed to parse JUnit XML: ${filePath}`))
      }
      resolve(result.testsuite)
    })
  })
}

function extractTestFailureInfo(testSuite: JUnitTestSuite): FailedTestInfo[] {
  const failedTestsInfo: FailedTestInfo[] = []

  if (!testSuite || !testSuite.testcase) {
    return failedTestsInfo
  }

  for (const testcase of testSuite.testcase) {
    if (testcase.failure) {
      for (const failure of testcase.failure) {
        failedTestsInfo.push(failedTestInfo(failure.$.message))
      }
    }
  }

  return failedTestsInfo
}

function failedTestInfo(text: string): FailedTestInfo {
  const regex =
    /targetFunction:\s*(.*),\s*functionSourcePath:\s*(.*?)\s*==>\s*(.*)/
  const matches: RegExpMatchArray | null = text.match(regex)

  if (!matches) {
    throw new Error('Could not extract structured data from the provided text')
  }

  return {
    targetFunction: matches[1].trim(),
    functionSourcePath: matches[2].trim(),
    message: matches[3].trim()
  }
}
