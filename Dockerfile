
FROM node:12.16.0-alpine

LABEL org.opencontainers.image.source https://github.com/rtang03/fabric-es-chaincode

ENV TIME_ZONE=Asia/Hong_Kong \
    ENV_NAME=production \
    NODE_ENV=production \
    NODE_CONFIG_ENV=production

RUN mkdir /home/app/ \
  && chown -R node:node /home/app/

COPY --chown=node:node . /home/app/

RUN apk add --no-cache --virtual .build-deps tzdata \
  && cp /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime \
  && echo "Asia/Hong_Kong" > /etc/timezone \
  && cd /home/app \
  && npm install --production  \
  && apk del .build-deps

USER node

WORKDIR /home/app/

CMD ["npm", "start"]
