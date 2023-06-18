import * as fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import axios from 'axios';
import {Octokit} from "@octokit/rest";

async function replaceFailedFunctionAndPush(
    kotlinFilePath: string,
    functionName: string,
    gptAPIEndpoint: string,
    gptAPIKey: string,
    branchName: string,
    commitMessage: string
): Promise<void> {
    // Read the Kotlin source code file
    const fileContent: string = fs.readFileSync(kotlinFilePath, 'utf-8');

    // Construct the regular expression pattern to match the Kotlin function
    const regexPattern: RegExp = new RegExp(
        `fun\\s+${functionName}\\s*\\([^)]*\\)\\s*:\\s*[\\w.]+\\s*{[^}]*}`,
        's'
    );

    // Find the Kotlin function in the file
    const match: RegExpExecArray | null = regexPattern.exec(fileContent);

    if (!match) {
        throw new Error(`Function ${functionName} not found in the Kotlin file.`);
    }

    const kotlinFunction = match[0]; // Extracted Kotlin function

    // Prepare the prompt for the ChatGPT API
    const prompt = `Improve the Kotlin function "${functionName}" to fix the failed test case.\n\n` +
        `Current function:\n${kotlinFunction}\n\n` +
        `Constraints: The solution should be compatible with Kotlin version X and follow coding standards Y.\n\n` +
        `// Add any additional comments or instructions here.\n\n` +
        `Failed test case prompt: <Prompt generated from failed test case information>\n\n` +
        `Suggested Kotlin function:`;

    // Send the prompt to the ChatGPT API for improvement
    const response = await axios.post(
        gptAPIEndpoint,
        {
            prompt: prompt,
            max_tokens: 200,
            temperature: 0.7
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${gptAPIKey}`
            }
        }
    );

    const suggestion = response.data.choices[0].text.trim(); // Extracted suggestion from ChatGPT API

    // Replace the Kotlin function with the suggestion
    const updatedContent = fileContent.replace(regexPattern, suggestion);

    // Write the updated content back to the Kotlin file
    fs.writeFileSync(kotlinFilePath, updatedContent, 'utf-8');

    // Initialize GitHub context
    const context = github.context;

    // Get the GitHub token from the action's inputs
    const githubToken = core.getInput('github-token');

    try {
        // Create a new Octokit client using the token
        const octokit = new Octokit({ auth: githubToken });

        // Commit and push the changes to the given branch
        await octokit.repos.createOrUpdateFileContents({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: kotlinFilePath,
            content: updatedContent,
            message: commitMessage,
            branch: branchName,
            sha: context.sha
        });

        console.log(`Changes pushed to branch: ${branchName}`);
    } catch (error) {
        core.setFailed(`Failed to push changes to branch: ${branchName}. Error: ${error.message}`);
    }
}

// Example usage
const kotlinFilePath = 'path/to/KotlinFile.kt';
const functionName = 'myFunction';
const gptAPIEndpoint = 'https://api.chatgpt.com/v1/engines/davinci-codex/completions';
const gptAPIKey = 'YOUR_GPT_API_KEY';
const branchName = 'fix-function';
const commitMessage = 'Fix function based on suggestion from ChatGPT API';

replaceFailedFunctionAndPush(kotlinFilePath, functionName, gptAPIEndpoint, gptAPIKey, branchName, commitMessage)
    .catch((error) => {
        console.error('An error occurred:', error);
    });
