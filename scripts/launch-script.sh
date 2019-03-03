echo "--- Launch script has started ---"

PROJECT_FOLDER="krokur-api"
IMAGE_ARCHIVE_NAME="krokur-api.tar"

pushd $PROJECT_FOLDER
echo "- Loading image to docker"
docker load -i $IMAGE_ARCHIVE_NAME

# -p is for "no error if existing, make parent directories as needed"
# then run docker-compose up with --build to use the new image previously loaded.
echo "- Image loaded, now running docker-compose"
mkdir -p ./db
#docker-compose up -d --build
docker-compose up --no-deps -d krokur-api-container

# Remove the archived image
printf "\- Removing %s from server\n" "$IMAGE_ARCHIVE_NAME"
rm $IMAGE_ARCHIVE_NAME

# Check if we have a dangling <none> images and remove them if so
docker rmi $(docker images -a|grep "<none>"|awk '$1=="<none>" {print $3}')

echo "--- Launch script has finished ---"
