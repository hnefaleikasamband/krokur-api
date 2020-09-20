# Krókur API

This is the backend for the Diploma boxing project Krókur. Krókurs objective is to help manage tournament & matches related to Diploma boxing in Iceland.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

The api is built on [NodeJS](https://nodejs.org/en/download/) using [Express](https://expressjs.com/) as it's http wrapper.

We highly recommend using a version manager for node like [NVM](https://github.com/creationix/nvm).

```
nvm install
```

If nvm does not set the current node version to what you just installed, run `nvm use`.

Technically [Docker](https://docs.docker.com/install/) is not necessary, but having docker locally significantly helps managing postgres & testing the built api image.

---

## Installing

### Install node dependencies

```
npm install
```

### Create a `.env` at the root of the project. The following values marked with a star are required

```
PORT=<port for service>
DB_URI=<postgres://PATH_TO_DB>
JWT_SECRET=<your super random secret string>
KROKUR_WEB=<PATH TO WEB. f.e. http://localhost:3001> *
GOOGLE_ID=<GOOGLE-ID for logging in with google> *
GOOGLE_SECRET=<GOOGLE-SECRET for logging in with google> *
GOOGLE_CALLBACK_URL=<path to api callback url for google auth>
```

### Set up local postgreSQL using docker

We like to use docker to manage our postgreSQL instance locally. This makes it easy to run a specific version of PG that mimics the production one.

Pull the latest stable postgres image

```
docker pull postgres
```

To pull down a specific version you can `docker pull postgres:[tag_you_want]`

For easy creation of the correct tables you can use the `psql` CLI tool

```
psql -h localhost -U postgres -a -f sql/schema.sql
```

When prompted for the password type in "docker" (or the one you changed it to locally). This will create the tables & foreign key relation needed along side timestamp triggers & auto UUID creation.

If you are running a unix like system, the only thing needed to do now is run

```
npm run pg-docker
```

This mounts a persistent volume to the postgres container. The data will reside in `~/docker/volumes/postgres`

---

## Running & building

Everything should now be set up & ready for you to run the project locally.

```
npm start
```

and to build

```
npm run build
```

## Running the tests

Currently there are no tests.

## Contributing

Currently we are not looking for contributors, but pull requests are accepted.
