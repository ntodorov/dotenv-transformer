const yaml = require('js-yaml');
const { generateCustomEnvYaml } = require('./generate-custom-vars-yaml');

describe('generateCustomEnvYaml', () => {
  it('should generate YAML string with environment variables', () => {
    const envVars = {
      VAR1: 'value1',
      VAR2: 'secret:secretKey',
      VAR3: 'value3',
    };
    const serviceName = 'myService';
    const stagingFolder = '/path/to/staging';

    const expectedYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myService
spec:
  template:
    spec:
      containers:
        - name: myService
          env:
            - name: VAR1
              value: value1
            - name: VAR2
              valueFrom:
                secretKeyRef:
                  name: secretKey
                  key: secretKey
            - name: VAR3
              value: value3
`;

    const result = generateCustomEnvYaml(envVars, serviceName, stagingFolder);
    expect(result.trim()).toEqual(expectedYaml.trim());
  });

  it('should generate YAML string without environment variables', () => {
    const envVars = {};
    const serviceName = 'myService';
    const stagingFolder = '/path/to/staging';

    const expectedYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myService
spec:
  template:
    spec:
      containers:
        - name: myService
          env: []
`;

    const result = generateCustomEnvYaml(envVars, serviceName, stagingFolder);
    expect(result.trim()).toEqual(expectedYaml.trim());
  });
});
