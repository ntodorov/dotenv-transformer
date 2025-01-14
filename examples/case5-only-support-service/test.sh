#! /bin/bash

# case 5: service with additional support instance
# go to root dir
cd ..
cd ..


# run the script to update the files
npx dotenv-transformer update -e dev -df ./examples/case5-only-support-service  -s data-publisher  -d ./examples/case5-only-support-service/expected


