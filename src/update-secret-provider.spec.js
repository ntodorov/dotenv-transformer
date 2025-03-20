const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const { updateSecretProviderYaml } = require('./update-secret-provider');

describe('updateSecretProviderYaml', () => {
  it('should update existing secret provider in YAML file', () => {
    const secrets = ['test-secret', 'new-secret'];
    const keyVault = 'TestKV';
    const serviceName = 'test-service';

    const secretProviderYamlFile = path.join(
      __dirname,
      '..',
      'test',
      'secret-provider.yaml'
    );
    expect(fs.existsSync(secretProviderYamlFile)).toBe(true);

    const result = updateSecretProviderYaml(
      secrets,
      keyVault,
      serviceName,
      secretProviderYamlFile
    );

    // Parse the result YAML to verify the content
    const resultDocs = yaml.loadAll(result);
    const secretProvider = resultDocs.find(
      (doc) => doc.metadata.name === 'test-service-secrets'
    );

    expect(secretProvider).toBeDefined();
    expect(secretProvider.kind).toBe('SecretProviderClass');
    expect(secretProvider.spec.provider).toBe('azure');

    // Verify that the secrets list has been updated
    expect(secretProvider.spec.secretObjects).toHaveLength(2);
    expect(secretProvider.spec.secretObjects[0].secretName).toBe('test-secret');
    expect(secretProvider.spec.secretObjects[1].secretName).toBe('new-secret');

    // Verify the parameters section
    expect(secretProvider.spec.parameters.keyvaultName).toBe('TestKV');
    expect(secretProvider.spec.parameters.objects).toContain(
      'objectName: test-secret'
    );
    expect(secretProvider.spec.parameters.objects).toContain(
      'objectName: new-secret'
    );
  });

  it('should add new secret provider if it does not exist', () => {
    const secrets = ['new-service-secret'];
    const keyVault = 'NewKV';
    const serviceName = 'new-service';

    const secretProviderYamlFile = path.join(
      __dirname,
      '..',
      'test',
      'secret-provider.yaml'
    );
    expect(fs.existsSync(secretProviderYamlFile)).toBe(true);

    const result = updateSecretProviderYaml(
      secrets,
      keyVault,
      serviceName,
      secretProviderYamlFile
    );

    // Parse the result YAML to verify the content
    const resultDocs = yaml.loadAll(result);

    // Should still have the original document
    const originalProvider = resultDocs.find(
      (doc) => doc.metadata.name === 'test-service-secrets'
    );
    expect(originalProvider).toBeDefined();

    // Should have the new document
    const newProvider = resultDocs.find(
      (doc) => doc.metadata.name === 'new-service-secrets'
    );
    expect(newProvider).toBeDefined();
    expect(newProvider.kind).toBe('SecretProviderClass');
    expect(newProvider.spec.provider).toBe('azure');

    // Verify that the new secret provider has the correct content
    expect(newProvider.spec.secretObjects).toHaveLength(1);
    expect(newProvider.spec.secretObjects[0].secretName).toBe(
      'new-service-secret'
    );

    // Verify the parameters section
    expect(newProvider.spec.parameters.keyvaultName).toBe('NewKV');
    expect(newProvider.spec.parameters.objects).toContain(
      'objectName: new-service-secret'
    );
  });
});
