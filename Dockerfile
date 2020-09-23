### STAGE 1: Build ###
FROM node:10
ARG environment=dev
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
COPY . /usr/src/app
RUN npm install --silent
RUN npm run build
CMD ["npm", "run", "server:serve"]