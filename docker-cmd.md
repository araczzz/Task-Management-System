## Setup MySQL in CLI

- `docker exec -it <container-name> <service-name> -p`

## Non-Root User

- `docker inspect <container-name> --format='{{.Config.User}}'`
- `docker inspect <container-name>`

## docker-compose.yaml

- `docker-compose up`
- `docker-compose up -d`
- `docker-compose down`
- `docker logs <container-name>`

## Enter Container Interactive Shell (Linux)

- `docker exec -it backend_container sh`
- `du`
- `du -sh`

## Docker Commands
- `docker build -t alpine .`
- `docker run -p 3002:3002 -d --rm --name backend_container alpine:latest`
- `docker logs backend_container`

## For running .env file
- `docker run -p 3002:3002 --env-file ./.env -d --rm --name backend_container alpine:latest`