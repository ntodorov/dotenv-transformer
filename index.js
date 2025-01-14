#!/usr/bin/env node
const { Command } = require('commander');
const path = require('path');

const packageJson = require('./package.json');

const program = new Command();
program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command('gen')
  .description('generate the yaml files')
  .alias('g')
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
  .requiredOption(
    '-kv, --keyvault <Key Vault>',
    'Key Vault name to be used in for secret.yaml, and to check if the secrets exist'
  )
  .option(
    '-skv, --skipKV',
    '(optional) if provided will skip the check for the secrets in the Key Vault'
  )
  .option(
    '-u, --update',
    '(optional) if provided will update the secrets in the secret.yaml if the file exists'
  )
  .action(require('./src/actions/gen'));

program
  .command('extract')
  .description(
    'extracts the environment variables from the .env.deploy and .env.<env> files, properly interpolating and overriding the values'
  )
  .alias('e')
  .requiredOption(
    '-e, --env <environment name>',
    'the name of the environment we are deploying to'
  )
  .requiredOption(
    '-df, --dotenvFolder <paht to the .env.?? files>',
    'path to the folder containing .env.deploy file and/or .env.<environement> specific files'
  )
  .requiredOption(
    '-o, --outputFile <file name with path>',
    'file name with path to save the interpolated environment variables - defalut is .env.build in current folder',
    path.join(process.cwd(), '.env.build') //default value
  )
  .option(
    '-kv, --keyvault <Key Vault>',
    'Key Vault name to be used to get secret value. If this options is provided the tool will get the secret value from the Key Vault'
  )
  .action(require('./src/actions/extract'));

program
  .command('update')
  .description('update the custom-env.yaml file')
  .alias('u')
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
  .action(require('./src/actions/update'));

program.parse();
