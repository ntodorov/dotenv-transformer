const yaml = require('js-yaml');
const { generateSecretProvider } = require('./generate-secret-provider');

const generateSecretsProviderYaml = (secrets, keyVault, serviceName) => {
  const secretProvider = generateSecretProvider(secrets, keyVault, serviceName);

  // Convert the object to YAML string
  const secretProviderYAML = yaml.dump(secretProvider);

  return secretProviderYAML;
};

module.exports = { generateSecretsProviderYaml };
