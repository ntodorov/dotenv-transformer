#! /bin/bash

# case 2: service with additional internal instance
# go to root dir
cd ..
cd ..

# run the script to generate the files
npx dotenv-transformer gen -e dev -df ./examples/case2-internal-service  -s data-publisher  -d ./examples/case2-internal-service/generated -kv Test1KV -skv

# compare the files content

# Compare the content of the files
if diff -r ./examples/case2-internal-service/generated ./examples/case2-internal-service/expected -x ".keepme"; then
    echo "Files are identical"
    echo "Removing generated files"
    find ./examples/case2-internal-service/generated -type f ! -name ".keepme" -delete
    exit 0
else
    echo "Files are different"
    exit 1
fi


