---
title: DevOps Scenario
layout: default
---
# DevOps

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

### Google Cloud

Before we started deploy all our images, it was necessary to decide which cloud provider to use. Among all the possible choices our decision was between two providers (here are listed some of the advantages):
1. *Azure*: the Alma Mater Studiorum gives 100$ to use with them;
2. *Google Cloud*: it is easy to use, it is really fast, it has a lot of libraries by which it is possible to use it, it has a lot of support, it has a lot of services.
So driven by all the advantages of GCP, we choose to use it. Among all the possible services that *Google Cloud* exposes, we had to use only: *Google Cloud Artifact Registry* and *Google Cloud Run*.

#### Google Cloud Artifact Registry

The *Google Cloud Artifact Registry* is a repository where it is possible to store *Docker* images. All the images that we build, must be tagged with a specific ID, and pushed inside the *Registry*. All this can be achieved by using the standard *docker build* command, here a snippet of our command: 

```bash
docker build --push -t {GCP-REGION}-docker.pkg.dev/{GCP-PROJECT}/{name-of-repository}/{tag-of-the-image} .
```

By default the last image that is pushed inside the *Registry* is labelled as *latest*, in this way the deploy is far more easy, because the deploy will always take the latest image pushed.

#### Google Cloud Run

It is a *Google* service that enables the automatic deployment of container images stored in a *Google Cloud Archive*. This service also supports automatic scaling—dynamically adjusting the number of instances based on incoming request traffic—allowing seamless handling of varying workloads. To deploy an image, a specific Google Cloud command is used:

```bash
gcloud run deploy {SERVICE-NAME}--image {Docker-TAG} --project {GCP-PROJECT} --region {GCP-REGION} --port {PORT}
```

In this way we are able to deploy our instances into the cloud and make it available to the internet.

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/3-design.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <a href="/er-climate-monitor/5-deployment.html">Next &raquo;</a>
</div>

