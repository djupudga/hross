install:
	npm install

start:
	docker compose up -d

stop:
	docker compose down

logs:
	docker-compose logs -f

build:
	npm run clean
	npm run test
	npm run build
	docker compose build

prune:
	-docker rm -f `docker ps -a -q`
	-docker volume prune

mongo_shell:
	@echo To log in: mongo -u foo -p bar
	docker compose exec mongodb bash
