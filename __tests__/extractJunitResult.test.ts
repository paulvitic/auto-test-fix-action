import * as fs from 'fs';
import * as path from 'path';
import {extractPromptFromJUnitXML, getTestResultPaths, PromptInfo} from '../src/extractJUnitResults';

describe('extractPromptFromJUnitXML', () => {
    const testResultsDir = path.join(__dirname, 'test_files');

    describe('getFilePathsByExtension', () => {
        const extension = '.xml';

        it('should return an array of file paths with the given extension', () => {
            const filePaths = getTestResultPaths(testResultsDir, extension);
            expect(Array.isArray(filePaths)).toBe(true);
            expect(filePaths.every((filePath) => typeof filePath === 'string')).toBe(true);
            expect(filePaths.length).toBe(2);
            expect(filePaths.every((filePath) => filePath.endsWith(extension))).toBe(true);
        });

        it('should return an empty array if no files with the given extension are found', () => {
            const nonExistentExtension = '.xyz';
            const filePaths = getTestResultPaths(testResultsDir, nonExistentExtension);
            expect(Array.isArray(filePaths)).toBe(true);
            expect(filePaths.length).toBe(0);
        });
    });

    test('should extract prompt information from JUnit XML files with failed tests', async () => {
        const promptInfoList: PromptInfo[] = await extractPromptFromJUnitXML(testResultsDir);

        expect(promptInfoList).toHaveLength(2);

        const expectedPromptInfo1 = {
            kotlinFilePath: 'path/to/KotlinFile.kt',
            functionName: 'myFunction',
            description: 'example.TestCase1',
            expectedOutput: 'Expected: 42\nActual: 43',
            actualOutput: '',
            junitXML: ''
        };
        expect(promptInfoList).toContainEqual(expectedPromptInfo1);

        const expectedPromptInfo2 = {
            kotlinFilePath: 'path/to/KotlinFile.kt',
            functionName: 'myFunction',
            description: 'example.TestCase2',
            expectedOutput: 'AssertionError',
            actualOutput: '',
            junitXML: ''
        };
        expect(promptInfoList).toContainEqual(expectedPromptInfo2);
    });

    test('should return an empty array if no JUnit XML files with failed tests are found', async () => {
        const promptInfoList = await extractPromptFromJUnitXML(testResultsDir);
        expect(promptInfoList).toHaveLength(0);
    });

    test('should handle invalid XML content in JUnit XML files', async () => {
        const invalidXMLDirectory = path.join(__dirname, 'invalid_xml_files');
        const promptInfoList = await extractPromptFromJUnitXML(invalidXMLDirectory);
        expect(promptInfoList).toHaveLength(0);
    });

    beforeAll(() => {
        // Create test files for the test cases
        fs.mkdirSync(testResultsDir, { recursive: true });

        const junitXMLContent1 = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="example.TestSuite" tests="1" failures="1" errors="0" skipped="0">
<testcase name="example.TestCase1" classname="example.TestCase1">
  <failure message="AssertionError">
    <![CDATA[Expected: 42
    Actual: 43]]>
  </failure>
</testcase>
</testsuite>
    `;
        fs.writeFileSync(path.join(testResultsDir, 'test1.xml'), junitXMLContent1);

        const junitXMLContent2 = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="example.TestSuite" tests="1" failures="1" errors="0" skipped="0">
<testcase name="example.TestCase2" classname="example.TestCase2">
  <failure>AssertionError</failure>
</testcase>
</testsuite>
    `;
        fs.writeFileSync(path.join(testResultsDir, 'test2.xml'), junitXMLContent2);
    });

    afterAll(() => {
        // Remove the test files
        //fs.rmSync(testDirectory, { recursive: true });
    });
});
