---
title: Deployment
layout: default
---
# Continuous Integration and Continuous Deployment

## Continuous Integration

To improve our development workflow and maintain a high standard of code quality, we are introducing Continuous Integration (CI) into the project.

### Automatic Release (Backend)

The automatic release workflow helps us in deliverying the new code changes to users without manual intervention. The workflow automatically runs all the tests defined inside each service (creating also the coverage), checks the synstanx using eslint. Then, after all this preliminary operations, if all of them exit succesfully, the system will automatically create a release, available inside the Project's release section.

### Automatic Labelling of Pull Requests (Backend)

This action helps reviewers quickly understand what parts of the codebase are affected. This action is always triggered on pull requests events and assign the correct label using the following rules: 

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

#### Continuous Deployment to GitHub Pages

A second job downloads the uploaded bundle and pushes it to the `gh-pages` branch using [`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages).

```yaml
jobs:
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: ${{ needs.build.outputs.artifact-name }}
          path: ./dist

      - uses: peaceiris/actions-gh-pages@v4
        with:
          personal_token: ${{ secrets.GH_PAGES_TOKEN }}
          publish_dir: ./dist
```

---

## Continuous Deployment (Backend)

This is the pipeline that is responsible for deploying automatically all our services into the cloud. The workflow in manually dispatched, in this way it is possible to have a better control over the entire process.

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

### Workflow for deploying the services

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
