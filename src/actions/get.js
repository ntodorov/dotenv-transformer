const path = require('path');
const fs = require('fs');
const { dotenvPrep } = require('../dotenv-prep');
const { getSecretValue } = require('../secrets');
const { env } = require('process');

async function get() {
  const options = this.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;
  const varName = options.varName;

  console.log(`Extracting for environment: ${currentEnv}`);

  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);
  const outputFile = options.outputFile;
  console.log('outputFile', outputFile);

  const finalEnv = dotenvPrep(dotenvFolder, currentEnv);

  if (!finalEnv.hasOwnProperty(varName)) {
    console.warn(`Variable ${varName} not found in the environment files`);
    return;
  }

  let envValue = finalEnv[varName];
  if (envValue.startsWith('secret:')) {
    envValue = envValue.split(':')[1];
    envValue = await getSecretValue(envValue, options.keyvault);
  }
  process.env[varName] = envValue;

  console.log(`Environment variable ${varName} is populated now!`);

  return envValue;
}

module.exports = get;
