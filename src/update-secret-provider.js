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
    const existingSecrets = doc.spec?.secretObjects || [];
    const existingSecretNames = existingSecrets.map((obj) => obj.secretName);

    // Create a Set to avoid duplicates, then convert back to array
    const mergedSecretNames = [
      ...new Set([...existingSecretNames, ...secrets]),
    ];

    // Build the merged secret objects, preserving existing structures
    const mergedSecretObjects = [];

    for (const secretName of mergedSecretNames) {
      const existingSecret = existingSecrets.find(
        (obj) => obj.secretName === secretName
      );
      if (existingSecret) {
        // Preserve the existing secret object structure
        mergedSecretObjects.push(existingSecret);
      } else {
        // Create a new secret object for new secrets
        mergedSecretObjects.push({
          secretName: secretName,
          type: 'Opaque',
          data: [
            {
              objectName: secretName,
              key: secretName,
            },
          ],
        });
      }
    }

    // Generate the objects string for parameters
    const objectsString = `array:\n${mergedSecretNames
      .map(
        (secret) =>
          `        - |\n          objectName: ${secret}\n          objectType: secret`
      )
      .join('\n')}`;

    // Update the document spec
    doc.spec.secretObjects = mergedSecretObjects;
    doc.spec.parameters = doc.spec.parameters || {};
    doc.spec.parameters.keyvaultName = keyVault;
    doc.spec.parameters.objects = objectsString;

    // Preserve other existing parameters if they exist
    // (tenantId, clientID, usePodIdentity, etc. are already preserved)
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { updateSecretProviderYaml };
