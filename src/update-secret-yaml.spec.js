const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const { updateSecretYaml } = require('./update-secret-yaml');

// jest.mock('fs');

describe('updateSecretsYaml', () => {
  it('should update a YAML string for given secrets', () => {
    const secrets = ['jd-password', 'secret2'];
    const keyVault = 'MyKV';

    const expectedYaml = `
apiVersion: spv.no/v2beta1
kind: AzureKeyVaultSecret
metadata:
  name: jd-password
spec:
  vault:
    name: MyKV
    object:
      name: jd-password
      type: secret
  output:
    secret:
      name: jd-password
      dataKey: jd-password
---
apiVersion: spv.no/v2beta1
kind: AzureKeyVaultSecret
metadata:
  name: test1
spec:
  vault:
    name: MyKV
    object:
      name: test1
      type: secret
  output:
    secret:
      name: test1
      dataKey: test1
---
apiVersion: spv.no/v2beta1
kind: AzureKeyVaultSecret
metadata:
  name: secret2
spec:
  vault:
    name: MyKV
    object:
      name: secret2
      type: secret
  output:
    secret:
      name: secret2
      dataKey: secret2
`;

    const secretYamlFile = path.join(__dirname, '..', 'test', 'secret.yaml');
    expect(fs.existsSync(secretYamlFile)).toBe(true);
    const result = updateSecretYaml(secrets, keyVault, secretYamlFile);
    expect(result.trim()).toEqual(expectedYaml.trim());
  });
});
