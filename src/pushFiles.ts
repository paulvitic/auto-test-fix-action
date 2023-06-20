// ee: https://codelounge.dev/getting-started-with-the-githubs-rest-api
//See: https://blog.dennisokeeffe.com/blog/2020-06-22-using-octokit-to-create-files
import {Octokit} from '@octokit/rest'
import {OctokitResponse} from '@octokit/types'
import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
import * as core from '@actions/core'
import {UpdatedContent} from './fixPush'

export const pushFiles = async (
  updatedContent: UpdatedContent[]
): Promise<OctokitResponse<any>> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Initialize GitHub context
      const context: Context = github.context

      // Get the GitHub token from the action's inputs
      const githubToken: string = core.getInput('githubToken')
      const octokit = new Octokit({auth: githubToken})
      //git pull
      const commits = await octokit.repos.listCommits({
        owner: context.repo.owner,
        repo: context.repo.repo
      })

      const latestCommitSHA = commits.data[0].sha

      // make changes
      const files = [
        updatedContent.map(function (upt) {
          return {
            mode: '100644',
            ...upt
          }
        })
      ]
      //     {
      //     mode: '100644',
      //     path: 'src/file1.txt',
      //     content: 'Hello world 1', //whatever
      // },{
      //     mode: '100644',
      //     path: 'src/file2.txt',
      //     content: 'Hello world 2',
      // }];

      // git add .
      const {
        data: {sha: treeSHA}
      } = await octokit.git.createTree({
        owner: context.repo.owner,
        repo: context.repo.repo,
        // @ts-ignore
        tree: files,
        base_tree: latestCommitSHA
      })

      // git commit -m 'Changes via API'
      const {
        data: {sha: newCommitSHA}
      } = await octokit.git.createCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        author: {
          name: '',
          email: ''
        },
        tree: treeSHA,
        message: 'Changes via API',
        parents: [latestCommitSHA]
      })

      // git push origin HEAD
      const result = await octokit.git.updateRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: context.ref,
        sha: newCommitSHA
      })
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}
