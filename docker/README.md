# Prerequsites

- docker
- boot2docker (OSX users)

## boot2docker

```
# create the VM
# only for the first time
boot2docker init

# start the VM
boot2docker up

# export env vars for the DOCKER client
$(boot2docker shellinit)

# required for `docker push` since we're using self-signed cert
boot2docker ssh "echo $'EXTRA_ARGS=\"--insecure-registry docker.dev.maaii.com\"' | sudo tee -a /var/lib/boot2docker/profile && sudo /etc/init.d/docker restart"
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
# can copy "envfile.sample" as "envfile" (ignored by git)
# e.g.,
docker run --env-file=docker/envfile -p 3000:3000 -d --rm --name wlp -t wlp

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

# Publish the Docker image

```
# docker tag <IMAGE> <TAG>
docker tag docker.dev.maaii.com/m800/white-label-portal-devel docker.dev.maai.com/m800/white-label-portal-devel:1.0

# docker push <TAG>
docker push docker.dev.maaii.com/m800/white-label-portal-devel:1.0

# to see the pushed image
docker search docker.dev.maaii.com/m800
```