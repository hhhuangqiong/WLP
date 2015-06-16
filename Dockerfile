FROM iojs:latest

RUN git clone --depth=1 -b bolt http://gerrit.dev.maaii.com/m800-white-label-portal /src/

WORKDIR /src

# require "devDependencies" to build
RUN npm install

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "deploy"]
