<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Create a JavaScript Action using TypeScript

Use this template to bootstrap the creation of a TypeScript action.:rocket:

This template includes compilation support, tests, a validation workflow, publishing, and versioning guidance.  

If you are new, there's also a simpler introduction.  See the [Hello World JavaScript Action](https://github.com/actions/hello-world-javascript-action)

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function run() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action

##

## Improve Prompt Accuracy
To improve the prompt for the ChatGPT API and receive more accurate responses, you can consider the following suggestions:

Provide Context: Include some context or description about the specific improvement you're seeking for the Kotlin function. For example, mention if you want to optimize performance, improve readability, handle specific edge cases, or any other specific goals you have in mind.

Specify Constraints: If there are any constraints or requirements for the suggested improvement, mention them explicitly. For instance, if you need the solution to be compatible with a particular Kotlin version or adhere to certain coding standards, communicate those constraints in the prompt.

Code Comments: Add comments within the Kotlin function code to provide additional explanation or clarify any specific areas that you want the model to focus on. This can help guide the model's attention and understanding of the function.

Input/Output Examples: Include example input/output pairs to illustrate how the Kotlin function should behave or handle specific cases. This can assist the model in understanding the expected behavior and producing a more accurate suggestion.

Limit Response Length: Set a reasonable limit on the response length using the max_tokens parameter to ensure concise and focused suggestions. Experiment with different values to find the optimal balance between accuracy and response length.

Adjust Temperature: Adjust the temperature parameter to control the randomness of the generated responses. Higher values (e.g., 0.7) result in more diverse and creative suggestions, while lower values (e.g., 0.2) produce more focused and deterministic responses. Experiment with different values to find the desired balance.

Remember that the effectiveness of the prompt may vary depending on the complexity of the Kotlin function and the specific improvements you seek. It's recommended to iterate and fine-tune the prompt based on the results and feedback you receive to achieve the desired accuracy and quality of suggestions.
