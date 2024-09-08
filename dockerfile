FROM node:22-bookworm

WORKDIR /var/app

# COPY ./package.json /var/app/package.json
# COPY ./package-lock.json /var/app/package-lock.json
# COPY ./tsconfig.server.json /var/app/tsconfig.server.json
# COPY ./webpack.config.js /var/app/webpack.config.js
# COPY ./.babelrc /var/app/.babelrc
# COPY ./src /var/app/src

# RUN npm i; \
#     npm run build-server; \
#     npm run build-client;

# CMD [ "npm", "run", "dev" ]