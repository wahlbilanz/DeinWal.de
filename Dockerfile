# build the website
FROM node as donator
COPY . /data
WORKDIR /data
RUN npm ci
RUN npm run build:prod

# deploy to an nginx
FROM nginx
ADD nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=donator /data/dist /usr/share/nginx/html

