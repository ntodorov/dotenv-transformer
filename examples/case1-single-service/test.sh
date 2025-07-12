#! /bin/bash

# case 1: single service, no support or internal instances
# go to root dir
cd ..
cd ..

# run the script to generate the files
npx dotenv-transformer gen -e dev -df ./examples/case1-single-service  -s data-publisher  -d ./examples/case1-single-service/generated -kv Test1KV -skv
# run the script to update the files
npx dotenv-transformer gen -e dev -df ./examples/case1-single-service  -s data-publisher  -d ./examples/case1-single-service/expected -kv Test1KV -skv

# compare the files content

# Compare the content of the files
if diff -r ./examples/case1-single-service/generated ./examples/case1-single-service/expected -x ".keepme"; then
    echo "Files are identical"
    echo "Removing generated files"
    find ./examples/case1-single-service/generated -type f ! -name ".keepme" -delete
    exit 0
else
    echo "Files are different"
    exit 1
fi

