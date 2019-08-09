/**
 * The API for the Permits Todo Service.
 * @since 7/24/18
 * @file
 */

import app from '../../app';
import Todos from '../../database/Todos';
import { exports } from '../../constants';
import log from '@passportinc/funyan';
require('dotenv').config();

import * as routes from './routes';

const rp = require('request-promise');

// A custom route to get todos by name.

app.get('/code_challenges', (req, res)=>{
  const get_repos = {
    method: 'GET',
    uri: `https://api.github.com/user/repos?access_token=${process.env.ACCESS_TOKEN}`,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true,
  };

  try{
    rp(create_repo);
  }catch(err){
    log.info(err);
  }
});

app.post('/code_challenges', async (req,res)=>{

  const createRepo = async ({new_repo}) => {
    log.info("Inside create repo");
    const check_repo = {
        method: 'GET',
        uri: `https://api.github.com/repos/${process.env.CURR_ACCOUNT}/${new_repo}?access_token=${process.env.ACCESS_TOKEN}`,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
      };

  //    console.log("checking if repo already exists");
      log.info("checking if repo already exists");
      const repo_exists = await rp(check_repo)
      .catch(err=>{
        console.log(`No repo by this name ${err.message}`);
      });

      if (repo_exists){
        return('Repo already exists');
      }
      else {
        const create_repo = {
          method: 'POST',
          uri: `https://api.github.com/user/repos?access_token=${process.env.ACCESS_TOKEN}`,
          headers: {
              'User-Agent': 'Request-Promise'
          },
          body: {
            "name": new_repo,
            "description": `Making private repo for Code Challenge phase`,
            "homepage": "https://github.com",
            "private": true,
          },
          json: true,
        };
        return await rp(create_repo);
      };

    };

  const addCollab = ({new_repo, user_id}) => {
    console.log("inside addCollab");
    const add_collab = {
      method: 'PUT',
      uri: `https://api.github.com/repos/${process.env.CURR_ACCOUNT}/${new_repo}/collaborators/${user_id}?access_token=${process.env.ACCESS_TOKEN}`,
      headers: {
          'User-Agent': 'Request-Promise',
      },
      json: true,
    };
    return rp(add_collab);
  };

module.exports.func_code_challenges = async (event) => {
  console.log("Inside code_challenges function");

    //Read data from stage_change.json
    // remember to change this with api call to lambda function.
  const ipdata = JSON.parse(fs.readFileSync('stage_change.json','utf8'));

  console.log("Reading data from file");

    const {
      action,
      payload: {
        application: {
          current_stage,
          candidate:{
            first_name,
            last_name,
            custom_fields:{
              git_hub_user_name,
            }
          },
        },
      },
    } = ipdata;

    const new_repo = `${first_name.replace(/ +/g, "")}_${last_name.replace(/ +/g, "")}`;
    const user_id = (git_hub_user_name.name).trim();
    console.log(new_repo, user_id);

    try {
      if (action === exports.ALLOWED_ACTION && current_stage.name === exports.ALLOWED_STAGE) {
        const repo = await createRepo({new_repo});
        if (repo == 'Repo already exists'){
          return res.status(400).json({
            message: repo,
          });
        }
        else{
          const res = await addCollab({new_repo, user_id});
          return ('Repo created and user added');
          return res.status(200).json({
            message: `'Repo created and ${user_id} added as collaborator'`,
          });
          };
      }
    } catch (err) {
    console.log(err);
    res.status(400).JSON({
      message:err.message,
    })
  };

}

});

export { app };
