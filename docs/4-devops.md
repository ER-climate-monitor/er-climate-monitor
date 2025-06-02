---
title: DevOps Scenario
layout: default
---
# DevOps

## Quality

It is also important that every lines of code that is pushed inside the
production environment must be compliant to a certain level of quality, meaning
that code must use the correct syntax, stick to best practices (e.g. reduce as
much as possible the use of *any* where possible) and, more in general, be
consistent and correct. In order to provide such qualities to our code, the
project was developed using *Typescript*, which allows us to enforce stricter
type checking throughout the development process.
This approach enhances maintainability, reduces potential bugs, and promotes
more robust and predictable code. In all the different services we also decide
to use *eslint*, this helps in enforcing code quality, consistency, and best
practices across a codebase.

Every repository have strict rules on commits, where each one of them must properly
follow the conventional commits format.

### Frontend

The *Frontend*, specifies its own rules for quality, in order to crate VueJS application that are more maintainable.

### Backend QA workflow

Quality is assured in the backend by two main tasks:
- Run linter on new code in order to assesses stick to convention and codebase's consistency;
- Run whole test suites in order to assess that new code does not break existing codebase.

For each service, a code coverage report is produces and pushed on codecov, in order
to assess the degree of tested code for each microservice (acknowledging the flaws
that coverage implies).

## Docker and Containerization

Once we developed all our microservices, it was necessary to find a way to easily deploy all of them in cloud. In order to do so, we opted to use *Docker*, and by doing that, we created for each microservice a *Dockerfile*. This file helps us in creating a *Docker* image, that contains all the necessary dependencies for run the instance. It is also important to specify inside each *Dockerfile* a command for starting the service. Each microservice has its own specific *Dockerfile*, in which it also specifies all the necessary *ENV* variables that each system needs for configuring itself. Here can be seen an example of the Api Gateway's Dockerfile.

```Dockerfile
ARG NODE_VERSION=23.4.0
FROM node:${NODE_VERSION}-alpine
USER root
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
RUN npm uninstall tsc && npm install -D typescript

ENV REDIS_URL='VERYVERYSECRET'
ENV PORT=8080
ENV SECRET_API_KEY="SECRET"

EXPOSE 8080

CMD npm run build ; npm run start
```

The Dockerfile is used inside the CD pipeline, for automatically build the image and push it inside a *Google Cloud Archive*. For automatising the deployment of each service we have created a Python3 program that takes as input three different parameters and what it does is the follow (the script can be found here: [Service Builder](https://github.com/ER-climate-monitor/service-builder):
1. Build and tag an image;
2. Push the image inside a Google Cloud Archive;
3. Deploy the image stored inside the Google Cloud Archive inside the Google Cloud Run.

## Continuous Integration

To improve our development workflow and maintain a high standard of code quality, we are introducing Continuous Integration (CI) into the project.

### Automatic Labelling of Pull Requests (Backend)

This action helps reviewers quickly understand what parts of the codebase are
affected. This action is always triggered on pull requests events and assign the
correct label using the following rules, helping the team in determine which
member have the responsibility of the main review of the pull request: 

```yaml
ApiGateway:
- changed-files:
    - any-glob-to-any-file: 'api-gateway/**'
AuthenticationService:
- changed-files:
  - any-glob-to-any-file: 'authentication-service/**'
DetectinService:
- changed-files:
  - any-glob-to-any-file: 'detection-service/**'
NotificationService:
- changed-files:
  - any-glob-to-any-file: 'notification-service/**'
SensorRegistry:
- changed-files:
  - any-glob-to-any-file: 'sensor-registry/**'
Frontend:
- changed-files:
  - any-glob-to-any-file: 'er-climate-monitor-frontend/**'
Sensors:
- changed-files:
  - any-glob-to-any-file: 'er-climate-monitor-sensors/**'
Documentation:
- base-branch: 'docs'
```

---

### Automatic Build & Deploy (Frontend Vue)

The **front‑end** lives in the separate repository `er-climate-monitor-frontend` and is built with **Vue 3 + Vite**. A dedicated CI/CD pipeline ensures that the browser bundle is reproducible and automatically served via GitHub Pages.

#### CI workflow highlights

| Step                | Purpose                                    |  Details                                                                                                                                |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node matrix**     | Validate against current & legacy runtimes | Runs on Node 22 (LTS), 20 (maintenance) and 24 (catch early warnings). Builds on 24 use `continue-on-error` so the job warns but does not fail the workflow. |                                                            |
| **Code quality checks**   | Keep code healthy                          | Executes ESLint, unit tests, and coverage before building.                                                                                 |
| **Artifact upload** | Upload the bundle once (Node 22) so every later job consumes the same artifact                 | Node 22 job uploads `dist-<sha>.zip`                                            |
| **Scheduled run**   | Early‑detect stale dependencies            | Cron every Monday 04:00 UTC.                                                                                                               |

```yaml

strategy:
  matrix:
    node: [22, 20, 24]
continue-on-error: ${{ matrix.node == '24' }}

runs-on: ubuntu-latest

- name: Build production bundle
  run: npm run build

- name: Upload artifact (only once)
  if: ${{ matrix.node == '22' }}
  uses: actions/upload-artifact@v4
  with:
    name: ${{ steps.setname.outputs.name }}
    path: dist
```

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/3-design.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <a href="/er-climate-monitor/5-deployment.html">Next &raquo;</a>
</div>

