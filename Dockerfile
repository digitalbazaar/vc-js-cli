#
# ---- Base Node ----
FROM node:12-alpine AS base
# copy project file
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json .

#
# ---- Dependencies ----
FROM base AS dependencies
RUN apk add --no-cache git bash
# install node packages
USER node
WORKDIR /home/node/app
# RUN npm set progress=false && npm config set depth 0
RUN npm install --no-optional --production

#
# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /home/node/app/node_modules ./node_modules
# copy app sources
COPY --chown=node:node . .
USER node
ENTRYPOINT [ "node", "index.js" ]
