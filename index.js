#!/usr/bin/env node
const { Command, Option } = require('commander');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const { validatePaths, copyFiles } = require('./src/utils');
const { generateSecretsYaml } = require('./generate-secret-yaml');
const { generateCustomEnvYaml } = require('./generate-custom-vars-yaml');
const { keyVaultValidation, extractSecrets } = require('./src/secrets');

const program = new Command();
program
  .name('dotenv-transformer')
  .description(
    'Will get the env vars from .env.deploy and will create secrets.yaml and custom-env.yaml and will check if they exist in a given KeyVault.'
  )
  .version('1.0.0')
  .requiredOption(
    '-e, --env <environment name>',
    'the name of the environment we are deploying to'
  )
  .requiredOption(
    '-df, --dotenvFolder < the folder containing the .env files>',
    'path to the folder containing .env.deploy file and/or .env.<environement> specific files'
  )
  .requiredOption('-s, --service <service name>', 'the name of the service')
  .requiredOption('-kv, --keyvault <Key Vault>', 'the name of the Key Vault')
  .requiredOption(
    '-d, --destinationPath <destination path>',
    'full folder name to save the yaml files'
  )
  .option(
    '-stg, --stagingFolder <staging folder>',
    'a staging folder for the yaml files generation, before they are copied to the destination folder.',
    process.cwd()
  )
  .option(
    '-skv, --skipKV',
    'skip the key vault check, useful for local development, when the secrets are not in the key vault.'
  );

program.parse();

const run = async () => {
  const options = program.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;

  console.log(`Transforming for environment: ${currentEnv}`);

  const serviceName = options.service;
  console.log('serviceName', serviceName);
  const keyVault = options.keyvault;
  console.log('keyVault', keyVault);
  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);
  const destinationPath = options.destinationPath;
  console.log('destinationPath', destinationPath);
  const stagingFolder = options.stagingFolder;
  console.log('stagingFolder', stagingFolder);

  //validate the paths
  validatePaths(dotenvFolder, destinationPath, stagingFolder);

  let dotenvCommon = {};
  console.log('Checking if common ".env.deploy" file exists...');
  const commonDotenvFile = path.join(dotenvFolder, '.env.deploy');
  if (!fs.existsSync(commonDotenvFile)) {
    console.log(`${commonDotenvFile} file not found!`);
  } else {
    dotenvCommon = dotenv.config({ path: commonDotenvFile });
    console.log(
      `Common "${commonDotenvFile}" file loaded:`,
      dotenvCommon.parsed
    );
    dotenvExpand.expand(dotenvCommon);
    console.log(
      `parsed & interpolated "${commonDotenvFile}":`,
      dotenvCommon.parsed
    );
  }

  const dotEnvFile = path.join(dotenvFolder, `.env.${currentEnv}`);
  if (!fs.existsSync(dotEnvFile) && !fs.existsSync(commonDotenvFile)) {
    console.warn(
      `Dotenv file(s) not found! At least one of these files ".env.${currentEnv}" or ".env.deploy" must exists in "${dotenvFolder}" folder!`
    );
    console.warn('Exiting...');
    return;
  }

  let dotenvOverrides = {};
  const processEnv = {};
  if (fs.existsSync(dotEnvFile)) {
    console.log('found env specific:', dotEnvFile);
    dotenvOverrides = dotenv.config({ path: dotEnvFile });
    console.log('parsed:', dotenvOverrides.parsed);

    dotenvExpand.expand({ processEnv, parsed: dotenvOverrides.parsed });
    console.log(`interpolated env.vars from "${dotEnvFile}":`, processEnv);
  }

  const finalEnv = { ...dotenvCommon.parsed, ...processEnv };

  if (Object.keys(finalEnv).length === 0) {
    throw new Error(`No environment variables found! Exiting...`);
  }

  console.log(`FINAL env.vars:`, finalEnv);

  const secrets = extractSecrets(finalEnv);
  console.log('secrets', secrets);

  if (options.skipKV) {
    console.log('Skipping Key Vault check... --skipKV flag is set to true.');
  } else await keyVaultValidation(secrets, keyVault);

  generateSecretsYaml(secrets, keyVault, stagingFolder);
  generateCustomEnvYaml(finalEnv, serviceName, stagingFolder);

  const fileNames = ['secret.yaml', 'custom-env.yaml'];
  copyFiles(stagingFolder, destinationPath, fileNames);
  console.log('Done!');
};

run();
