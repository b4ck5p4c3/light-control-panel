FROM node:20-alpine
WORKDIR /app
COPY . .
RUN yarn --pure-lockfile
EXPOSE 8080
CMD yarn start