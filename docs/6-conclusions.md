---
title: Conclusions
layout: default
---
# Conclusions

## Goals and Achievements

We are extremely pleased with the overall outcome. We successfully designed a well-defined architecture in which each service is dedicated to a specific domain, ensuring clear boundaries and responsibilities. A key achievement is that all systems are now highly independent, allowing them to operate, evolve, and scale autonomously. Additionally, for each microservice, we introduced the capability to deploy it on Google Cloud Platform, making it accessible not only locally but also externally. This marks a significant step forward in terms of flexibility, scalability, and readiness for production environments.

## Future Works

Now that we have concluded our project, we can make a brief description of future works that can enhance the quality of the system:
1. Introduce SMS notifications, in this way the user will be notified in real time without having our website open in background;
2. Implement a new page that is linked to a specific sensor, in this way we can have better schemas and charts;
3. Add new page that will have the latest atmosferic news;
4. Introduce the ability to visualise multiple charts for a sensor's detections;
5. Add a new page for visualising the history of detections for a single sensor, by doing so we can show enhanced charts and show temporal events in a period.
6. Deploy the entire all the services on Google Cloud Kubernetes Engine (GKE), in this way we can manage different workloads automatically by paying for what we use.
7. Release each microservice on NPM. A test has been made, but using a monorepo setup this further complicates the release of individual microservices. It has been
successfully tested the deployment on npm of some components (see the [api-gateway release](https://www.npmjs.com/package/@er-climate-monitor/api-gateway) in our organisation NPM page), but the actual integration of semantic
release and NPM publish is much harder in a monorepo scenario. For this reason, in future developments we suggest separating every microservice in its own repository
and deploying them singularly and easily on NPM. By using this  approach, the actual deployment on GCP or services dockerisation will become trivial and faster.

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/5-deployment.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <span></span>
</div>

