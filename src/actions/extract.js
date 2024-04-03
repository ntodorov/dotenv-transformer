const path = require('path');
const fs = require('fs');
const { dotenvPrep } = require('../dotenv-prep');

function extract() {
  const options = this.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;

  console.log(`Extracting for environment: ${currentEnv}`);

  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);
  const outputFile = options.outputFile;
  console.log('outputFile', outputFile);

  const finalEnv = dotenvPrep(dotenvFolder, currentEnv);

  let envContent = '';
  for (let key in finalEnv) {
    let value = finalEnv[key];
    envContent += `${key}=${value}\n`;
  }

  console.log('envContent', envContent);

  fs.writeFileSync(outputFile, envContent);
  console.log(`File "${outputFile}" created!`);

  return envContent;
}

module.exports = extract;
