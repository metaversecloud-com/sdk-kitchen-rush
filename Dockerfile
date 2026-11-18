ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine
WORKDIR /app
ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG BUILD_TIME
ENV BUILD_TIME=$BUILD_TIME
ADD package* ./
ADD node_modules ./node_modules
ADD server/dist ./server/dist
ADD server/package* ./server/
ADD client/build ./client/build
EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]
