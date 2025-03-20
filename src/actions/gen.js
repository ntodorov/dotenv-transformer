const path = require('path');
const fs = require('fs');
const { dotenvPrep } = require('../dotenv-prep');
const { generateSecretsYaml } = require('../generate-secret-yaml');
const { generateCustomEnvYaml } = require('../generate-custom-vars-yaml');
const { keyVaultValidation, extractSecrets } = require('../secrets');
const { overrideCustomEnvYaml } = require('../override-custom-vars-yaml');
const { updateSecretYaml } = require('../update-secret-yaml');

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
  const useSecretProvider = options.useSecretProvider;
  if (useSecretProvider) {
    console.log('Using SecretProviderClass format for secrets');
  }

  const allEnvConfigs = dotenvPrep(dotenvFolder, currentEnv);

  const { finalEnv, internalFinalEnv, supportFinalEnv } = allEnvConfigs;
  const secrets = extractSecrets(finalEnv);
  console.log('secrets', secrets);

  try {
    //skip if skipKV is provided
    if (!options.skipKV) await keyVaultValidation(secrets, keyVault);
  } catch (error) {
    console.error('Error validating secrets', error);
    process.exit(1);
  }

  // first generate in memory the YAML files
  let secretYamlDocs = '';
  let secretAction = '';
  let secretYamlFile = path.join(destinationPath, `secret-${serviceName}.yaml`);
  if (!fs.existsSync(secretYamlFile))
    secretYamlFile = path.join(destinationPath, 'secret.yaml');
  if (fs.existsSync(secretYamlFile)) {
    secretYamlDocs = updateSecretYaml(
      secrets,
      keyVault,
      secretYamlFile,
      useSecretProvider,
      serviceName
    );
    secretAction = 'Updated';
  } else {
    secretYamlDocs = generateSecretsYaml(secrets, keyVault, useSecretProvider);
    secretAction = 'Generated';
  }
  const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
  let customEnvYamlDocs = '';
  let action = '';
  if (fs.existsSync(customEnvYAMLFile)) {
    customEnvYamlDocs = overrideCustomEnvYaml(
      customEnvYAMLFile,
      finalEnv,
      serviceName
    );
    action = 'Updated';
  } else {
    customEnvYamlDocs = generateCustomEnvYaml(finalEnv, serviceName);
    action = 'Generated';
  }
  if (!fs.existsSync(destinationPath)) {
    console.error(`Destination folder "${destinationPath}" does not exist!`);
    process.exit(1);
  }

  //Now write both YAML files

  if (secrets.length > 0) {
    fs.writeFileSync(secretYamlFile, secretYamlDocs, 'utf8');
    console.log(`${secretAction} Kubernetes file ${secretYamlFile}`);
  }

  fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
  console.log(`${action} Kubernetes file ${customEnvYAMLFile}`);

  if (internalFinalEnv) {
    const internalEnvs = internalFinalEnv;
    const secrets = extractSecrets(internalEnvs);
    console.log('secrets - internal', secrets);

    const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
    let customEnvYamlDocs = '';
    let action = '';
    const internalServiceName = `${serviceName}-internal`;
    if (fs.existsSync(customEnvYAMLFile)) {
      customEnvYamlDocs = overrideCustomEnvYaml(
        customEnvYAMLFile,
        internalEnvs,
        internalServiceName
      );
      action = 'Updated';
    } else {
      customEnvYamlDocs = generateCustomEnvYaml(
        internalEnvs,
        internalServiceName
      );
      action = 'Generated';
    }

    fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
    console.log(`${action} Kubernetes file ${customEnvYAMLFile}`);
  }
  if (supportFinalEnv) {
    const supportEnvs = supportFinalEnv;
    const secrets = extractSecrets(supportEnvs);
    console.log('secrets - support', secrets);

    const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
    let customEnvYamlDocs = '';
    let action = '';
    const supportServiceName = `${serviceName}-support`;
    if (fs.existsSync(customEnvYAMLFile)) {
      customEnvYamlDocs = overrideCustomEnvYaml(
        customEnvYAMLFile,
        supportEnvs,
        supportServiceName
      );
      action = 'Updated';
    } else {
      customEnvYamlDocs = generateCustomEnvYaml(
        supportEnvs,
        supportServiceName
      );
      action = 'Generated';
    }

    fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
    console.log(`${action} Kubernetes file ${customEnvYAMLFile}`);
  }

  console.log('Done!');
}

module.exports = gen;
