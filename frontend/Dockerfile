# Stage 1: Build react client
FROM node:16-alpine as build

# Working directory be app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Copying source files
COPY . .

# Installing dependencies
RUN npm install

# Building app
RUN npm run build

# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Start nginx 
CMD ["nginx", "-g", "daemon off;"]
