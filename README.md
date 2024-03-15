# dotenv-transformer

[![Build Status](https://travis-ci.org/andrewmclagan/dotenv-transformer.svg?branch=master)](https://travis-ci.org/andrewmclagan/dotenv-transformer)
[![npm version](https://badge.fury.io/js/dotenv-transformer.svg)](https://badge.fury.io/js/dotenv-transformer)
[![Coverage Status](https://coveralls.io/repos/github/andrewmclagan/dotenv-transformer/badge.svg?branch=master)](https://coveralls.io/github/andrewmclagan/dotenv-transformer?branch=master)

## Description

The `dotenv-transformer` is a command-line utility that reads environment variables from `.env.deploy` and creates `secrets.yaml` and `custom-env.yaml` files.
If you provide a KeyVault name, it will check if the secrets exist in it.

## Installation

No installation needed - using npx :

```bash
npx dotenv-transformer -e <environment name> -df <path to the .env.?? files> -s <service name> -d <destination path> [-kv <Key Vault>]
```

or you can install it globaly using npm:

```bash
npm install dotenv-transformer -g
```

## Usage

if not installed:

```bash
npx dotenv-transformer -e <environment name> -df <path to the .env.?? files> -s <service name> -d <destination path> [-kv <Key Vault>]
```

else:

```bash
dotenv-transformer -e <environment name> -df <path to the .env.?? files> -s <service name> -d <destination path> [-kv <Key Vault>]
```

### Options

- `-e, --env <environment name>`: The name of the environment we are deploying to (required)
- `-df, --dotenvFolder <path to the .env.?? files>`: Path to the folder containing .env.deploy file and/or .env. specific files (required)
- `-s, --service <service name>`: The name of the service (required)
- `-d, --destinationPath <destination path>`: Full folder name to save the yaml files (required)
- `-kv, --keyvault <Key Vault>`: (Optional) Name of Key Vault to check if the secrets exist in it
