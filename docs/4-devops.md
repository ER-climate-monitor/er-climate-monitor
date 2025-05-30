---
title: DevOps Scenario
layout: default
---
# DevOps

## Quality
### Frontend
### Backend

## Versioning
TBD

## Licensing
TBD

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

The Dockerfile is used inside the CD pipeline, for automatically build the image and push it inside a *Google Cloud Archive*. For automatising the deployment of each service we have created a Python3 program that takes as input three different parameters and what it does is the follow (the script can be found here: [Service Builder](https://github.com/MatteoIorio11/service-builder)):
1. Build and tag an image;
2. Push the image inside a Google Cloud Archive;
3. Deploy the image stored inside the Google Cloud Archive inside the Google Cloud Run.

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/3-design.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <a href="/er-climate-monitor/5-deployment.html">Next &raquo;</a>
</div>

