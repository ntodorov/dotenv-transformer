const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const generateCustomEnvYaml = (envVars, serviceName) => {
  const COMMON_YAML = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: serviceName,
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: serviceName,
              env: [],
            },
          ],
        },
      },
    },
  };

  //for each value in envVars create new entry in env array of COMMON_YAML container
  for (const key in envVars) {
    let value = envVars[key];
    if (value.startsWith('secret:')) {
      value = value.split(':')[1];
      COMMON_YAML.spec.template.spec.containers[0].env.push({
        name: key,
        valueFrom: {
          secretKeyRef: {
            name: value,
            key: value,
          },
        },
      });
    } else {
      COMMON_YAML.spec.template.spec.containers[0].env.push({
        name: key,
        value: envVars[key],
      });
    }
  }

  const customEnvYAML = yaml.dump(COMMON_YAML);

  return customEnvYAML;
};

module.exports = { generateCustomEnvYaml };
