const yaml = require('js-yaml');

const updateCustomEnvYaml = (customEnvYAMLFile, envVars, serviceName) => {
  const docs = yaml.loadAll(customEnvYAMLFile);

  const doc = docs.find((doc) => doc.metadata.name === serviceName);
  if (!doc) {
    console.error(
      `Service ${serviceName} not found in the YAML file! ${customEnvYAMLFile} `
    );
    process.exit(1);
  }
  const container = doc.spec.template.spec.containers.find(
    (c) => c.name === serviceName
  );
  if (!container) {
    console.error(
      `Container ${serviceName} not found in the YAML file! ${customEnvYAMLFile} `
    );
    process.exit(1);
  }

  container.env = [];
  //for each value in envVars create new entry in env array of COMMON_YAML container
  for (const key in envVars) {
    let value = envVars[key];
    if (value.startsWith('secret:')) {
      value = value.split(':')[1];
      container.env.push({
        name: key,
        valueFrom: {
          secretKeyRef: {
            name: value,
            key: value,
          },
        },
      });
    } else {
      container.env.push({
        name: key,
        value: envVars[key],
      });
    }
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { updateCustomEnvYaml };
