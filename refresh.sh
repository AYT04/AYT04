ssh-keygen -t ed25519 -C "markcarney@pm.gc.ca"

echo "WARNING!\n This should only be done yearly."

# -b= creates new branch
# -D= deletes "main"
# -m= renames "new" to "main"

git checkout -b new-main
git branch -D main
git branch -m main

echo "Done. You are now on the new main branch."
