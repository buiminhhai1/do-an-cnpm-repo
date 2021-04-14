<p align="center">
    <a class="no-attachment-icon" href="#" target="_blank" rel="nofollow noreferrer">
        <img src="https://user-images.githubusercontent.com/645641/79596653-38f81200-80e1-11ea-98cd-1c6a3bb5de51.png" alt="lerna-logo" height="300">
    </a>
</p>

<h2 align="center"><a href="https://github.com/buiminhhai1/ultimate-backend-repo">Microservice-lerna-cqrs</a></h2>

<p align="center">
    <a href="https://lerna.js.org/" rel="nofollow noreferrer" target="_blank"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna"></a>
    <a href="https://www.conventionalcommits.org/" rel="nofollow noreferrer" target="_blank"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-cc00ff.svg" alt="lerna"></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="prs welcome"></a>
    <a href="#"><img src="https://img.shields.io/jenkins/build?jobUrl=http%3A%2F%2Ftesting.coe.com%2Fjenkins%2FbuildStatus%2Ficon%3Fstyle%3Dflat%26job%3Dathenka-studio" alt="build"></a>
    <a href="#" alt="twitter"></a>
</p>

### Table of contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Development flow](#development-flow)

### On-boarding guide

Please make sure to go through all these steps on your on-boarding day

1. Setup your OS environment. On Windows, we **recommend** using `git-bash` for any shell command, which is bundled within [Git installation](https://git-scm.com/downloads)
2. Setup your IDE, here we use [Visual Studio Code](https://code.visualstudio.com/)
3. Install [Node.js](https://nodejs.org/en/download) and [Yarn](https://yarnpkg.com). Please noted that Yarn is **required** for installation step.
4. Install OS build-tools
   1. On Windows: [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)
   2. On MacOS: `xcode-select --install`
5. Install `node-gyp` globally through npm: `npm install -g node-gyp`
6. Download & install [Docker](https://hub.docker.com/?overlay=onboarding)
7. Clone repo via ssh `git clone git@github.com:buiminhhai1/do-an-cnpm-repo.git` or clone repo with Https: `git clone https://github.com/buiminhhai1/do-an-cnpm-repo.git`
8. At the **root of the project**, run: `yarn && yarn bootstrap`
9. In any service (services/backend-service): `yarn start:dev` or `yarn dev`
10. Read the [contributing guide](CONTRIBUTING.md) carefully before you commit your very first lines of code
11. Make sure you can access to all links in the [Resources section](#resources)
12. Ask other team members if you face any problem following these steps

<br />

There're some knowing issues with **Windows** users:

- You may install `node-gyp` via `npm` to have it work properly
- If you encounter any problem with `node-gyp` and `MSBuild` while running yarn, please consider this answer: https://github.com/nodejs/node-gyp/issues/1663#issuecomment-574834463
- You have to use Linux container option (instead of Windows container) in Docker to run `yarn ecosystem:up`

### Prerequisites

- [Node.js](https://nodejs.org/en/download): JavaScript runtime
  
  > Recommended version `12.x LTS`.

- [Yarn](https://yarnpkg.com): Dependency management tool

  Yarn is required for its speed & [`workspace`](https://yarnpkg.com/lang/en/docs/workspaces) feature.
  
  > Recommended version `>= 1.22.5`.

### Installation

```sh
yarn
```

This repo use [monorepo strategy](docs/monorepo.md) to manage its source code across all related services in one place.

[Lerna](https://lerna.js.org) is a development tool for managing multiple JavaScript packages,
which help us symlink packages into each other likes they were published to a `npm registry` via [bootstrap](https://github.com/lerna/lerna/tree/master/commands/bootstrap#readme) step.

[Yarn workspace](https://yarnpkg.com/lang/en/docs/workspaces) is a feature of yarn that allows us to install dependencies for multiple services only once.

### Getting started

> At the root of the project, if you want run database on your local machine:

```sh
yarn ecosystem:up
```

We use `docker-compose` to start & setup ecosystem services: postgres, kafka,... in the development.

> In any service:

```sh
yarn start:dev
```

We try to maintain these script name conventions across all services & packages:

- `start:dev`: for starting a process in development mode. `auto-reloading` on changes is supported.
- `start:prod`: for starting a process in production mode. Run directly from transpiled code, usually in 'dist' folder.
- `build`: transpile `source code` from another form (ES7, Typescript) into standard JavaScript (ES5, ES6). Other steps may happen here: bundling, code splitting, css preprocessing,...
- `test`: run unit tests.
- `test:watch`: run unit tests in `watch mode`.
- `test:cov`: run unit tests & generate `coverage report`.
- `test:e2e`: run end-to-end tests.
- `lint`: excute linting script.

Other scripts will be appear in package.json of each services or packages.

### Development flow
We currently maintain 2 branches in our project: `master` and `dev`.

The `master` branch is the closest thing to `production`, so we will do our best to keep it in a good shape, with stable features

`dev` branch contains in-development codes, which will be deployed to `staging` server.

`feat/*` are `feature` branches which are branched off `dev` and will be merged back into `dev`.

`hotfix/*` branches provide immediate actions with undesired bugs on `master`. May branch off from `master` and must merge into `master` and `dev`.

`release/*` branches support the preparation of a new production release. They allow many minor bugs to be fixed and preparation of meta-data for a release. May branch off from `dev` and must merge into `master` and `dev`.

#### Development flow

1. **Always pull requests**

    We're applying `code reviewing` process and maybe `PR based changelog` in the future, so please create a `pull request` whenever you want to contribute to source code.
    
    A good `pull request` should have a short and concise `title`, a clear `description` and at least one `label`. Working in progress `pull request` will be prefixed with `WIP:`.
    
    A `pull request` should be created before you start working on something, so any member of our team in interest can keep track while you're in progress.

2. **Conventional commits**

    Each commit only contains a small number of changes with a meaningful and concise message.
    
    Make sure your commit messages follow [conventional commits rules](https://www.conventionalcommits.org), which will help us in: automatically bumping version using [semantic versioning strategy](https://semver.org) and code reviewing.

3. **Pretty & lint your code before commit**

    We're using some prettier and linting rules to prevent potential semantic errors and make code consistent between members. So, please make sure you aware of this.
