# Continuous Integration

All code changes will be verified and build using [Jenkins](http://jenkins.dev.maaii.com/).

## Development Deployments

Merged changes are being deployed on development servers once build success on Jenkins.

| |Demo|Snapshot|
| --- | --- | --- |
|Hostname|http://deply.dev.maaii.com:4008|http://deploy.dev.maaii.com:4002|

## Smoke Test

Because of the network settings for security concerns, the development servers CANNOT access the production
API endpoints. In case you have to test with production data, you will have to run the docker image of
`white-label-portal-snapshot` on your own machine. The steps are listed as follows:

### Prerequisites

- docker-machine
- docker

#### Create a docker machine

To create a docker machine, you will need the following command:

```
docker-machine create --driver virtualbox --engine-insecure-registry docker.dev.maaii.com YOUR_MACHINE_NAME
```

Using `--engine-insecure-registry` is a work around as a proper certificate for our registry `docker.dev.maaii.com`
is not provided. In case the registry has been changed, you can change it at
`~/.docker/machine/machines/YOUR_MACHINE_NAME/config.json`, and then regenerate the certificate with the following command:

```
docker-machine regenerate-certs YOUR_MACHINE_NAME
```

#### Run a docker machine

To run a docker machine, you will need to start the machine up first:

```
docker-machine start YOUR_MACHINE_NAME
```

and then, apply it in your terminal session:

```
eval $(docker-machine env YOUR_MACHINE_NAME)
```

Be aware that docker machine is to be applied per terminal session.

#### Pull a docker image

Once your docker machine is up in your terminal session, you can do the following command to pull the docker image:

```
docker pull docker.dev.maaii.com/m800/m800-white-label-portal-snapshot:latest
```

#### Run the docker image

After the docker image is pulled, you will need the `IMAGE ID` to run the image:

```
docker images
```

and you will see a list of docker images and the corresponding `IMAGE ID`.

If this is the first time for running a docker image, you will also need to prepare the environment file. The list
of the environment variables can be found [here](http://deploy.dev.maaii.com:9000/#/containers/). Look for `wlp-snapshot`
and go into it, and you will see the list in the `Environments` row. Copy all those variables into a file and the preparation
is done.

Then, you will be ready to run:

```
docker run --env-file=PATH_TO_YOUR_ENV_FILE --restart=always --name=YOUR_CONTAINER_NAME -p 3000:3000 -p 3100:3100 IMAGE_ID
```

#### Start testing

Each docker machine has its own IP upon restart, you can get the corresponding IP address with the following command:

```
docker-machine ip YOUR_MACHINE_NAME
```

You can then visit `DOCKER_MACHINE_IP:3000` and start testing.
