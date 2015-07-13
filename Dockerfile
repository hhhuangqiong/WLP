FROM iojs:latest

# This dockerfile is designed to run from the jenkins build server, i.e. please
# run 'npm install' and 'gulp' to prepare all dependencies and build the project.
# The built/compiled/installed dependencies with be copied into the docker image 
# using the COPY command instead.
COPY / /src/

WORKDIR /src

ENV NODE_ENV=production

# Rebuilding necessary node modules in iojs runtime
RUN npm rebuild node-sass bcrypt

RUN ["npm", "run", "dist"]

EXPOSE 3000 3100

COPY docker/hacks/env.js  /src/node_modules/nconf/lib/nconf/stores/

CMD ["node", "bin/www.js"]