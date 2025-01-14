const yaml = require('js-yaml');
const fs = require('fs');

const upsertCustomEnvYaml = (customEnvYAMLFile, envVars, serviceName) => {
  const docs = yaml.loadAll(fs.readFileSync(customEnvYAMLFile, 'utf8'));

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

  //for each value in envVars create new entry in env array of COMMON_YAML container
  for (const key in envVars) {
    let value = envVars[key];

    const existingEnvVar = container.env.find((env) => env.name === key);
    if (existingEnvVar) {
      existingEnvVar.value = value;
      continue;
    } else {
      container.env.push({
        name: key,
        value: value,
      });
    }
  }

  const updatedYaml = docs.map((doc) => yaml.dump(doc)).join('---\n');

  return updatedYaml;
};

module.exports = { upsertCustomEnvYaml };
