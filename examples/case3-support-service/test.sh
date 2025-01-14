#! /bin/bash

# case 3: service with additional support instance
# go to root dir
cd ..
cd ..


# run the script to update the files
npx dotenv-transformer gen -e dev -df ./examples/case3-support-service  -s data-publisher  -d ./examples/case3-support-service/expected -kv Test1KV -skv


