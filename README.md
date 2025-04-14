# Penpal AI Database Service

This is the database service for the Penpal AI application, built with NestJS, MongoDB, and Redis.

## Features

- User management with roles and permissions
- Language learning tracking
- AI character management
- Conversation and message handling
- Secure authentication and authorization
- Redis caching for optimized performance
- API documentation with Swagger
- Database seeding for development

## Prerequisites

- Node.js (v20 or higher)
- MongoDB (v6.0 or higher)
- Redis (v7.0 or higher)
- npm or yarn

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/penpal-ai-db-service.git
cd penpal-ai-db-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Edit the `.env` file to match your environment.

4. Run the application in development mode:
```bash
npm run start:dev
```

### Using Docker Compose

1. Clone the repository and navigate to the compose folder:
```bash
git clone https://github.com/your-username/penpal-ai-db-service.git
cd penpal-ai-db-service/compose
```

2. Start the services with Docker Compose:
```bash
docker-compose up -d
```

## Architecture

The application is built with NestJS and uses:
- **MongoDB** as the primary database
- **Redis** as a caching system
- **JWT** for authentication
- **Swagger** for API documentation

### Data Model

![Data Model](MVP-penpal-ai-diagram.png)

- **Users**: User management, profiles, and preferences
- **Roles**: Role-based access control
- **Languages**: Languages available for learning
- **AI Characters**: AI personalities to converse with
- **Conversations**: Exchanges between users and AI
- **Messages**: Conversation content

## API Endpoints

The API is accessible at `http://localhost:3001/api/v1` and the Swagger documentation at `http://localhost:3001/docs`.

### Main endpoints

#### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create a user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

#### Languages
- `GET /languages` - List all languages
- `GET /languages/:code` - Get language details
- `POST /languages` - Create a language
- `PUT /languages/:code` - Update a language
- `DELETE /languages/:code` - Delete a language

#### Roles
- `GET /roles` - List all roles
- `GET /roles/:name` - Get role details
- `POST /roles` - Create a role
- `PUT /roles/:name` - Update a role
- `DELETE /roles/:name` - Delete a role

#### AI Characters
- `GET /ai-characters` - List all AI characters
- `GET /ai-characters/:id` - Get AI character details
- `POST /ai-characters` - Create an AI character
- `PUT /ai-characters/:id` - Update an AI character
- `DELETE /ai-characters/:id` - Delete an AI character

## Redis Caching System

The service uses Redis as a caching system to optimize the performance of frequently accessed requests.

### Cache Configuration

Redis caching is configured in the `src/modules/cache/cache.module.ts` file.

The main configuration options are:
- `REDIS_HOST`: Redis host (default: localhost or redis in Docker)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password
- `REDIS_TTL`: Cache time-to-live in seconds (default: 3600)

### Cached Endpoints

The following routes use Redis caching:
- `GET /languages` - List of languages (TTL: 3600s)
- `GET /languages/:code` - Language details (TTL: 3600s)
- `GET /users` - List of users (TTL: 3600s)
- `GET /users/:id` - User details (TTL: 3600s)
- `GET /roles` - List of roles (TTL: 3600s)
- `GET /roles/:name` - Role details (TTL: 3600s)
- `GET /ai-characters` - List of AI characters (TTL: 3600s)
- `GET /ai-characters/:id` - AI character details (TTL: 3600s)

## Environment Variables

### Database
- `MONGODB_URI`: MongoDB connection URI
- `MONGODB_USER`: MongoDB username
- `MONGODB_PASSWORD`: MongoDB password

### Redis Cache
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password
- `REDIS_TTL`: Cache time-to-live (seconds)

### JWT
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRATION`: Token expiration period

### API
- `API_PREFIX`: API prefix (default: /api)
- `API_VERSION`: API version (default: v1)
- `PORT`: Server port

### Security
- `PASSWORD_SALT_ROUNDS`: Password hashing rounds
- `MAX_LOGIN_ATTEMPTS`: Maximum login attempts
- `LOGIN_LOCKOUT_MINUTES`: Lockout duration after failed attempts

### Miscellaneous
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `NODE_ENV`: Environment (development, production, test)
- `CORS_ORIGIN`: Allowed origins for CORS

## Logging and Monitoring

In development mode, the service displays detailed logs for each request including:
- Method and URL
- Response status
- Response time
- Request and response body (in debug mode)

To adjust the log detail level, modify the `LOG_LEVEL` variable in the `.env` file.

## License

MIT
