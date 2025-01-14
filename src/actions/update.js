const path = require('path');
const fs = require('fs');
const { dotenvPrepForUpdate } = require('../dotenv-prep-for-update');
const { updateCustomEnvYaml } = require('../update-custom-vars-yaml');

async function gen() {
  const options = this.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;

  console.log(`Transforming for environment: ${currentEnv}`);

  const serviceName = options.service;
  console.log('serviceName', serviceName);
  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);
  const destinationPath = options.destinationPath;
  console.log('destinationPath', destinationPath);

  const allEnvConfigs = dotenvPrepForUpdate(dotenvFolder, currentEnv);

  const { finalEnv, internalFinalEnv, supportFinalEnv } = allEnvConfigs;

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
  }
  if (!fs.existsSync(destinationPath)) {
    console.error(`Destination folder "${destinationPath}" does not exist!`);
    process.exit(1);
  }

  fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
  console.log(`${action} Kubernetes file ${customEnvYAMLFile}`);

  if (internalFinalEnv) {
    const internalEnvs = internalFinalEnv;

    const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
    let customEnvYamlDocs = '';
    const internalServiceName = `${serviceName}-internal`;
    if (fs.existsSync(customEnvYAMLFile)) {
      customEnvYamlDocs = updateCustomEnvYaml(
        customEnvYAMLFile,
        internalEnvs,
        internalServiceName
      );
      fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
      console.log(`Updated Kubernetes file ${customEnvYAMLFile}`);
    }
  }

  if (supportFinalEnv) {
    const supportEnvs = supportFinalEnv;

    const customEnvYAMLFile = path.join(destinationPath, 'custom-env.yaml');
    let customEnvYamlDocs = '';
    const supportServiceName = `${serviceName}-support`;
    if (fs.existsSync(customEnvYAMLFile)) {
      customEnvYamlDocs = updateCustomEnvYaml(
        customEnvYAMLFile,
        supportEnvs,
        supportServiceName
      );
      fs.writeFileSync(customEnvYAMLFile, customEnvYamlDocs, 'utf8');
      console.log(`Updated Kubernetes file ${customEnvYAMLFile}`);
    }
  }

  console.log('Done!');
}

module.exports = gen;
