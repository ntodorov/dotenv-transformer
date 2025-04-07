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
    // Preserve tenantId and/or clientID if they exist in the current doc
    if (doc.spec?.parameters) {
      newDoc.spec.parameters = newDoc.spec.parameters || {};
      if (doc.spec.parameters.tenantId) {
        newDoc.spec.parameters.tenantId = doc.spec.parameters.tenantId;
      }
      if (doc.spec.parameters.clientID) {
        newDoc.spec.parameters.clientID = doc.spec.parameters.clientID;
      }
    }
    doc.spec = newDoc.spec;
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { updateSecretProviderYaml };
