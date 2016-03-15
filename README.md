# Koodain

A web IDE for LiquidIoT applications.

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.0.0-rc8.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and NPM](nodejs.org) >= v0.12.0
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/)

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Create a settings file for local development by copying `server/config/environment/local.js`
as a new file `server/config/environment/YOURNAME.js`. Modify it as needed.

4. Run `NODE_ENV=YOURNAME grunt serve` to start the development server. It should automatically open the client in your browser when ready.


## Build & development

Run `grunt build` for building and `NODE_ENV=YOURNAME grunt serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.

## Deployment

The app can be deployed with the command

    ./deploy.sh <ssh_server> <branch_name>

E.g. for develop build:

    ./deploy.sh easi4 develop

and for master build:

    ./deploy.sh easi4 master

^ where `easi4` is the name of the ssh server. It can be configured in `~/.ssh/config`:

    host easi4
      hostname easi-vm-4.rd.tut.fi
      user ubuntu
      identityfile ~/.ssh/easi4_private_key.pem


## Swagger Editor

This repository also contains a slightly modified version of the [Swagger Editor](https://github.com/swagger-api/swagger-editor)
at `client\swagger-editor`. The modified version is at https://github.com/ahn/swagger-editor .

To update the swagger editor used by the IDE,

1. `git clone https://github.com/ahn/swagger-editor.git`
2. In the `swagger-editor` dir, run `grunt build`
3. Copy the `dist` directory to this (Koodain) repository as `client/swagger-editor`.


