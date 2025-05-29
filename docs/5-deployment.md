---
title: Deployment
layout: default
---
# Continous Integration and Continous Deployment

## Continous Deployment

This is the final step for deploying all our services into the cloud. We achieved this goal by creating a specific *github action* for this task. The action is called "Deploy on Google Cloud Platform" and it is divided into multiple steps:
1. Checkout of the current repository;
2. Clone the cloud utility *service-builder*;
3. Install the *service-builder's* python version;
4. Install UV and sync all the *service-builder* dependencies;
5. Install the Google Cloud SDK and run the authentication for Google Cloud;
6. Set up Docker and Docker buildx;
7. Login to Google Cloud Artifact;
8. Install and setup NodeJS;
9. Build all the Docker Images and deploy them on Google Cloud Run.

By executing all this steps, it is possible to deploy all the images on the cloud. It is important to say that this workflow in triggered manually. The main reason for that is because it is a really costly operation and doing that every time that a push is made on the *main* branch can result is a higher invoice.

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/4-devops.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <a href="/er-climate-monitor/6-conclusions.html">Next &raquo;</a>
</div>

