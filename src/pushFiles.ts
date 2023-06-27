// ee: https://codelounge.dev/getting-started-with-the-githubs-rest-api
//See: https://blog.dennisokeeffe.com/blog/2020-06-22-using-octokit-to-create-files
import {Octokit} from '@octokit/action'

// import {OctokitResponse} from '@octokit/types'
// import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
// import * as core from '@actions/core'
import {UpdatedContent} from './fixSuggestion'

const commitMessage = 'Fix failed tests based on suggestion from OpenAI'

type Tree = UpdatedContent & {
  mode?: '100644' | '100755' | '040000' | '160000' | '120000' | undefined
  type?: 'commit' | 'tree' | 'blob' | undefined
  sha?: string | null | undefined
}

export const pushFiles = async (
  updatedContent: UpdatedContent[],
  context: Context
): Promise<unknown> => {
  const {
    repo: {owner, repo},
    ref
  } = context
  console.log(`context repo owner: ${owner}, repo: ${repo}, ref: ${ref}`)

  return new Promise(async (resolve, reject) => {
    try {
      const octokit = new Octokit()

      const commits = await octokit.repos.listCommits({owner, repo})
      const latestCommitSHA = commits.data[0].sha
      const latestCommitAuthor = commits.data[0].commit.author

      if (!latestCommitAuthor || latestCommitAuthor.name === 'openai') {
        console.log(
          'No latest commit author or latest commit is from openai. Will not continue'
        )
        return
      }

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
      console.log(`treeSHA: ${treeSHA}`)

      // git commit -m 'Changes via API'
      const {
        data: {sha: newCommitSHA}
      } = await octokit.git.createCommit({
        owner,
        repo,
        author: {
          name: 'openai',
          email: latestCommitAuthor.email || ''
        },
        tree: treeSHA,
        message: commitMessage,
        parents: [latestCommitSHA]
      })
      console.log(`newCommitSHA: ${newCommitSHA}`)

      // git push origin HEAD
      const result = await octokit.git.updateRef({
        owner,
        repo,
        ref: ref.replace('refs/', ''),
        sha: newCommitSHA
      })
      console.log('pushFiles done')
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}
