#!/bin/bash

#######################################
# Build chaincode docker images
#######################################

if [[ ( $# -eq 1 ) && ( $1 = "-h" || $1 = "--help" ) ]]; then
  echo "Usage: ./dn-build.sh"
  exit 0
fi

. ./scripts/setup.sh

SECONDS=0

./cleanup.sh

printf "Cleaning up old image $CC_IMAGE\n"
docker rmi $CC_IMAGE

### transpile ###
cd $ROOT_DIR
rm -fr ./dist
$LIBS_DIR/.bin/tsc -p ./tsconfig.prod.json

### build image ###
set -x
cd $ROOT_DIR && DOCKER_BUILD=1 docker build --no-cache -t $CC_IMAGE:$RELEASE .
res=$?
docker tag $CC_IMAGE:$RELEASE $CC_IMAGE
set +x
printMessage "Create image ${CC_IMAGE}" $res
sleep 1

duration=$SECONDS
printf "${GREEN}$(($duration / 60)) minutes and $(($duration % 60)) seconds elapsed.\n\n${NC}"
