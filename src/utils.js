const fs = require('fs');
const path = require('path');

function validatePaths(dotenvFolder, destinationPath) {
  const errors = [];
  if (!fs.existsSync(dotenvFolder))
    errors.push(`Dotenv folder "${dotenvFolder}" does not exist!`);

  if (!fs.existsSync(destinationPath))
    errors.push(`Destination folder "${destinationPath}" does not exist!`);

  if (errors.length > 0) throw new Error(errors.join('\n'));
}

const copyFiles = (sourcePath, destinationPath, fileNames) => {
  fileNames.forEach((fileName) => {
    const sourceFilePath = path.join(sourcePath, fileName);
    const destinationFilePath = path.join(destinationPath, fileName);
    fs.copyFileSync(sourceFilePath, destinationFilePath);
    console.log(`File ${fileName} copied to ${destinationPath}`);
  });
};

module.exports = {
  validatePaths,
  copyFiles,
};
