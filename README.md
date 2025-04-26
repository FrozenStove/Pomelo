# Pomelo - TypeScript Express + React Application

This is a containerized application with a TypeScript Express backend and React frontend.

## Project Structure

```
.
├── backend/           # Express TypeScript backend
├── frontend/          # React TypeScript frontend
├── docker-compose.yml # Docker compose configuration
└── package.json      # Root package.json
```

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Start the application:
   ```bash
   npm run dev
   ```

This will start both the frontend and backend containers. The application will be available at:

- Frontend: http://localhost:80
- Backend API: http://localhost:3000

## Development

- Backend API endpoints:

  - GET /api/health - Health check endpoint
  - GET /api/hello - Example endpoint

- Frontend development:
  - The frontend is served by Nginx in production
  - For local development, you can run `npm start` in the frontend directory

## Building for Production

To build the production version:

```bash
npm run build
```

## License

ISC
