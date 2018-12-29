#!/bin/bash
echo "--- Deploy script is loading ---"
echo "Checking if TRAVIS_TAG is present: "
echo $TRAVIS_TAG
if [[ -z "$TRAVIS_TAG" ]]; 
then
  # Variables is empty or 
  URI=$STAGING_URI
  PORT="22022"
else
  URI=$PRODUCTION_URI
  PORT="22"
fi

echo "Printing out $URI & $PORT"
echo $URI
echo $PORT

PROJECT_FOLDER="krokur-api"
IMAGE_ARCHIVE_NAME="krokur-api.tar"

# Move the archived image to server
rsync -rv --delete-after --progress -e "ssh -p 22022" $TRAVIS_BUILD_DIR/krokur-api.tar travis@$URI:~/$PROJECT_FOLDER/$IMAGE_ARCHIVE_NAME
pwd
ls -al
rsync -rv --delete-after --progress -e "ssh -p 22022" $TRAVIS_BUILD_DIR/docker-compose.yml travis@$URI:~/$PROJECT_FOLDER/docker-compose.yml

# SSH in to server & run the launch-script
ssh travis@$URI -p $PORT 'bash -s' < launch-script.sh

echo "--- Deploy script has finished loading ---"