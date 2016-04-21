FROM mhart/alpine-node:5
MAINTAINER "Andy Hui" <andyhui@maaii.com>

# This dockerfile is designed to run from the jenkins build server, i.e. please
# run 'npm install' and 'gulp' to prepare all dependencies and build the project.
# The built/compiled/installed dependencies with be copied into the docker image
# using the COPY command instead.
COPY . /src/

WORKDIR /src

ENV NODE_ENV=production

# disable cache for babel register, avoid permission problem for babel-register with user no body
ENV BABEL_DISABLE_CACHE=1

# 1. application listen port
# 2. kue UI
# 3. expose for debug purpose
EXPOSE 3000 3100 5858

USER nobody

CMD ["node", "bin/www.js"]
