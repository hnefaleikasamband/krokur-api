#!/bin/bash
echo "--- Deploy script is loading ---"
printf "Checking if TRAVIS_TAG is present: %s \n" "$TRAVIS_TAG"
if [[ -z "$TRAVIS_TAG" ]]; 
then
  # Variables is empty or not present
  URI=$STAGING_URI
  PORT="22022"
else
  URI=$PRODUCTION_URI
  PORT="22"
fi

PROJECT_FOLDER="krokur-api"
IMAGE_ARCHIVE_NAME="krokur-api.tar"

# Move the archived image to server
printf "Moving %s to \n" "$IMAGE_ARCHIVE_NAME"
rsync -rv --delete-after --progress -e "ssh -p 22022" $TRAVIS_BUILD_DIR/$IMAGE_ARCHIVE_NAME travis@$URI:~/$PROJECT_FOLDER/$IMAGE_ARCHIVE_NAME
printf "Copy docker-compose.yml over to server\n"
rsync -rv --delete-after --progress -e "ssh -p 22022" $TRAVIS_BUILD_DIR/docker-compose.yml travis@$URI:~/$PROJECT_FOLDER/docker-compose.yml

# SSH in to server & run the launch-script
printf "SSH into server & run launch-script.sh"
ssh travis@$URI -p $PORT 'bash -s' < scripts/launch-script.sh

echo "--- Deploy script has finished loading ---"