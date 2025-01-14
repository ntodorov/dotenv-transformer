#! /bin/bash

# case 2: service with additional internal instance
# go to root dir
cd ..
cd ..


# run the script to update the files
npx dotenv-transformer gen -e dev -df ./examples/case2-internal-service  -s data-publisher  -d ./examples/case2-internal-service/expected -kv Test1KV -skv


