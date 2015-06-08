# M800 White Label Portal

## Setup
Copy envrc.sample as .envrc in the root directory. This provide the essential environmental variables for the server to load. 

## Deployment

```
npm i -g pm2

pm2 start bin/www -i 0

pm2 stop all

pm2 logs

pm2 status

# for 'bind EADDRINUSE'
pm2 kill
```

Tools:

- [PM2](https://github.com/Unitech/pm2)

## Diagram

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
- Tools / libraries
  - [Mermaid](https://github.com/knsv/mermaid)

