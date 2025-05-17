# Chat CSV - Data Analytics Chat Interface

A local-only, chat-based data analytics web application that allows users to upload CSV files and interact with their data using natural language. Built with Next.js, SQLite, Redis, and local LLM integration.

## Features

- CSV file upload and management
- Natural language chat interface for data analysis
- Interactive data visualizations
- Local LLM integration (Ollama)
- Redis caching for performance
- SQLite database for persistent storage
- Modern, responsive UI with dark mode support

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Ollama (for local LLM)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chat-csv-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start Ollama and pull the model:
   ```bash
   ollama pull llama2
   ```

5. Start the development environment:
   ```bash
   docker-compose up -d
   ```

6. Initialize the database:
   ```bash
   npx prisma db push
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000.

## Development

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility functions and services
- `prisma/` - Database schema and migrations

## API Routes

- `POST /api/upload` - Upload CSV files
- `POST /api/chat` - Send chat messages
- `GET /api/chat/messages` - Get chat history
- `GET /api/visualization` - Get visualization data

## Environment Variables

- `DATABASE_URL` - SQLite database URL
- `REDIS_URL` - Redis connection URL
- `NEXTAUTH_URL` - NextAuth.js URL
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `OLLAMA_API_URL` - Ollama API URL
- `OLLAMA_MODEL` - Ollama model name

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT # chat-csv
