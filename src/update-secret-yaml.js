const yaml = require('js-yaml');
const fs = require('fs');
const { generateSecret } = require('./generate-secret');
const { updateSecretProviderYaml } = require('./update-secret-provider');

const updateSecretYaml = (
  secrets,
  keyVault,
  secretYAMLFile,
  useSecretProvider = false,
  serviceName = null
) => {
  if (useSecretProvider) {
    if (!serviceName) {
      throw new Error('serviceName is required when useSecretProvider is true');
    }
    return updateSecretProviderYaml(
      secrets,
      keyVault,
      serviceName,
      secretYAMLFile
    );
  }

  const docs = yaml.loadAll(fs.readFileSync(secretYAMLFile, 'utf8'));

  for (const secret of secrets) {
    const newDoc = generateSecret(secret, keyVault);
    let doc = docs.find((doc) => doc.metadata.name === secret);
    if (!doc) {
      docs.push(newDoc);
    } else {
      doc.spec = newDoc.spec;
    }
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { updateSecretYaml };
