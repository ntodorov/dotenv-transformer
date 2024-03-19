const path = require('path');
const fs = require('fs');
const { dotenvPrep } = require('../dotenv-prep');

function gen() {
  const options = this.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;

  console.log(`Extracting for environment: ${currentEnv}`);

  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);

  const finalEnv = dotenvPrep(dotenvFolder, currentEnv);

  let envContent = '';
  for (let key in finalEnv) {
    let value = finalEnv[key];
    envContent += `${key}=${value}\n`;
  }

  console.log('envContent', envContent);

  const dotEnvBuild = path.join(process.cwd(), `.env.build`);
  fs.writeFileSync(dotEnvBuild, envContent);
  console.log(`File "${dotEnvBuild}" created!`);

  return envContent;
}

module.exports = gen;
