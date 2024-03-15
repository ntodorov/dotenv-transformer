#!/usr/bin/env node
const { Command, Option } = require('commander');
const path = require('path');
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
    '"dotenv-transformer" will read the env vars from .env.deploy and will create secrets.yaml and custom-env.yaml. If you provide KeyVault name will check if the secrets exist in it.'
  )
  .version('1.0.0')
  .requiredOption(
    '-e, --env <environment name>',
    'the name of the environment we are deploying to'
  )
  .requiredOption(
    '-df, --dotenvFolder <paht to the .env.?? files>',
    'path to the folder containing .env.deploy file and/or .env.<environement> specific files'
  )
  .requiredOption('-s, --service <service name>', 'the name of the service')
  .requiredOption(
    '-d, --destinationPath <destination path>',
    'full folder name to save the yaml files'
  )
  .option(
    '-kv, --keyvault <Key Vault>',
    '(optional) Name of Key Vault to check if the secrets exist'
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

  //validate the paths
  validatePaths(dotenvFolder, destinationPath);

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

  if (keyVault) await keyVaultValidation(secrets, keyVault);

  // first generate in memory the YAML files
  const secretYamlDocs = generateSecretsYaml(secrets, keyVault);
  const customEnvYamlDocs = generateCustomEnvYaml(finalEnv, serviceName);

  //Now write both YAML files
  const secretYamlFile = path.join(destinationPath, 'secret.yaml');
  fs.writeFileSync(secretYamlFile, secretYamlDocs, 'utf8');
  console.log(`Generated Kubernetes file ${secretYamlFile}`);
  const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
  fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
  console.log(`Generated Kubernetes file ${customEnvYAMLFile}`);

  console.log('Done!');
};

run();
