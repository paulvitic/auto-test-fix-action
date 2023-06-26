// ee: https://codelounge.dev/getting-started-with-the-githubs-rest-api
//See: https://blog.dennisokeeffe.com/blog/2020-06-22-using-octokit-to-create-files
import {Octokit} from '@octokit/action'

// import {OctokitResponse} from '@octokit/types'
// import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
// import * as core from '@actions/core'
import {UpdatedContent} from './fixSuggestion'

const commitMessage = 'Fix function based on suggestion from ChatGPT API'

type Tree = UpdatedContent & {
  mode?: '100644' | '100755' | '040000' | '160000' | '120000' | undefined
  type?: 'commit' | 'tree' | 'blob' | undefined
  sha?: string | null | undefined
}

export const pushFiles = async (
  updatedContent: UpdatedContent[],
  context: Context,
  githubToken: string
): Promise<unknown> => {
  const {
    repo: {owner, repo},
    ref
  } = context
  console.log(`context repo owner: ${owner}, repo: ${repo}, ref: ${ref}`)

  return new Promise(async (resolve, reject) => {
    try {
      const octokit = new Octokit({
        auth: githubToken
      })

      const commits = await octokit.repos.listCommits({owner, repo})
      const latestCommitSHA = commits.data[0].sha

      const files = updatedContent.map(function (upt: UpdatedContent): Tree {
        return {
          mode: '100644',
          ...upt
        }
      })

      // git add .
      const {
        data: {sha: treeSHA}
      } = await octokit.git.createTree({
        owner,
        repo,
        tree: files,
        base_tree: latestCommitSHA
      })

      // git commit -m 'Changes via API'
      const {
        data: {sha: newCommitSHA}
      } = await octokit.git.createCommit({
        owner,
        repo,
        author: {
          name: '',
          email: ''
        },
        tree: treeSHA,
        message: commitMessage,
        parents: [latestCommitSHA]
      })

      // git push origin HEAD
      const result = await octokit.git.updateRef({
        owner,
        repo,
        ref,
        sha: newCommitSHA
      })
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}

// async function commitAndPush(
//   filePath: string,
//   updatedContent: string,
//   branchName: string
// ): Promise<void> {
//   // Initialize GitHub context
//   const context: Context = github.context
//
//   // Get the GitHub token from the action's inputs
//   const githubToken: string = core.getInput('githubToken')
//
//   try {
//     // Create a new Octokit client using the token
//     const octokit = new Octokit({auth: githubToken})
//
//     // Commit and push the changes to the given branch
//     await octokit.repos.createOrUpdateFileContents({
//       owner: context.repo.owner,
//       repo: context.repo.repo,
//       path: filePath,
//       content: updatedContent,
//       message: commitMessage,
//       branch: branchName,
//       sha: context.sha
//     })
//   } catch (error) {
//     if (error instanceof Error) {
//       core.setFailed(
//         `Failed to push changes to branch: ${branchName}. Error: ${error.message}`
//       )
//     } else {
//       core.setFailed(`Failed to push changes to branch: ${branchName}.`)
//     }
//   }
// }
