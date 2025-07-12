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
      (doc) => doc.metadata.name === 'test-service'
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
      (doc) => doc.metadata.name === 'test-service'
    );
    expect(originalProvider).toBeDefined();

    // Should have the new document
    const newProvider = resultDocs.find(
      (doc) => doc.metadata.name === 'new-service'
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

  it('should preserve existing secrets when updating with partial secret list', () => {
    const secrets = [
      'connstr-corpsql',
      'connstr-appinsights',
      'new-test-secret',
    ];
    const keyVault = 'KV3';
    const serviceName = 'authentication-proxy';

    const secretProviderYamlFile = path.join(
      __dirname,
      '..',
      'test',
      'authentication-proxy.yaml'
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
      (doc) => doc.metadata.name === 'authentication-proxy'
    );

    expect(secretProvider).toBeDefined();
    expect(secretProvider.kind).toBe('SecretProviderClass');
    expect(secretProvider.spec.provider).toBe('azure');

    // Verify that all four secrets are present (3 existing + 1 new)
    expect(secretProvider.spec.secretObjects).toHaveLength(4);

    const secretNames = secretProvider.spec.secretObjects.map(
      (obj) => obj.secretName
    );
    expect(secretNames).toContain('connstr-corpsql');
    expect(secretNames).toContain('connstr-appinsights');
    expect(secretNames).toContain('auth-ingress-htpasswd'); // This should still be there (preserved)
    expect(secretNames).toContain('new-test-secret'); // This should be added

    // Verify the parameters section includes all secrets
    expect(secretProvider.spec.parameters.keyvaultName).toBe('KV3');
    expect(secretProvider.spec.parameters.objects).toContain(
      'objectName: connstr-corpsql'
    );
    expect(secretProvider.spec.parameters.objects).toContain(
      'objectName: connstr-appinsights'
    );
    expect(secretProvider.spec.parameters.objects).toContain(
      'objectName: auth-ingress-htpasswd'
    );
    expect(secretProvider.spec.parameters.objects).toContain(
      'objectName: new-test-secret'
    );

    // Verify that tenantId and clientID are preserved
    expect(secretProvider.spec.parameters.tenantId).toBe('aaa');
    expect(secretProvider.spec.parameters.clientID).toBe('bbb');
  });
});
