const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { generateSecret } = require('./generate-secret');

const generateSecretsYaml = (secrets, keyVault) => {
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

module.exports = { generateSecretsYaml };
