const fs = require('fs');
const yaml = require('js-yaml');
const { generateSecretsYaml } = require('./generate-secret-yaml');

jest.mock('fs');

describe('generateSecretsYaml', () => {
  it('should generate a YAML string for given secrets', () => {
    const secrets = ['secret1', 'secret2'];
    const keyVault = 'myKeyVault';

    const expectedYaml = `
apiVersion: spv.no/v2beta1
kind: AzureKeyVaultSecret
metadata:
  name: secret1
spec:
  vault:
    name: myKeyVault
    object:
      name: secret1
      type: secret
  output:
    secret:
      name: secret1
      dataKey: secret1
---
apiVersion: spv.no/v2beta1
kind: AzureKeyVaultSecret
metadata:
  name: secret2
spec:
  vault:
    name: myKeyVault
    object:
      name: secret2
      type: secret
  output:
    secret:
      name: secret2
      dataKey: secret2
`;

    const result = generateSecretsYaml(secrets, keyVault);
    expect(result.trim()).toEqual(expectedYaml.trim());
  });
});
