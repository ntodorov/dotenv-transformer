const yaml = require('js-yaml');
const fs = require('fs');
const { generateSecretProvider } = require('./generate-secret-provider');

const updateSecretProviderYaml = (
  secrets,
  keyVault,
  serviceName,
  secretProviderYAMLFile
) => {
  const docs = yaml.loadAll(fs.readFileSync(secretProviderYAMLFile, 'utf8'));

  const newDoc = generateSecretProvider(secrets, keyVault, serviceName);
  let doc = docs.find(
    (doc) =>
      doc.kind === 'SecretProviderClass' &&
      doc.metadata?.name?.toLowerCase() === serviceName?.toLowerCase()
  );

  if (!doc) {
    docs.push(newDoc);
  } else {
    doc.spec = newDoc.spec;
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { updateSecretProviderYaml };
