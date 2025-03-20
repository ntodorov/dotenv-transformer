const generateSecretProvider = (secrets, keyVault, serviceName) => {
  // Define the SecretProviderClass YAML content
  const secretProvider = {
    apiVersion: 'secrets-store.csi.x-k8s.io/v1',
    kind: 'SecretProviderClass',
    metadata: {
      name: `${serviceName}-secrets`,
    },
    spec: {
      provider: 'azure',
      secretObjects: secrets.map((secret) => ({
        secretName: secret,
        type: 'Opaque',
        data: [
          {
            objectName: secret,
            key: secret,
          },
        ],
      })),
      parameters: {
        tenantId: 'provide tenantId', // Should come from config
        clientID: 'provide clientID', // Should come from config
        usePodIdentity: 'false',
        keyvaultName: keyVault,
        objects: `array:\n${secrets
          .map(
            (secret) =>
              `        - |\n          objectName: ${secret}\n          objectType: secret`
          )
          .join('\n')}`,
      },
    },
  };

  return secretProvider;
};

module.exports = { generateSecretProvider };
