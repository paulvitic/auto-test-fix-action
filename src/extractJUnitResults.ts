import * as fs from 'fs';
import * as path from 'path';
import { parseString, convertableToString } from 'xml2js';
import {Stats} from "fs";

interface JUnitTestCase {
    $: {
        name: string;
        classname: string;
    };
    failure?: convertableToString[];
}

interface JUnitTestSuite {
    $: {
        name: string;
        tests: string;
        failures: string;
        errors: string;
        skipped: string;
    };
    testcase?: JUnitTestCase[];
}

export interface PromptInfo {
    kotlinFilePath: string;
    functionName: string;
    description: string;
    expectedOutput: string;
    actualOutput: string;
    junitXML: string;
}

export async function extractPromptFromJUnitXML(directoryPath: string): Promise<PromptInfo[]> {
    // Read all files in the directory
    const files: string[] = getTestResultPaths(directoryPath, '.xml');
    return await getFailedTests(files);
}

export function getTestResultPaths(directoryPath: string, extension: string): string[] {
    const filePaths: string[] = [];
    // Read all files in the directory
    const files: string[] = fs.readdirSync(directoryPath);

    // Filter files with the given extension
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStats: Stats = fs.statSync(filePath);
        if (fileStats.isFile() && path.extname(file) === extension) {
            filePaths.push(filePath);
        }
    }
    return filePaths;
}

export function getFailedTests(filePaths: string[]): Promise<PromptInfo[]> {
    return new Promise(async (resolve, reject) => {
        const promptInfoList: PromptInfo[] = [];
        for (const filePath of filePaths) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const testSuite: JUnitTestSuite = await parseJUnitXML(fileContent);
            const promptInfo: PromptInfo = extractPromptInfo(testSuite, filePath);
            promptInfoList.push(promptInfo);
        }
        resolve(promptInfoList);
    });
}

function parseJUnitXML(xmlContent: string): Promise<JUnitTestSuite> {
    return new Promise((resolve, reject) => {
        parseString(xmlContent, (err, result) => {
            if (err) {
                reject(new Error(`Failed to parse JUnit XML: ${err}`));
            }
            resolve(result);
        });
    });
}

function extractPromptInfo(
    testSuite: JUnitTestSuite,
    kotlinFilePath: string): PromptInfo {
    const promptInfo: PromptInfo = {
        kotlinFilePath,
        functionName: '',
        description: '',
        expectedOutput: '',
        actualOutput: '',
        junitXML: ''
    };

    if (!testSuite || !testSuite.testcase) {
        return promptInfo;
    }

    for (const testcase of testSuite.testcase) {
        if (testcase.failure) {
            promptInfo.functionName = testcase.$.classname;
            promptInfo.description = testcase.$.name;
            promptInfo.expectedOutput = testcase.failure[0] as string;
            promptInfo.actualOutput = ''; // Extract actual output if available
            promptInfo.junitXML = testSuite.toString();
            break; // Extract information from the first failed test only
        }
    }

    return promptInfo;
}
