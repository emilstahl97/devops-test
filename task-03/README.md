# Todo Application - Kubernetes Troubleshooting Assessment

A containerized todo application that has been deployed to Kubernetes but is experiencing several operational issues. This assessment evaluates a candidate's ability to diagnose and fix DevOps-related problems in a microservices environment.

## Project Structure

- `frontend/`: Single-page application built with HTML, CSS, and JavaScript
- `backend/`: Node.js Express API with MariaDB connectivity
- `dashboard/`: Statistics dashboard for todo analytics
- `kubernetes/`: Kubernetes manifests for deployment configuration

## Technical Stack

### Application Components

- Frontend: Static web application served by NGINX
- Backend: Node.js/Express with native MariaDB driver
- Dashboard: Node.js/Express statistics visualization app
- Database: MariaDB instance

### Infrastructure Requirements

- `task-01` and `task-02` should be completed to begin this task

## Your Task: Troubleshoot the Deployment

The application should be deployed to Kubernetes but note well that it will not be functioning as expected once you have done this. You need to identify and resolve the issues to get the application running properly.

When the application is working correctly, you should be able to:
- Access the frontend through http://localhost:30080
- Access the dashboard through http://localhost:30080/dashboard
- Create, read, update, and delete todo items
- View statistics about your todos on the dashboard (see images folder for screenshots)
- Navigate between the frontend and dashboard interfaces
- See proper styling on all components (see images folder for screenshots)

## Build and Push Instructions

If you need to rebuild the images after making changes:

### Frontend Build

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Based on your experience from the previous task, figure out how to build and push the frontend image, then do that.

### Backend Build

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Based on your experience from the previous task, figure out how to build and push the backend image, then do that.

### Dashboard Build

1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```

2. Build it in the same way you did the other two images

## Deployment

To deploy the application to Kubernetes follow the same procedure as you did in `task-02`.

## API Endpoints

### Todo API

- `GET /api/todos`: Retrieve all todos
- `POST /api/todos`: Create a new todo
- `PUT /api/todos/:id`: Update todo completion status
- `DELETE /api/todos/:id`: Remove a todo

### Statistics API

- `GET /api/stats`: Retrieve statistics about todos
  - Optional query parameter: `date_filter` to filter by specific date

## Tips for Troubleshooting

1. Check Kubernetes resource definitions
2. Verify service connections between components
3. Examine container logs for error messages
4. Review database connection parameters
5. Test API endpoints with curl or a similar tool
6. Inspect the NGINX configuration for the frontend

## Assessment Criteria

Your performance will be evaluated based on:

1. Problem identification skills
2. Kubernetes and container troubleshooting methodology
3. SQL error diagnosis and resolution
4. Documentation of issues found and solutions implemented
5. Time management and prioritization of critical issues

Good luck!
