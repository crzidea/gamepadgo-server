FROM node:slim

COPY . /application
WORKDIR /application
RUN npm install && npm cache clean --force

EXPOSE 8080 8079

CMD npm start
