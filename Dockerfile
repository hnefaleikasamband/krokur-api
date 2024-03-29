FROM node:20-alpine as base

RUN mkdir -p /usr/local/share/app
WORKDIR /usr/local/share/app
COPY ./ /usr/local/share/app/
RUN npm install
RUN npm run build

# Second stage
FROM node:20-alpine

RUN mkdir -p /usr/local/share/app
WORKDIR /usr/local/share/app
COPY ./package.json package-lock.json /usr/local/share/app/
COPY --from=base /usr/local/share/app/.nvmrc /usr/local/share/app/
RUN npm ci --production

COPY --from=base /usr/local/share/app/dist /usr/local/share/app

CMD ["node", "index.js"]
