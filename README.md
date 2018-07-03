# Diploma Boxing Backend

This is the backend for the Diploma boxing project. It handles all requests regarding data being displayed on the angular frontend.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The backend depons on NodeJS and MongoDB. It is originally developed on Ubuntu 18.04 but you can follow the installation instruction for your operating system on the projects website.

[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

[MongoDB](https://docs.mongodb.com/manual/installation/)

[NodeJS](https://nodejs.org/en/download/)

We highly recommend using a version manager for node like [NVM](https://github.com/creationix/nvm).

## Installing
*Notice! the latter expects you are installing on Ubuntu, you can follow along with most of the commands for other operating systems but keep this in mind.*

After installing both MongoDB and NVM we will start by installing Node 8.9.4.
```
nvm install 8.9.4
``` 

If you just installed NVM this will set the default to use 8.9.4, but if you where using another version add `nvm use 8.9.4`.


If you haven't already, now is the time to clone the repo
```
git clone git@git.mikligardur.com:HNI/diploma-umsysla.git
```

If you are considering contributing to the project we recommend using the dev branch
```
git checkout dev
```

### Install node dependencies
cd into the backend directory ( `cd diploma-umsysla/backend` ) and run 

```
npm install
```

Now everything should be set up and you can just run it with
```
npm start
```

### Create config file
You need to copy and rename the config file `src/config/main-default.js` to `src/config/main.js` 

```
cp src/config/main-default.js src/config/main.js
```
and then update the file with correct information

### Seed database.
If you like to have some dummy data for testing you can run
```
npm run seed
```

## Running the tests

Currently there are no automated tests.

## Built With

* [VS Code](https://code.visualstudio.com/Download) - Code editor
* [NodeJS](https://nodejs.org) - JavaScript runtime
* [MongoDB](https://www.mongodb.com/) - Document-oriented database program.
* [Express](https://expressjs.com/) - Web application framework
* [Mongoose](http://mongoosejs.com/) - MongoDB object modeling

## Contributing

Please read [CONTRIBUTING.md]() for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://git.mikligardur.com/HNI/diploma-umsysla/tags). 

## Authors

* **Gunnar Davíð** - *Initial work* - [GDGunnars(self hosted)](http://git.mikligardur.com/gdgunnars) / [github](https://github.com/gdgunnars)

See also the list of [contributors](https://git.mikligardur.com/HNI/diploma-umsysla/graphs/dev) who participated in this project.

