const generateSecret = (secret, keyVault) => {
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

  return kubernetesSecret;
};

module.exports = { generateSecret };
