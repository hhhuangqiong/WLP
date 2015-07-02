FROM iojs:latest

RUN npm install -g forever

RUN git clone --depth=1 -b bolt http://gerrit.dev.maaii.com/m800-white-label-portal /src/

WORKDIR /src

# not put 'production' env here on purpose
RUN npm install

ENV NODE_ENV=production

RUN ["npm", "run", "dist"]

EXPOSE 3000 3100

COPY docker/hacks/env.js  /src/node_modules/nconf/lib/nconf/stores/

CMD ["forever", "bin/www.js"]
