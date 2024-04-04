const path = require('path');
const fs = require('fs');
const { dotenvPrep } = require('../dotenv-prep');
const { extractSecrets, getSecretValue } = require('../secrets');

async function extract() {
  const options = this.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;
  const keyVault = options.keyvault;

  console.log(`Extracting for environment: ${currentEnv}`);

  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);
  const outputFile = options.outputFile;
  console.log('outputFile', outputFile);

  let finalEnv = dotenvPrep(dotenvFolder, currentEnv);

  let noSecrets = true;

  if (keyVault) {
    console.log('Key Vault is provided!');
    const secrets = extractSecrets(finalEnv);
    console.log('secrets', secrets);
    //for each secret await the getSecretValue
    for (let secret of secrets) {
      let secretValue = await getSecretValue(secret, keyVault);
      finalEnv[secret] = secretValue;
      noSecrets = false;
    }
  }

  let envContent = '';
  for (let key in finalEnv) {
    let value = finalEnv[key];
    envContent += `${key}=${value}\n`;
  }

  if (noSecrets) {
    console.log('envContent', envContent);
  }

  fs.writeFileSync(outputFile, envContent);
  console.log(`File "${outputFile}" created!`);

  return envContent;
}

module.exports = extract;
