FROM keymetrics/pm2:10-alpine
EXPOSE 80

# Setup app dir
RUN mkdir -p /usr/local/share/app
WORKDIR /usr/local/share/app

COPY ./package.json package-lock.json /usr/local/share/app/
COPY .nvmrc /usr/local/share/app/
RUN npm install --production
RUN npm run build
COPY dist /usr/local/share/app

CMD ["node", "app.js"]
