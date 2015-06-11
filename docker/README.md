# Prerequsites

- docker
- boot2docker

## boot2docker

OSX only:

```
# create the VM
# only for the first time
boot2docker init

# start the VM
boot2docker up

# export env vars for the DOCKER client
$(boot2docker shellinit)
```

# Workflow

```
cd <PROJECT_ROOT>

# build the image based on the Dockerfile
docker build --rm [--no-cahe] -t <TAG NAME> .
# e.g.,
docker build --rm -t wlp .

# run the container based on the image
docker run --env-file=<ENV FILE> -p <HOST PORT>:<CONTAINER PORT> -d --rm --name <CONTAINER NAME> -t <TAG NAME>
# e.g.,
docker run --env-file=docker/envfile.sample -p 3000:3000 -d --rm --name wlp -t wlp

# stop the container named "wlp"
docker stop <CONTAINER NAME or ID>
# e.g.,
docker stop wlp

# remove the container
#
# issue the `run` command above to start the container again
# only needed if invoking `run` without `--rm`
docker ps -q -f name=wlp | xargs docker rm
```

