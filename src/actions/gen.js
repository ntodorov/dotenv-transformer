const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const { validatePaths } = require('../utils');
const { generateSecretsYaml } = require('../generate-secret-yaml');
const { generateCustomEnvYaml } = require('../generate-custom-vars-yaml');
const { keyVaultValidation, extractSecrets } = require('../secrets');

async function gen() {
  const options = this.opts();

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

  //skip if skipKV is provided
  if (!options.skipKV) await keyVaultValidation(secrets, keyVault);

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
}

module.exports = gen;
