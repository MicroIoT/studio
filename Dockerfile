FROM nginx:stable-alpine as production-stage
COPY dist/spa /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
