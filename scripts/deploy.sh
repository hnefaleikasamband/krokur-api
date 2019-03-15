#!/bin/bash
BRANCH=$1
STAGING="staging"
PRODUCTION="prod"
if [ $BRANCH != $STAGING ] && [$BRANCH != $PRODUCTION]; then
  exit 1
fi

git config user.email "${EMAIL}"
git config user.name "${USER}"
git push https://{$TOKEN}{$USER}:${GITHUB_API_KEY}@{$GH_REPO} $BRANCH > /dev/null 2>&1