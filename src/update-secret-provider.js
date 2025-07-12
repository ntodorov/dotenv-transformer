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

  let doc = docs.find(
    (doc) =>
      doc.kind === 'SecretProviderClass' &&
      doc.metadata?.name?.toLowerCase() === serviceName?.toLowerCase()
  );

  if (!doc) {
    // If no existing document, create a new one
    const newDoc = generateSecretProvider(secrets, keyVault, serviceName);
    docs.push(newDoc);
  } else {
    // If document exists, merge existing secrets with new ones
    const existingSecrets =
      doc.spec?.secretObjects?.map((obj) => obj.secretName) || [];

    // Create a Set to avoid duplicates, then convert back to array
    const mergedSecrets = [...new Set([...existingSecrets, ...secrets])];

    // Generate new spec with merged secrets
    const newDoc = generateSecretProvider(mergedSecrets, keyVault, serviceName);

    // Preserve existing parameters (tenantId, clientID, etc.)
    if (doc.spec?.parameters) {
      newDoc.spec.parameters = newDoc.spec.parameters || {};

      // Preserve all existing parameters
      Object.keys(doc.spec.parameters).forEach((key) => {
        if (key !== 'keyvaultName' && key !== 'objects') {
          // Keep existing values for all parameters except keyvaultName and objects
          // which should be updated with new values
          newDoc.spec.parameters[key] = doc.spec.parameters[key];
        }
      });
    }

    // Update the document spec
    doc.spec = newDoc.spec;
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { updateSecretProviderYaml };
