#! /bin/bash

# Combined test script for all dotenv-transformer test cases
# This script runs all test cases from the examples directory

# Go to root dir
cd "$(dirname "$0")"

# Function to run a test case
run_test_case() {
    local case_name=$1
    local case_dir=$2
    local additional_args=$3
    
    echo "Running test case: $case_name"
    
    # Run the script to update the files
    npx dotenv-transformer gen -e dev -df "$case_dir" -s data-publisher -d "$case_dir/expected" -kv Test1KV -skv $additional_args
    
    # For case1, we also need to compare generated files
    if [ "$case_name" = "case1-single-service" ]; then
        # Run the script to generate the files
        npx dotenv-transformer gen -e dev -df "$case_dir" -s data-publisher -d "$case_dir/generated" -kv Test1KV -skv
        
        # Compare the files content
        if diff -r "$case_dir/generated" "$case_dir/expected" -x ".keepme"; then
            echo "Files are identical for $case_name"
        else
            echo "Files are different for $case_name"
            exit 1
        fi
    fi
    
    echo "Test case $case_name completed successfully"
    echo "----------------------------------------"
}

# Run all test cases
run_test_case "case1-single-service" "./examples/case1-single-service"
run_test_case "case2-internal-service" "./examples/case2-internal-service"
run_test_case "case3-support-service" "./examples/case3-support-service"
run_test_case "case4-internal-and-support" "./examples/case4-internal-and-support"
run_test_case "case5-only-support-service" "./examples/case5-only-support-service" "-usp"
run_test_case "case6-SP-internal-and-support" "./examples/case6-SP-internal-and-support" "-usp"

echo "All test cases completed successfully!" 