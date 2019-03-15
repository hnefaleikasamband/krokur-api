#!/bin/bash
BRANCH=$1
STAGING="staging"
PRODUCTION="prod"
if [ "$BRANCH" != "$STAGING" ] && [ "$BRANCH" != "$PRODUCTION" ]; then
  echo "you must pass in either \"staging\" or \"prod\""
  exit 1
fi

<<<<<<< HEAD
git config user.email "$EMAIL"
git config user.name "$GH_USER"
git push https://$GH_USER:$TOKEN@$GH_REPO HEAD:$BRANCH
=======
git config user.email "${EMAIL}"
git config user.name "${GH_USER}"
git push https://{$GH_USER}:${TOKEN}@{$GH_REPO} $BRANCH
>>>>>>> babbara
