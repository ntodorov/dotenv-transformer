#! /bin/bash

# Combined test script for all dotenv-transformer test cases
# This script runs all test cases from the examples directory
#
# IMPORTANT: This script requires a clean git working tree before running.
# After tests complete, we verify that git status is still clean to ensure
# that no files were modified or left behind as artifacts from the test runs.
# This guarantees that our tests are properly isolated and clean up after themselves.

# Go to root dir
cd "$(dirname "$0")"

# Function to check if git working tree is clean
check_git_status() {
    echo "Checking git status..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "ERROR: Not in a git repository"
        exit 1
    fi
    
    # Check if working tree is clean
    if ! git diff-index --quiet HEAD --; then
        echo "ERROR: Git working tree is not clean. Please commit or stash your changes before running tests."
        echo "This is required because tests verify their correctness by ensuring git status remains clean after completion."
        echo ""
        echo "Current git status:"
        git status --porcelain
        exit 1
    fi
    
    # Check for untracked files
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo "ERROR: There are untracked files in the repository. Please commit or remove them before running tests."
        echo "This is required because tests verify their correctness by ensuring git status remains clean after completion."
        echo ""
        echo "Untracked files:"
        git ls-files --others --exclude-standard
        exit 1
    fi
    
    echo "Git working tree is clean. Proceeding with tests..."
    echo "----------------------------------------"
}

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
            echo "Removing generated files"
            find "$case_dir/generated" -type f ! -name ".keepme" -delete
        else
            echo "Files are different for $case_name"
            exit 1
        fi
    fi
    
    echo "Test case $case_name completed successfully"
    echo "----------------------------------------"
}

# Check git status before running tests
check_git_status

# Function to verify git status is still clean after tests
verify_git_status_clean() {
    echo "Verifying git status is still clean after tests..."
    
    # Check if working tree is clean
    if ! git diff-index --quiet HEAD --; then
        echo "ERROR: Git working tree is not clean after tests. Tests may have left artifacts behind."
        echo "Modified files:"
        git status --porcelain
        exit 1
    fi
    
    # Check for untracked files
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo "ERROR: There are untracked files after tests. Tests may have left artifacts behind."
        echo "Untracked files:"
        git ls-files --others --exclude-standard
        exit 1
    fi
    
    echo "Git working tree is still clean. Tests properly cleaned up after themselves."
    echo "----------------------------------------"
}

# Run all test cases
run_test_case "case1-single-service" "./examples/case1-single-service"
run_test_case "case2-internal-service" "./examples/case2-internal-service"
run_test_case "case3-support-service" "./examples/case3-support-service"
run_test_case "case4-internal-and-support" "./examples/case4-internal-and-support"
run_test_case "case5-only-support-service" "./examples/case5-only-support-service" "-usp"
run_test_case "case6-SP-internal-and-support" "./examples/case6-SP-internal-and-support" "-usp"

# Verify git status is still clean
verify_git_status_clean

echo "All test cases completed successfully!" 