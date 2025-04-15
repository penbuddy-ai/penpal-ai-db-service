# PenPal AI - Development Environment

This directory contains Docker Compose configuration to run the PenPal AI database service and required dependencies locally.

## Services Included

- **db-service**: The PenPal AI database service (NestJS application)
- **mongodb**: MongoDB database instance (v6.0)
- **redis**: Redis cache server (v7.0-alpine)

## Prerequisites

- Docker and Docker Compose installed on your system
- Git repository cloned locally

## Getting Started

1. Navigate to the compose directory:

   ```
   cd compose
   ```

2. Start all services:

   ```
   docker-compose up
   ```

   Or to run in detached mode:

   ```
   docker-compose up -d
   ```

3. Access the API at:

   ```
   http://localhost:3001/api/v1
   ```

4. Swagger UI documentation is available at:
   ```
   http://localhost:3001/api/docs
   ```

## Environment Variables

The `.env` file contains all necessary environment variables for local development. Key variables:

- MongoDB connection: `mongodb://admin:admin123@mongodb:27017/penpal-ai?authSource=admin`
- Redis connection: host=`redis`, port=`6379`, password=`redis123`
- API server port: `3001`

## Data Persistence

All data is persisted using Docker volumes:

- `mongodb_data`: MongoDB database files
- `mongodb_config`: MongoDB configuration
- `redis_data`: Redis data
- `node_modules`: Node.js dependencies

## Stopping the Services

To stop the services:

```
docker-compose down
```

To stop and remove volumes (will delete all data):

```
docker-compose down -v
```

## Troubleshooting

- **Service fails to start**: Check logs with `docker-compose logs [service-name]`
- **Database connection issues**: Ensure environment variables are correctly set
- **Container health checks failing**: Check individual service logs for details
