# Penpal AI - Database Service

This service handles database operations for the Penpal AI application, a conversational AI language learning platform.

## Description

The database service is responsible for storing and retrieving data related to:

- Users and authentication
- AI character profiles
- Conversations between users and AI characters
- Language learning progress
- Available languages

## Tech Stack

- **NestJS**: Backend framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Data Modeling)
- **TypeScript**: Programming language

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository

```bash
git clone git@github.com:your-username/penpal-ai-db-service.git
cd penpal-ai-db-service
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the development server

```bash
npm run start:dev
```

### Database Seeding

To populate the database with initial data:

```bash
npm run seed
```

This will create:

- Default languages
- System roles
- Sample AI characters

## API Endpoints

### Languages

- `GET /languages` - Get all languages
- `GET /languages/:code` - Get language by code
- `POST /languages` - Create new language
- `PUT /languages/:code` - Update language
- `DELETE /languages/:code` - Delete language

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Conversations

- `GET /conversations` - Get all conversations
- `GET /conversations/:id` - Get conversation by ID
- `POST /conversations` - Create new conversation
- `PUT /conversations/:id` - Update conversation
- `DELETE /conversations/:id` - Delete conversation

## Database Schema

The database follows this schema:

### Users Collection

Stores user information and preferences.

### Roles Collection

Defines user roles and permissions.

### AICharacters Collection

Contains AI language partner profiles.

### Conversations Collection

Stores conversation metadata.

### Messages Collection

Stores individual messages within conversations.

### Languages Collection

Available languages for learning.

### UserLanguages Collection

Tracks user progress in each language.

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is licensed under the MIT License.
