//function that accepts a list of strings the secret names, and checks if they exist in Azure KeyVault
// Returns a list of secrets that do not exist in Azure KeyVault
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
// const { readSecrets } = require("./read-yaml");

const checkSecrets = async (secrets, keyVaultName) => {
  const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

  const credential = new DefaultAzureCredential();
  const client = new SecretClient(keyVaultUrl, credential);

  const existingSecretNames = [];
  for await (const secretProperties of client.listPropertiesOfSecrets()) {
    existingSecretNames.push(secretProperties.name);
  }

  // console.debug('passed secrets:',secrets);
  // console.debug(`list of ${keyVaultName}:`,existingSecretNames);

  const missingSecrets = secrets.filter(
    (secret) => !existingSecretNames.includes(secret)
  );

  return missingSecrets;
};

async function keyVaultValidation(secrets, keyVault) {
  console.log(`Validating if secrets exist in KeyVault ${keyVault}`);
  const missingSecrets = await checkSecrets(secrets, keyVault);
  if (missingSecrets.length > 0) {
    // console.error('The following secrets are missing in the KeyVault:');
    // console.error(missingSecrets);
    throw new Error(
      `Error! Missing secrets in keyVault "${keyVault}" : ${missingSecrets}`
    );
  } else {
    console.log('All secrets are present in the KeyVault');
  }
}

//It will extract the values of envrinment variables passed to the function
// and will return array of strings with the secret names.
//secret is considered any env.var that has the string "secret:" in the value
//It will strip that prefix and all that is after is the name of the secret
const extractSecrets = (envVars) => {
  const secrets = [];
  for (const key in envVars) {
    if (envVars[key].startsWith('secret:')) {
      secrets.push(envVars[key].split(':')[1]);
    }
  }
  return secrets;
};

module.exports = { checkSecrets, keyVaultValidation, extractSecrets };
