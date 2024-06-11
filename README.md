# dotenv-transformer

[![Build Status](https://travis-ci.org/andrewmclagan/dotenv-transformer.svg?branch=master)](https://travis-ci.org/andrewmclagan/dotenv-transformer)
[![npm version](https://badge.fury.io/js/dotenv-transformer.svg)](https://badge.fury.io/js/dotenv-transformer)
[![Coverage Status](https://coveralls.io/repos/github/andrewmclagan/dotenv-transformer/badge.svg?branch=master)](https://coveralls.io/github/andrewmclagan/dotenv-transformer?branch=master)

## Description

The `dotenv-transformer` is a command-line interface for transforming .env files for different needs, mostly used in devops pipelines.
It has coommands:

- `gen` - will read environment variables from `.env.deploy` and creates `secrets.yaml` and `custom-env.yaml` files. If you provide a KeyVault name, it will check if the secrets exist in it. If `custom-env.yaml` already exists, it will only override the env array for the container with the service name. If you have second deployment of the same service named "<service>-internal", and you have .env-internal.deploy or .env-internal.<env> file, it will update the document for the internal deployment in `custom-env.yaml` file. This files .env-internal.deploy or .env-internal.<env> file should contain only the overrides for the internal deployment.

- `extract` - will read `.env.deploy` and some specific `.env.<env>` filled with overrides and produce final `.env.build` that can be used in the build process - specificaly passing them to docker build task as `--build-arg` parameters.

## Installation

No installation needed - using npx :

```bash
npx dotenv-transformer gen -e <environment name> -df <path to the .env.??? files> -s <service name> -d <destination path> -kv <Key Vault> [-skv]
```

or you can install it globaly using npm:

```bash
npm install dotenv-transformer -g
```

## Usage

if not installed:

```bash
npx dotenv-transformer gen -e <environment name> -df <path to the .env.?? files> -s <service name> -d <destination path> -kv <Key Vault> [--skipKV]
```

else:

```bash
dotenv-transformer gen -e <environment name> -df <path to the .env.?? files> -s <service name> -d <destination path> -kv <Key Vault> [--skipKV]
```

### Commands & Options

#### Command `gen`

##### options

- `-e, --env <environment name>`: The name of the environment we are deploying to (required)
- `-df, --dotenvFolder <path to the .env.?? files>`: Path to the folder containing .env.deploy file and/or .env. specific files (required)
- `-s, --service <service name>`: The name of the service (required)
- `-d, --destinationPath <destination path>`: Full folder name to save the yaml files (required)
- `-kv, --keyvault <Key Vault>`: Key Vault Name needed for secret.yaml and to check if the secrets exist in it
- `-skv, --skipKV`: (optional) If you want to skip checking for secrets existance in the Key Vault

#### Command `extract`

##### options

- `-e, --env <environment name>`: The name of the environment we are deploying to (required)
- `-df, --dotenvFolder <path to the .env.?? files>`: Path to the folder containing .env.deploy file and/or .env. specific files (required)
- `-o, --outputFile <file name with path>`: file name with path to save the interpolated environment variables - defalut: .env.build in current folder
- `-kv, --keyvault <Key Vault>`: (optional) Key Vault Name - if provided the tool will get the secret values from it.
