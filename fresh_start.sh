#!/bin/bash

# A script to completely reset a Git repository's commit history.
# This method creates a new "orphan" branch with no history,
# copies all current files to it, and then replaces the main branch.
#
# !! WARNING: THIS ACTION IS IRREVERSIBLE. It will permanently delete
# the entire commit history from your repository. Proceed with caution.
# It is highly recommended to back up your code before running this script.

# Set the name for your new, clean branch.
NEW_BRANCH_NAME="new-main-branch"

# Check for uncommitted changes to prevent data loss.
if ! git diff-index --quiet HEAD --; then
    echo "Warning: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

echo "Creating a new orphan branch '$NEW_BRANCH_NAME'..."
# Create a new branch with no parent commits.
git checkout --orphan "$NEW_BRANCH_NAME"

echo "Adding all files to the new branch..."
# Add all files from your current working directory.
git add -A

echo "Committing the first and only commit..."
# Commit all the files with a fresh, new history.
git commit -m "Initial clean commit"

echo "Replacing the old main branch with the new branch..."
# Overwrite the 'main' branch with your new, clean branch.
git branch -D main
git branch -m "$NEW_BRANCH_NAME" main

echo "Pushing the changes and forcing the update on the remote repository..."
# Force push to the remote. This will permanently remove the old history.
git push -f origin main

echo ""
echo "Repository history has been cleared successfully."
echo "You are now on the 'main' branch with a single commit."