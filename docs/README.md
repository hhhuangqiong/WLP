# M800 White Label Portal

## Change Log

### 1.7.1
- Gitbook first launch



## Debug

Environment:

- iojs @ 1.2.0 / @2.3.4

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

## Diagram

Tool:

- [Mermaid](https://github.com/knsv/mermaid)

Steps:

```
# required packages to generate the diagram
npm i -g mermaid phantomjs
# generate 'COMPONENTS.md.png'
mermaid COMPONENTS.md -v
```

## Reference

- [Requirements](http://issuetracking.maaii.com:8090/display/MAAIIPR/WL+Portal+Requirements)
- [wireframe](http://192.168.118.63/~louislam/m800-white-label-portal-v2/)
- [layout preview](http://issuetracking.maaii.com:8080/browse/UMWP-45)
