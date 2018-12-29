#!/bin/bash
echo "--- Deploy script is loading ---"
if [[ $ENV = "staging" ]]; 
then
  URI=$STAGING_URI
  PORT=22022
else
  URI=$PRODUCTION_URI
  PORT=22
fi

PROJECT_FOLDER=krokur-api
IMAGE_ARCHIVE_NAME=krokur-api.tar

# Move the archived image to server
rsync -rv --delete-after --progress -e "ssh -p 22022" $TRAVIS_BUILD_DIR/krokur-api.tar travis@$URI:~/$PROJECT_FOLDER/$IMAGE_ARCHIVE_NAME
pwd
ls -al
rsync -rv --delete-after --progress -e "ssh -p 22022" $TRAVIS_BUILD_DIR/docker-compose.yml travis@$URI:~/$PROJECT_FOLDER/docker-compose.yml
# SSH in to server & load the archived image into docker.
ssh travis@$URI -p $PORT
pushd $PROJECT_FOLDER
docker load -i $IMAGE_ARCHIVE_NAME

# -p is for "no error if existing, make parent directories as needed"
# then run docker-compose up with --build to use the new image previously loaded.
mkdir -p ./db; docker-compose up -d --build --rm=true

# Remove the archived image
rm $IMAGE_ARCHIVE_NAME

# Check if we have a dangling <none> images and remove them if so
if [ "$(docker images -f "dangling=true" -q | awk '{print $3}' | sort -u)x" != "x" ]
then
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi

echo "Exiting SSH session"
exit
echo "--- Deploy script has finished loading ---"