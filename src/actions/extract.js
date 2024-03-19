const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

async function gen() {
  const options = this.opts();

  //this is important for interpolating the env vars in the .env.deploy file
  process.env.env = options.env;
  const currentEnv = process.env.env;

  console.log(`Extracting for environment: ${currentEnv}`);

  const dotenvFolder = options.dotenvFolder;
  console.log('dotenvFolder', dotenvFolder);

  let dotenvCommon = {};
  console.log('Checking if common ".env.deploy" file exists...');
  const commonDotenvFile = path.join(dotenvFolder, '.env.deploy');
  if (!fs.existsSync(commonDotenvFile)) {
    console.log(`${commonDotenvFile} file not found!`);
  } else {
    dotenvCommon = dotenv.config({ path: commonDotenvFile });
    console.log(
      `Common "${commonDotenvFile}" file loaded:`,
      dotenvCommon.parsed
    );
    dotenvExpand.expand(dotenvCommon);
    console.log(
      `parsed & interpolated "${commonDotenvFile}":`,
      dotenvCommon.parsed
    );
  }

  const dotEnvFile = path.join(dotenvFolder, `.env.${currentEnv}`);
  if (!fs.existsSync(dotEnvFile) && !fs.existsSync(commonDotenvFile)) {
    console.warn(
      `Dotenv file(s) not found! At least one of these files ".env.${currentEnv}" or ".env.deploy" must exists in "${dotenvFolder}" folder!`
    );
    console.warn('Exiting...');
    return;
  }

  let dotenvOverrides = {};
  const processEnv = {};
  if (fs.existsSync(dotEnvFile)) {
    console.log('found env specific:', dotEnvFile);
    dotenvOverrides = dotenv.config({ path: dotEnvFile });
    console.log('parsed:', dotenvOverrides.parsed);

    dotenvExpand.expand({ processEnv, parsed: dotenvOverrides.parsed });
    console.log(`interpolated env.vars from "${dotEnvFile}":`, processEnv);
  }

  const finalEnv = { ...dotenvCommon.parsed, ...processEnv };

  if (Object.keys(finalEnv).length === 0) {
    throw new Error(`No environment variables found! Exiting...`);
  }

  console.log(`FINAL env.vars:`, finalEnv);
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
