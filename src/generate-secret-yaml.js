const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const generateSecretsYaml = (secrets, keyVault) => {
  const k8sSecrets = [];

  //for each value in secrets create new k8s secret
  for (const secret of secrets) {
    const secretName = secret;
    const vaultName = keyVault;

    // Define the Kubernetes secret YAML content
    const kubernetesSecret = {
      apiVersion: 'spv.no/v2beta1',
      kind: 'AzureKeyVaultSecret',
      metadata: {
        name: secretName,
      },
      spec: {
        vault: {
          name: vaultName,
          object: {
            name: secretName,
            type: 'secret',
          },
        },

        output: {
          secret: {
            name: secretName,
            dataKey: secretName,
          },
        },
      },
    };

    // Convert the object to YAML string

    const secretYAML = yaml.dump(kubernetesSecret);
    k8sSecrets.push(secretYAML);
  }

  const allDocs = k8sSecrets.join('---\n');

  return allDocs;
};

module.exports = { generateSecretsYaml };
