# Development

## Run the application

### Install dependencies

To run the project you will need install the dependencies using Npm and Bower.
```
# install bower modules
bower -f install

# install node modules
npm i
```

### Set up the enviornment

You will need *Redis* and *MongoDB* to be installed and running on ur system. If you are on Mac, use [Homebrew](http://brew.sh) to install both of them.

There are env variables that needs set before you can run the application. Check `envrc.sample` for the enviornment variables that needs to be set. To setup env variables for each project locally, we suggest to use [direnv](direnv.net), it is also available via Homebrew.

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

it is because you install the node-inspector globally under a different version of iojs,
it will not affect the functionality but you should still try correct the path

