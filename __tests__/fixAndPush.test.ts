import * as fs from 'fs';
import * as path from 'path';
import { fixAndPush } from '../src/fixAndPush';
import * as dotenv from "dotenv";
// Import the necessary dependencies for mocking
// import { getFixSuggestion, commitAndPush } from '../src/fixAndPush';

// jest.mock('fs');
// jest.mock('./yourDependencies');

describe('fixAndPush', () => {

    const sourceCodeDir = path.join(__dirname, 'test_source_code_files');
    const targetTestFileName = "SelfHealingTest";
    const openaiAPIKey = process.env.OPENAI_API_KEY;

    // beforeEach(() => {
    //     jest.clearAllMocks();
    // });

    it('should fix failures and push changes', async () => {
        const failures = [
            {
                targetFunction: 'myFunction',
                functionSourcePath: `${sourceCodeDir}/${targetTestFileName}Copy.kt`,
                message: 'expected output was 42 ==> Unexpected exception thrown: kotlin.NotImplementedError: An operation is not implemented: It will be soon',
            },
            // Add more failure objects as needed
        ];
        await fixAndPush(failures, openaiAPIKey);
    });

    beforeAll(() => {
        const pwd = path.resolve(__dirname, "../../.env")
        console.log( pwd )
        //dotenv.config({ path: path.resolve(__dirname, "../../.env") })
        dotenv.config()
        // Create test files for the test cases
        fs.copyFileSync(
            `${sourceCodeDir}/${targetTestFileName}.kt`,
            `${sourceCodeDir}/${targetTestFileName}Copy.kt`);
    });

    afterAll(() => {
        // Remove the test files
        fs.rmSync(`${sourceCodeDir}/${targetTestFileName}Copy.kt`);
    });
});
