FROM node:10.7.0
EXPOSE 80

# Setup app dir
RUN mkdir -p /usr/local/share/app
WORKDIR /usr/local/share/app

COPY ./package.json package-lock.json /usr/local/share/app/
COPY .npmrc /usr/local/share/app/
RUN npm install --production
COPY dist /usr/local/share/app

CMD ["node", "app.js"]
