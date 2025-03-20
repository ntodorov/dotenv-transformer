#! /bin/bash

# case 4: service with additional internal and support instance
# go to root dir
cd ..
cd ..


# run the script to update the files
npx dotenv-transformer gen -e dev -df ./examples/case6-SP-internal-and-support  -s data-publisher  -d ./examples/case6-SP-internal-and-support/expected -kv Test1KV -skv -usp


