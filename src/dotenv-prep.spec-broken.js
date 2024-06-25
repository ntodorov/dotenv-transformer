const fs = require('fs');
const path = require('path');
const { dotenvPrep } = require('./dotenv-prep');

jest.mock('fs');

describe('dotenvPrep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load common dotenv file if it exists', () => {
    const dotenvFolder = '/path/to/dotenv';
    const currentEnv = 'development';

    const commonDotenvFile = path.join(dotenvFolder, '.env.deploy');
    const dotenvCommon = {
      parsed: {
        COMMON_VAR: 'common value',
      },
    };

    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    fs.existsSync.mockReturnValueOnce(false);

    fs.readFileSync.mockReturnValueOnce('COMMON_VAR=common value');

    const dotenvConfigSpy = jest.spyOn(dotenv, 'config');
    dotenvConfigSpy.mockReturnValueOnce(dotenvCommon);

    const result = dotenvPrep(dotenvFolder, currentEnv);

    expect(fs.existsSync).toHaveBeenCalledTimes(2);
    expect(fs.existsSync).toHaveBeenCalledWith(commonDotenvFile);
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join(dotenvFolder, `.env.${currentEnv}`)
    );

    expect(dotenvConfigSpy).toHaveBeenCalledTimes(1);
    expect(dotenvConfigSpy).toHaveBeenCalledWith({ path: commonDotenvFile });

    expect(result).toEqual(dotenvCommon.parsed);
  });

  it('should load environment specific dotenv file if it exists', () => {
    const dotenvFolder = '/path/to/dotenv';
    const currentEnv = 'development';

    const commonDotenvFile = path.join(dotenvFolder, '.env.deploy');
    const dotEnvFile = path.join(dotenvFolder, `.env.${currentEnv}`);
    const dotenvCommon = {
      parsed: {
        COMMON_VAR: 'common value',
      },
    };
    const dotenvOverrides = {
      parsed: {
        ENV_VAR: 'env value',
      },
    };

    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);

    fs.readFileSync.mockReturnValueOnce('COMMON_VAR=common value');
    fs.readFileSync.mockReturnValueOnce('ENV_VAR=env value');

    const dotenvConfigSpy = jest.spyOn(dotenv, 'config');
    dotenvConfigSpy.mockReturnValueOnce(dotenvCommon);
    dotenvConfigSpy.mockReturnValueOnce(dotenvOverrides);

    const result = dotenvPrep(dotenvFolder, currentEnv);

    expect(fs.existsSync).toHaveBeenCalledTimes(4);
    expect(fs.existsSync).toHaveBeenCalledWith(commonDotenvFile);
    expect(fs.existsSync).toHaveBeenCalledWith(dotEnvFile);

    expect(dotenvConfigSpy).toHaveBeenCalledTimes(2);
    expect(dotenvConfigSpy).toHaveBeenCalledWith({ path: commonDotenvFile });
    expect(dotenvConfigSpy).toHaveBeenCalledWith({ path: dotEnvFile });

    expect(result).toEqual({
      ...dotenvCommon.parsed,
      ...dotenvOverrides.parsed,
    });
  });

  it('should exit the process if dotenv folder does not exist', () => {
    const dotenvFolder = '/path/to/nonexistent/dotenv';
    const currentEnv = 'development';

    fs.existsSync.mockReturnValueOnce(false);

    const consoleErrorSpy = jest.spyOn(console, 'error');
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});

    dotenvPrep(dotenvFolder, currentEnv);

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.existsSync).toHaveBeenCalledWith(dotenvFolder);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Dotenv folder "${dotenvFolder}" does not exist!`
    );

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit the process if dotenv files are not found', () => {
    const dotenvFolder = '/path/to/dotenv';
    const currentEnv = 'development';

    const commonDotenvFile = path.join(dotenvFolder, '.env.deploy');
    const dotEnvFile = path.join(dotenvFolder, `.env.${currentEnv}`);

    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    fs.existsSync.mockReturnValueOnce(false);

    const consoleErrorSpy = jest.spyOn(console, 'error');
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});

    dotenvPrep(dotenvFolder, currentEnv);

    expect(fs.existsSync).toHaveBeenCalledTimes(3);
    expect(fs.existsSync).toHaveBeenCalledWith(commonDotenvFile);
    expect(fs.existsSync).toHaveBeenCalledWith(dotEnvFile);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `${commonDotenvFile} file not found!`
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Dotenv file(s) not found! At least one of these files ".env.${currentEnv}" or ".env.deploy" must exists in "${dotenvFolder}" folder!`
    );

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit the process if no environment variables are found', () => {
    const dotenvFolder = '/path/to/dotenv';
    const currentEnv = 'development';

    const commonDotenvFile = path.join(dotenvFolder, '.env.deploy');
    const dotEnvFile = path.join(dotenvFolder, `.env.${currentEnv}`);

    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);

    const consoleErrorSpy = jest.spyOn(console, 'error');
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});

    dotenvPrep(dotenvFolder, currentEnv);

    expect(fs.existsSync).toHaveBeenCalledTimes(4);
    expect(fs.existsSync).toHaveBeenCalledWith(commonDotenvFile);
    expect(fs.existsSync).toHaveBeenCalledWith(dotEnvFile);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `No environment variables found! Exiting...`
    );

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
