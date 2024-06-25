const yaml = require('js-yaml');
const fs = require('fs');
const { generateSecret } = require('./generate-secret');

const updateSecretYaml = (secrets, keyVault, secretYAMLFile) => {
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
