# Development

## Run the application

### Install dependencies

To run the project you will need install the dependencies using Npm and Bower.

```
# install bower modules
bower -f install

# install node modules
# Please make sure the NODE_ENV variable is set to 'development', or you will miss all the development dependencies
npm i
```

### Set up the environment

You will need [*Redis*](http://redis.io) and [*MongoDB*](https://www.mongodb.org) to be installed and running on your system. If you are on Mac, you may use [*Homebrew*](http://brew.sh) to install both of them, or alternatively, use [*Docker*](https://www.docker.com) you are proficient with it.

There are environment variables that needs to be set before you can run the application. Check `envrc.sample` for reference, or you may also refer to Docker page in Release section in this documentation. To setup environment variables for each project on your local machine, we suggest to use [*direnv*](direnv.net), it is also available via *Homebrew*.

### Run the application in dev mode

Once dependencies installed you start the development with hot reload.

```
npm run dev
```


## Debugging

Environment:

- Nodejs 4.x

Tool:

- [Node-Inspector](https://github.com/node-inspector/node-inspector) (@0.11.1)

Steps:

```
# in case you do not have node-inspector installed
npm install -g node-inspector
# on one tab
node-inspector
# on another tab
gulp --debug
```

go to [http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858](http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858), it will take 20 - 30 seconds
to load the sources

Trouble Shooting:

breakpoints do not take effect:

you will see three folders under file://

- /path/to/project/
- **app**
- node_modules

please make sure the place the breakpoint in files under app directory

console Error: Cannot find module '/path/to/debug.node':

it is because you install the node-inspector globally under a different version of Node.js,
it will not affect the functionality but you should still try correct the path

