# Todo Application - Kubernetes Deployment Assessment

A containerized todo application designed to assess Kubernetes deployment capabilities. The application consists of a frontend, backend, and MariaDB database components that need to be properly orchestrated in a Kubernetes environment.

## Project Structure

- `frontend/`: Single-page application built with HTML, CSS, and JavaScript
- `backend/`: Node.js Express API with MariaDB connectivity
- `kubernetes/`: Kubernetes manifests for deployment configuration

## Technical Stack

### Application Components

- Frontend: Static web application
- Backend: Node.js/Express with native MariaDB driver
- Database: MariaDB instance

### Infrastructure Requirements

- Docker: Required for local image building
- Kubernetes: For deployment and orchestration
- A local [OCI](https://opencontainers.org) container registry running on localhost:5001

## Objectives

1. Build the application container images (see Build and Push Instructions below)

2. Stand up the application in your Kubernetes cluster

3. Check that the application has been fully deployt to the Kubernetes cluster

4. Once done, you should be able to surf to the frontend application on http://localhost:30080 show a page like this one:

   <!-- TODO screenshot here -->

## Build and Push Instructions

### Frontend Build

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Build and tag the Docker image:

   ```bash
   docker build -t localhost:5001/todo-frontend:latest .
   ```

3. Push the image to local registry:
   ```bash
   docker push localhost:5001/todo-frontend:latest
   ```

### Backend Build

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Build and tag the Docker image:

   ```bash
   docker build -t localhost:5001/todo-backend:latest .
   ```

3. Push the image to local registry:
   ```bash
   docker push localhost:5001/todo-backend:latest
   ```

## Environment Configuration

### Backend Environment Variables

- `DB_HOST`: MariaDB host
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `PORT`: Backend service port

## API Endpoints

- `GET /api/todos`: Retrieve all todos
- `POST /api/todos`: Create a new todo
- `PUT /api/todos/:id`: Update todo completion status
- `DELETE /api/todos/:id`: Remove a todo

## What this task is meant to assess

This technical assessment evaluates the candidate's ability to:

1. Build and containerize multi-component applications
2. Configure and manage Kubernetes resources appropriately
3. Implement proper service communication within a Kubernetes cluster
4. Ensure application availability and proper configuration
