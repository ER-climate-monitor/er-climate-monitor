# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=23.4.0

FROM node:${NODE_VERSION}-alpine

# Run the application as a non-root user.
USER root
ENV PORT=8080
ENV DB_URL="mongodb+srv://aldobagliollc:cHgMKX9sHdFD7GyI@cluster0.xktcqxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
ENV AMPQ_URL="amqps://jakamicd:PB5xeKcvPbGIkOg14rAqtCLhrYmBhvKS@dog.lmq.cloudamqp.com/jakamicd"
ENV EXCHANGE_NAME="sensor.notifications"
ENV RECONNECT_RETRIES_NUMBER=5

# Copy the rest of the source files into the image.

WORKDIR /usr/src/app

COPY . .
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
RUN npm uninstall tsc && npm install -D typescript

EXPOSE 8080
EXPOSE 8081

# Run the application.
CMD npm run build ; npm run start
