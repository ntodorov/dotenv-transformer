const path = require('path');
const fs = require('fs');
const { dotenvPrep } = require('../dotenv-prep');
const { generateSecretsYaml } = require('../generate-secret-yaml');
const { generateCustomEnvYaml } = require('../generate-custom-vars-yaml');
const { keyVaultValidation, extractSecrets } = require('../secrets');
const { updateCustomEnvYaml } = require('../update-custom-vars-yaml');

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

  const allEnvConfigs = dotenvPrep(dotenvFolder, currentEnv);

  const finalEnv = Array.isArray(allEnvConfigs)
    ? allEnvConfigs[0]
    : allEnvConfigs;
  const secrets = extractSecrets(finalEnv);
  console.log('secrets', secrets);

  //skip if skipKV is provided
  if (!options.skipKV) await keyVaultValidation(secrets, keyVault);

  // first generate in memory the YAML files
  const secretYamlDocs = generateSecretsYaml(secrets, keyVault);

  const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
  let customEnvYamlDocs = '';
  let action = '';
  if (fs.existsSync(customEnvYAMLFile)) {
    customEnvYamlDocs = updateCustomEnvYaml(
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
  let secretYamlFile = path.join(destinationPath, `secret-${serviceName}.yaml`);
  if (!fs.existsSync(secretYamlFile))
    secretYamlFile = path.join(destinationPath, 'secret.yaml');
  fs.writeFileSync(secretYamlFile, secretYamlDocs, 'utf8');
  console.log(`Generated Kubernetes file ${secretYamlFile}`);

  fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
  console.log(`${action} Kubernetes file ${customEnvYAMLFile}`);

  if (Array.isArray(allEnvConfigs) && allEnvConfigs[1]) {
    const internalEnvs = allEnvConfigs[1];
    const secrets = extractSecrets(internalEnvs);
    console.log('secrets - internal', secrets);

    const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
    let customEnvYamlDocs = '';
    let action = '';
    const internalServiceName = `${serviceName}-internal`;
    if (fs.existsSync(customEnvYAMLFile)) {
      customEnvYamlDocs = updateCustomEnvYaml(
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

  console.log('Done!');
}

module.exports = gen;
