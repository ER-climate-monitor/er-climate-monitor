FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

FROM node:23-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

ENV PORT=8080
ENV DB_URL="mongodb+srv://matteoiorio01:bsHMrwnluMpMptJY@cluster0.tj3ou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
ENV DB_NAME='notifications-database'
ENV AMQP_URL="amqps://jakamicd:PB5xeKcvPbGIkOg14rAqtCLhrYmBhvKS@dog.lmq.cloudamqp.com/jakamicd"
ENV EXCHANGE_NAME="sensor.notifications"
ENV RECONNECT_RETRIES_NUMBER=5
ENV INSTANCE_ID='default'

EXPOSE 8080
CMD [ "npm", "start" ]
