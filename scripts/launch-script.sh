echo "--- Launch script has started ---"

PROJECT_FOLDER="krokur-api"
IMAGE_ARCHIVE_NAME="krokur-api.tar"

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

echo "--- Launch script has finished ---"