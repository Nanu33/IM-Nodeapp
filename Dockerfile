FROM ubuntu:latest

FROM node:16

WORKDIR /opt/node-app

COPY package.json /opt/node-app


RUN npm install


#RUN npm i serverless

# Setup workdir
COPY . /opt/node-app

RUN apt-get update && apt-get install -y nano

RUN unlink /etc/localtime

RUN ln -s /usr/share/zoneinfo/Asia/Kolkata /etc/localtime

RUN date

RUN apt update


EXPOSE 3005

# Run the command on container startup
CMD node app.js 
