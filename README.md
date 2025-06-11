# Auth Service

A NestJS microservice for user authentication and authorization, built with TypeScript, featuring JWT-based authentication, gRPC communication, and comprehensive security features.

## 🚀 Features

- TypeScript support
- Swagger UI for API documentation
- Environment configuration via `.env` files
- Winston logging with pretty console output
- GraphQL API support
- MongoDB (Mongoose ORM)
- Redis for caching
- Kafka for event streaming
- gRPC-based microservice communication
- JWT-based authentication
- Docker containerization
- PM2 for production process management
- Helmet for securing HTTP headers
- Passport.js for flexible authentication strategies
- Cache Manager integration
- ESLint + Prettier + Husky pre-commit hooks

## 📋 Prerequisites

- Node.js `> 22.x`
- npm `> 10.x`
- Redis `> 5.x`
- Kafka `> 3.x`
- MongoDB `> 8.x`

## 🛠️ Installation

1. Clone the repository:

   ```bash
   git clone {REPO_URL} -b development
   cd nmas-auth-service
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in the required environment variables in `.env`:
   | Variable | Description | Default | Notes |
   | ---------------------------- | -------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
   | `NODE_ENV` | Environment mode | `development` | Set to `local`, `development`, or `production` based on environment |
   | `PORT` | Server port | `3001` | Port on which the server will run |
   | `HTTP` | HTTP protocol | `http` | Protocol used for server communication |
   | `BASE_URL` | Base URL for API | `http://localhost:3001` | Base URL for all API endpoints |
   | `ALLOWED_EMAILS` | Allowed email domains | - | Comma-separated list of allowed email domains |
   | `MONGO.SCHEME` | MongoDB connection scheme | `mongodb` | Connection protocol for MongoDB |
   | `MONGO.USERNAME` | MongoDB username | - | Required for authenticated MongoDB connection |
   | `MONGO.PASSWORD` | MongoDB password | - | Required for authenticated MongoDB connection |
   | `MONGO.DATABASE` | MongoDB database name | `auth_service` | Name of the MongoDB database to use |
   | `MONGO.HOST` | MongoDB host | `localhost` | MongoDB server host address |
   | `MONGO.PORT` | MongoDB port | `27017` | MongoDB server port |
   | `REDIS.HOST` | Redis host | `localhost` | Redis server host address |
   | `REDIS.PORT` | Redis port | `6379` | Redis server port |
   | `REDIS.CACHE_TTL` | Redis cache TTL | `3600` | Time-to-live for cached items in seconds |
   | `REDIS.MAX_ITEM_IN_CACHE` | Redis max items in cache | `1000` | Maximum number of items to store in cache |
   | `REDIS.DB` | Redis database number | `0` | Redis database index to use |
   | `KAFKA.BROKERS` | Kafka brokers | - | Comma-separated list of Kafka broker addresses |
   | `KAFKA.GROUP_ID` | Kafka consumer group ID | `auth-service-group` | Consumer group identifier for Kafka |
   | `KAFKA.CLIENT_ID` | Kafka client ID | `auth-service-client` | Client identifier for Kafka |
   | `KAFKA.SASL_USERNAME` | SASL username for authentication | - | Required for Kafka SASL authentication |
   | `KAFKA.SASL_PASSWORD` | SASL password for authentication | - | Required for Kafka SASL authentication |
   | `SALT_ROUND` | Password hashing salt rounds | `10` | Number of salt rounds for password hashing |
   | `SECRETS.MFA_TOKEN` | MFA token secret | - | Required for MFA token generation |
   | `SECRETS.AUTH_TOKEN` | Auth token secret | - | Required for JWT authentication token generation |
   | `SECRETS.REFRESH_TOKEN` | Refresh token secret | - | Required for refresh token generation |
   | `SECRETS.PASSWORD_TOKEN` | Password token secret | - | Required for password reset token generation |
   | `GRPC.AUTH_SERVICE` | Auth service gRPC endpoint | - | gRPC endpoint for auth service communication |
   | `GRPC.USER_SERVICE` | User service gRPC endpoint | - | gRPC endpoint for user service communication |
   | `GRPC.NOTIFICATION_SERVICE` | Notification service gRPC endpoint | - | gRPC endpoint for notification service communication |
   | `GRPC.SEARCH_SERVICE` | Search service gRPC endpoint | - | gRPC endpoint for search service communication |
   | `AUTH.USERNAME` | Authentication username | - | Required for service-to-service authentication |
   | `AUTH.PASSWORD` | Authentication password | - | Required for service-to-service authentication |
   | `OTP_BYPASS` | OTP bypass code for testing | - | Used only in development/testing environments |
   | `GOOGLE.CLIENT_ID` | Google OAuth Client ID | - | Required for Google login; obtained from Google Cloud Console |
   | `GOOGLE.CLIENT_SECRET` | Google OAuth Client Secret | - | Required for verifying tokens on backend |
   | `GOOGLE.REDIRECT_URI` | Google OAuth Redirect URI | - | Must match an authorized URI in Google Cloud Console |
   | `GCP.BUCKET_NAME`     | GCP Bucket name           | - | Required for uploading any file in gcp  
4. Set up Git hooks:

   ```bash
   npm run prepare
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Using PM2 (Production)

```bash
npm run pm2:start
```

## 📝 Available Scripts

| Command        | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| `start`        | Start the app                                               |
| `start:dev`    | Start in development mode (watch mode)                      |
| `start:prod`   | Start in production using compiled output                   |
| `pm2:start`    | Start using PM2 with the startup script                     |
| `build`        | Compile TypeScript code                                     |
| `prebuild`     | Clean `dist` folder before building                         |
| `format`       | Format source files using Prettier                          |
| `lint`         | Lint and auto-fix code                                      |
| `docker:build` | Build Docker image                                          |
| `prepare`      | Set up Husky Git hook                                       |
| `pre-commit`   | Type-check, lint, format check, and build before committing |

## 🔧 Code Quality Tools

### ESLint Configuration

The project uses ESLint with TypeScript support. Key configurations:

- TypeScript-specific rules
- Prettier integration
- Modern JavaScript features support

### Prettier Configuration

Code formatting is handled by Prettier with:

- Consistent code style
- Integration with ESLint
- Automatic formatting on save (if configured in your editor)

### Git Hooks

Husky is configured to run the following checks before each commit:

1. TypeScript type checking
2. Linting
3. Prettier formatting
4. Build verification

## 🏗️ Project Structure

```
nmas-auth-service/
├── src/                    # Source code
│   ├── app/                # Application modules
│   │   ├── api/            # API endpoints
│   │   ├── grpc/           # gRPC service definitions
│   │   └── shared/         # Shared utilities and services
│   ├── config/             # Configuration files
│   ├── proto/              # Protocol buffer definitions
│   └── main.ts             # Application entry point
├── secrets/                # JWT keys and certificates
│   ├── jwt-private.pem     # JWT private key
│   └── jwt-public.pem      # JWT public key
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration
├── nest-cli.json           # NestJS CLI configuration
├── ecosystem.config.js     # PM2 configuration
└── Dockerfile              # Docker configuration
```

## 🔐 Secrets Management

The `secrets` folder contains sensitive keys and certificates used for authentication and secure communication.

```sh
secrets/
├── .gitkeep
├── jwt-private.pem
└── jwt-public.pem
```

## 🐳 Docker

To build the Docker image:

```bash
npm run docker:build
```

## 📚 API Documentation

- REST API Path - `Base_url/api`
- GraphQL API Path - `
