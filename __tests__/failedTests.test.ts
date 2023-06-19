import * as path from 'path';
import {FailedTestInfo, failedTests} from '../src/failedTests';

describe('failedTests', () => {
    const testResultsDir = path.join(__dirname, 'test_result_files');

    test('should extract failed test information from JUnit XML test reports', async () => {
        const failedTestInfos: FailedTestInfo[] = await failedTests(testResultsDir);
        expect(failedTestInfos).toHaveLength(1);

        const expected = {
            targetFunction: "myFunction",
            functionSourcePath: "src/test/kotlin/com/comatch/search/SelfHealingTest.kt",
            message: "expected output was 42 ==> Unexpected exception thrown: kotlin.NotImplementedError: An operation is not implemented: It will be soon"
        };
        expect(failedTestInfos).toContainEqual(expected);
    });

    test('should handle invalid XML content in JUnit XML files', async () => {
        const invalidXMLDirectory = path.join(__dirname, 'invalid_xml_files');
        const promptInfoList = await failedTests(invalidXMLDirectory);
        expect(promptInfoList).toHaveLength(0);
    });
});
