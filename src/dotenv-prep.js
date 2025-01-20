const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

function dotenvPrep(dotenvFolder, currentEnv) {
  if (!fs.existsSync(dotenvFolder)) {
    console.error(`Dotenv folder "${dotenvFolder}" does not exist!`);
    process.exit(1);
  }

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
    console.error(
      `Dotenv file(s) not found! At least one of these files ".env.${currentEnv}" or ".env.deploy" must exists in "${dotenvFolder}" folder!`
    );
    console.error('Exiting...');
    process.exit(1);
  }

  let dotenvOverrides = {};
  const processEnv = { env: process.env.env };
  if (fs.existsSync(dotEnvFile)) {
    console.log('found env specific:', dotEnvFile);
    dotenvOverrides = dotenv.config({ path: dotEnvFile });
    console.log('parsed:', dotenvOverrides.parsed);

    dotenvExpand.expand({ processEnv, parsed: dotenvOverrides.parsed });
    if (!('env' in dotenvOverrides.parsed)) {
      delete processEnv.env;
    }
    console.log(`interpolated env.vars from "${dotEnvFile}":`, processEnv);
  }

  const finalEnv = { ...dotenvCommon.parsed, ...processEnv };

  if (Object.keys(finalEnv).length === 0) {
    console.error(`No environment variables found! Exiting...`);
    process.exit(1);
  }

  console.log(`FINAL env.vars:`, finalEnv);

  const result = { finalEnv, internalFinalEnv: null, supportFinalEnv: null };

  const internalDeployEnvFile = path.join(dotenvFolder, `.env-internal.deploy`);
  let internalFinalEnv = null;
  if (fs.existsSync(internalDeployEnvFile)) {
    console.log('found internal deploy:', internalDeployEnvFile);
    internalFinalEnv = { env: process.env.env };
    const internalDeployEnv = dotenv.config({ path: internalDeployEnvFile });
    console.log('parsed:', internalDeployEnv.parsed);
    dotenvExpand.expand({
      processEnv: internalFinalEnv,
      parsed: internalDeployEnv.parsed,
    });

    if (!('env' in internalDeployEnv.parsed)) {
      delete internalFinalEnv.env;
    }

    console.log(
      `interpolated env.vars from "${internalDeployEnvFile}":`,
      internalFinalEnv
    );
    internalFinalEnv = { ...finalEnv, ...internalFinalEnv };
  }

  if (internalFinalEnv) {
    console.log(`INTERNAL FINAL env.vars:`, internalFinalEnv);
    result.internalFinalEnv = internalFinalEnv;
  }

  const supportDeployEnvFile = path.join(dotenvFolder, `.env-support.deploy`);
  let supportFinalEnv = null;
  if (fs.existsSync(supportDeployEnvFile)) {
    console.log('found support deploy:', supportDeployEnvFile);
    supportFinalEnv = { env: process.env.env };
    const supportDeployEnv = dotenv.config({ path: supportDeployEnvFile });
    console.log('parsed:', supportDeployEnv.parsed);
    dotenvExpand.expand({
      processEnv: supportFinalEnv,
      parsed: supportDeployEnv.parsed,
    });
    if (!('env' in supportDeployEnv.parsed)) {
      delete supportFinalEnv.env;
    }
    console.log(
      `interpolated env.vars from "${supportDeployEnvFile}":`,
      supportFinalEnv
    );
    supportFinalEnv = { ...finalEnv, ...supportFinalEnv };
  }

  if (supportFinalEnv) {
    console.log(`SUPPORT FINAL env.vars:`, supportFinalEnv);
    result.supportFinalEnv = supportFinalEnv;
  }

  return result;
}

module.exports = { dotenvPrep };
