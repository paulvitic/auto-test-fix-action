import {pushFiles} from '../src/pushFiles'
import {Octokit} from '@octokit/action'
import {Context} from '@actions/github/lib/context'
import * as dotenv from 'dotenv'
import * as path from 'path'

jest.mock('@octokit/action')
dotenv.config({path: path.resolve(__dirname, '../.env')})

describe('pushFiles', () => {
  const updatedContent = [
    {path: 'file1.txt', content: 'File 1 content'},
    {path: 'file2.txt', content: 'File 2 content'}
  ]
  const context: Context = {
    action: '',
    actor: '',
    apiUrl: '',
    eventName: '',
    graphqlUrl: '',
    job: '',
    payload: {},
    runId: 0,
    runNumber: 0,
    serverUrl: '',
    sha: '',
    workflow: '',
    get issue(): {owner: string; repo: string; number: number} {
      return {number: 0, owner: '', repo: ''}
    },
    repo: {
      owner: 'paulvitic',
      repo: 'auto-test-fix-action'
    },
    ref: 'refs/heads/master'
  }
  const githubToken: string = process.env.GITHUB_TOKEN || ''

  beforeEach(() => {
    // Reset the mock for each test
    ;(Octokit as jest.MockedClass<typeof Octokit>).mockClear()
  })

  test.skip('should push files to GitHub', async () => {
    // const octokitMock = new Octokit() as jest.Mocked<Octokit>;
    //
    // // Mock the necessary Octokit methods
    // octokitMock.repos.listCommits.mockResolvedValueOnce({
    //   data: [{ sha: 'latestCommitSHA' }]
    // });
    // octokitMock.git.createTree.mockResolvedValueOnce({
    //   data: { sha: 'treeSHA' }
    // });
    // octokitMock.git.createCommit.mockResolvedValueOnce({
    //   data: { sha: 'newCommitSHA' }
    // });
    // octokitMock.git.updateRef.mockResolvedValueOnce({
    //   data: { result: 'success' }
    // });

    const result = await pushFiles(updatedContent, context)

    expect(result).toEqual({result: 'success'})
    // expect(octokitMock.repos.listCommits).toHaveBeenCalledWith({
    //   owner: 'owner',
    //   repo: 'repo'
    // });
    // expect(octokitMock.git.createTree).toHaveBeenCalledWith({
    //   owner: 'owner',
    //   repo: 'repo',
    //   tree: [
    //     { mode: '100644', path: 'file1.txt', content: 'File 1 content' },
    //     { mode: '100644', path: 'file2.txt', content: 'File 2 content' }
    //   ],
    //   base_tree: 'latestCommitSHA'
    // });
    // expect(octokitMock.git.createCommit).toHaveBeenCalledWith({
    //   owner: 'owner',
    //   repo: 'repo',
    //   author: { name: '', email: '' },
    //   tree: 'treeSHA',
    //   message: expect.any(String),
    //   parents: ['latestCommitSHA']
    // });
    // expect(octokitMock.git.updateRef).toHaveBeenCalledWith({
    //   owner: 'owner',
    //   repo: 'repo',
    //   ref: 'refs/heads/master',
    //   sha: 'newCommitSHA'
    // });
  })

  test.skip('should reject if an error occurs', async () => {
    // const octokitMock = new Octokit() as jest.Mocked<Octokit>;
    //
    // // Mock an error in one of the Octokit methods
    // octokitMock.repos.listCommits.mockRejectedValueOnce(new Error('API Error'));

    await expect(
      pushFiles(updatedContent, context)
    ).rejects.toThrowError('API Error')
    // expect(octokitMock.repos.listCommits).toHaveBeenCalledWith({
    //   owner: 'owner',
    //   repo: 'repo'
    // });
    // // Ensure other Octokit methods are not called
    // expect(octokitMock.git.createTree).not.toHaveBeenCalled();
    // expect(octokitMock.git.createCommit).not.toHaveBeenCalled();
    // expect(octokitMock.git.updateRef).not.toHaveBeenCalled();
  })
})
