#!/bin/bash

NEW_BRANCH_NAME="ayt"

if ! git diff-index --quiet HEAD --; then
    echo "uncommitted changes! commit or stash?"
    exit 1
fi

# Make changes, then run this script.

git add .

git commit -m "Prepare for branch reset"

git checkout --orphan "$NEW_BRANCH_NAME"

git add -A

git commit -m "Initial commit"

git branch -D main

git branch -m "$NEW_BRANCH_NAME" main

git push -f origin "main"