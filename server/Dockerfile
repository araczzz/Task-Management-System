# Base Image
FROM alpine

# Define working directory of a Docker container
WORKDIR /app

RUN apk add npm

# Optimisation step for running the Dockerfile
# If no changes in package.json, `npm install` step is skipped
COPY package.json .

# Running NPM to install dependencies in package.json files
RUN npm install

# Copying all files in the folder into the working directory
COPY . .

# CREATE NON ROOT USER GROUP IN CONTAINER
# CREATE A DEFAULT USER AND ADD USER TO GROUP
RUN addgroup -S nonroot && adduser -S default -G nonroot

# CREATE A DEFAULT USER IN GROUP
# RUN adduser -S default -g nonroot

# START DOCKER AS THIS USER
USER default

# Expose PORT from within the container to the host machine
# EXPOSE 3002

# # using node modules on the image
# VOLUME ["/app/node_modules"]

# Command to run app.js (NodeJS)
CMD ["npm", "start"]

# docker inspect backend_container --format='{{.Config.User}}'