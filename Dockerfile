# Build
FROM node:23.11.0-slim AS builder

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Runtime 
FROM node:23.11.0-slim

#RUN useradd --user-group --create-home --shell /bin/false appuser

WORKDIR /home/appuser/app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/i18n ./i18n

#RUN chown -R appuser:appuser /home/appuser

#USER appuser

EXPOSE 3008 30080

CMD ["npm", "run", "start:dev"]
