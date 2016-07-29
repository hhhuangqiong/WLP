FROM mhart/alpine-node:6.2
MAINTAINER "Andy Hui" <andyhui@maaii.com>

# To configure the timezone to Asia/Hong_Kong
# TODO: make it as m800-alpine-node
RUN apk add --update tzdata && \
    cp /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime && \
    echo "Asia/Hong_Kong" > /etc/timezone

# This dockerfile is designed to run from the jenkins build server, i.e. please
# run 'npm install' and 'gulp' to prepare all dependencies and build the project.
# The built/compiled/installed dependencies with be copied into the docker image
# using the COPY command instead.
COPY . /app/

WORKDIR /app

ENV NODE_ENV=production

# disable cache for babel register, avoid permission problem for babel-register with user no body
ENV BABEL_DISABLE_CACHE=1

# 1. application listen port
# 2. kue UI
# 3. expose for debug purpose
EXPOSE 3000 3100 5858

USER nobody

CMD ["node", "bin/www"]
