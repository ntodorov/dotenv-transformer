const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { generateSecret } = require('./generate-secret');
const {
  generateSecretsProviderYaml,
} = require('./generate-secrets-provider-yaml');

const generateSecretsYamlOLD = (secrets, keyVault) => {
  const k8sSecrets = [];

  //for each value in secrets create new k8s secret
  for (const secret of secrets) {
    const kubernetesSecret = generateSecret(secret, keyVault);
    // Convert the object to YAML string
    const secretYAML = yaml.dump(kubernetesSecret);
    k8sSecrets.push(secretYAML);
  }

  const allDocs = k8sSecrets.join('---\n');

  return allDocs;
};

const generateSecretsYaml = (secrets, keyVault, useSecretProvider) => {
  if (useSecretProvider) {
    return generateSecretsProviderYaml(secrets, keyVault);
  } else {
    return generateSecretsYamlOLD(secrets, keyVault);
  }
};

module.exports = { generateSecretsYaml };
