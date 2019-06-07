/**
 * Exports custom routes related to todos.
 * @since 3/1/19
 * @file
 */
import fs from 'fs';
import logger from '@passportinc/funyan';
import Octokit from '@octokit/rest';

const log = logger.child('routes:code-challenges');
const octokit = new Octokit({
  auth: 'token 9d8b15a803125ce2cf7d71aa8aaaa455e67803c9',
});

const allowedAction = 'candidate_stage_change';
const allowedStage = 'Code Challenge';

/**
 * A route that creates a code challenge repo when a user is moved to the
 * challenge stage
 * @param {Request} request The HTTP Request object.
 * @param {Response} response The HTTP Response object.
 * @returns {undefined}
 * @export
 */
export async function createCodeChallenge(req, res) {
  console.log(JSON.stringify(req.body, null, 2));
  if (req.body.action === 'ping') {
    return res.status(200).json(true);
  }
  const {
    action,
    payload: {
      application: {
        current_stage,
        custom_fields: { github_account },
      },
    },
  } = req.body;

  const stream = fs.createWriteStream(`challenge_data.json`);
  stream.once('open', function(fd) {
    stream.write(JSON.stringify(req.body));
    stream.end();
  });
  log.info('GITHUB_ACCOUNT');
  log.info(github_account.value);

  if (action === allowedAction && current_stage.name === allowedStage) {
    try {
      const { data } = await octokit.repos.listForUser({
        username: 'jayehmke',
      });
      const existingRepos = data.filter(
        repo => repo.name === github_account.value,
      );

      if (existingRepos.length) {
        return res.status(422).json({ message: 'Repo exists' });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({ error: e.message });
    }
    try {
      const newRepoData = await octokit.repos.createForAuthenticatedUser({
        name: github_account.value,
        description: `Code Challenge for ${github_account.value}`,
        private: false,
        auth_init: false,
      });

      return res.json(newRepoData.data);
    } catch (e) {
      console.log(e);
      return res.status(500).send({ error: e.message });
    }
  } else {
    return res.status(200).json({
      message: 'Hook not handled',
    });
  }
}
