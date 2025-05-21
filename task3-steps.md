# Task 3 Troubleshooting Steps

## 1. Initial Deployment Failure

After building and pushing the images, the initial attempt to deploy the application using `kubectl apply -f .` in the `task-03/kubernetes` directory failed.

**Command:**
```sh
cd task-03/kubernetes && kubectl apply -f .
```

**Output:**
```
deployment.apps/backend configured
deployment.apps/dashboard created
service/dashboard created
deployment.apps/db unchanged
service/frontend unchanged
service/backend unchanged
service/db configured
The request is invalid: patch: Invalid value: "map[metadata:map[annotations:map[kubectl.kubernetes.io/last-ap\\
plied-configuration:{\\"apiVersion\\":\\"apps/v1\\",\\"kind\\":\\"Deployment\\",\\"metadata\\":{\\"annotations\\":{},\\"la\\
bels\\":{\\"app\\":\\"frontend\\\"},\\\"name\\":\\"frontend\\\",\\"namespace\\":\\"default\\\"},\\\"spec\\\":{\\"replica\\":1,\\\"sele\\
ctor\\":{\\"matchLabels\\\":{\\"app\\":\\"frontend\\\"}},\\\"template\\\":{\\"metadata\\\":{\\"labels\\\":{\\"app\\":\\"frontend\\\"}\\
},\\\"spec\\\":{\\"containers\\\":[{\\"image\\":\\"localhost:5001/todo-frontend:latest\\\",\\\"name\\":\\"frontend\\\",\\\"ports\\\
\":[{\\"containerPort\\\":80}]}]}}}}\\n]] spec:map[replica:1 replicas:<nil>]]": strict decoding error: unknown fie\\
ld "spec.replica"
```

**Diagnosis:** The error message `unknown field "spec.replica"` indicated a typo in one of the deployment YAML files.

**Fix:** Inspected `task-03/kubernetes/depl-app.yml` and found `spec.replica: 1` for the frontend deployment. Corrected it to `spec.replicas: 1`.

**File Change (`task-03/kubernetes/depl-app.yml`):**
```diff
  name: frontend
spec:
-   replica: 1
+   replicas: 1
  selector:
```

**Verification:** Applied the manifests again.
```sh
kubectl apply -f .
```
**Output:**
```
deployment.apps/backend unchanged
deployment.apps/frontend unchanged
deployment.apps/dashboard unchanged
service/dashboard unchanged
deployment.apps/db unchanged
service/frontend unchanged
service/backend unchanged
service/db unchanged
```
This time the apply was successful. 

## 2. Dashboard Pod `ImagePullBackOff`

Checked pod status after successful manifest application.

**Command:**
```sh
kubectl get pods
```

**Output:**
```
NAME                        READY   STATUS             RESTARTS   AGE
backend-74fcdf44d6-csqnh    1/1     Running            0          47s
dashboard-84c5695cb-p8d8s   0/1     ImagePullBackOff   0          47s
db-567fd98786-7v77b         1/1     Running            0          11m
frontend-767b9f5dc4-v6jz6   1/1     Running            0          11m
```

**Diagnosis:** The `dashboard` pod was in `ImagePullBackOff` state. Described the pod to get more details.

**Command:**
```sh
kubectl describe pod dashboard-84c5695cb-p8d8s
```

**Relevant Output (Events):**
```
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  68s                default-scheduler  Successfully assigned default/dashboard-84c5695cb-p8d8s to kind-control-plane
  Normal   Pulling    28s (x3 over 67s)  kubelet            Pulling image "localhost:5001/todo-dashboard:latest"
  Warning  Failed     28s (x3 over 67s)  kubelet            Failed to pull image "localhost:5001/todo-dashboard:latest": rpc error: code = NotFound desc = failed to pull and unpack image "localhost:5001/todo-dashboard:latest": failed to resolve reference "localhost:5001/todo-dashboard:latest": localhost:5001/todo-dashboard:latest: not found
  Warning  Failed     28s (x3 over 67s)  kubelet            Error: ErrImagePull
  Normal   BackOff    2s (x4 over 67s)   kubelet            Back-off pulling image "localhost:5001/todo-dashboard:latest"
  Warning  Failed     2s (x4 over 67s)   kubelet            Error: ImagePullBackOff
```
The error `localhost:5001/todo-dashboard:latest: not found` showed that the image tag was incorrect. The images were built with the tag `task03`, not `latest`.

**Fix:** 
1. Updated the image tag in `task-03/kubernetes/depl-dashboard.yml` from `localhost:5001/todo-dashboard:latest` to `localhost:5001/todo-dashboard:task03`.
2. Updated image tags in `task-03/kubernetes/depl-app.yml` for `todo-frontend` and `todo-backend` from `:latest` to `:task03` for consistency and to prevent future issues if `latest` was used there too.

**File Change (`task-03/kubernetes/depl-dashboard.yml`):**
```diff
    spec:
      containers:
-       - image: localhost:5001/todo-dashboard:latest
+       - image: localhost:5001/todo-dashboard:task03
        name: dashboard
```

**File Change (`task-03/kubernetes/depl-app.yml`):**
```diff
    spec:
      containers:
-       - image: localhost:5001/todo-backend:latest
+       - image: localhost:5001/todo-backend:task03
        name: backend
...
    spec:
      containers:
-       - image: localhost:5001/todo-frontend:latest
+       - image: localhost:5001/todo-frontend:task03
        name: frontend
```

**Verification:** Applied the manifests again and checked pod status.
```sh
kubectl apply -f .
kubectl get pods
```
**Output (`kubectl get pods`):**
```
NAME                         READY   STATUS    RESTARTS   AGE
backend-fb44dbcdc-ldnh2      1/1     Running   0          5s
dashboard-764c78d4d9-4h5r8   1/1     Running   0          5s
db-567fd98786-7v77b          1/1     Running   0          12m
frontend-5745dc758c-r56tq    1/1     Running   0          5s
```
All pods were now running. 

## 3. Dashboard Error: "Failed to fetch statistics"

Accessed the dashboard via `curl http://localhost:30080/dashboard`.

**Output (snippet):**
```html
    <div class="error-container">
        <h1>Error</h1>
        <div class="error-message">
            Failed to fetch statistics
        </div>
        <div class="error-details">
            <strong>Details:</strong><br>
            Request failed with status code 500
        </div>
        <a href="/" class="back-button">Back to Todo List</a>
    </div>
```

**Diagnosis:** A 500 error on the dashboard suggested a backend problem. Checked backend logs.

**Command (to get latest backend pod name and logs):**
```sh
kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}' | xargs kubectl logs
```

**Relevant Output (Backend Logs):**
```
Error initializing database: SqlError: (conn:-1, no: 45028, SQLState: HY000) pool timeout: failed to retrieve a connection from pool after 10000ms
    (pool connections: active=0 idle=0 limit=5)
...
[cause]: SqlError: (conn:-1, no: 45012, SQLState: 08S01) Connection timeout: failed to create socket after 1001ms
```
This indicated the backend couldn't connect to the database (`db`).

### 3a. Database Password Typo

Inspected `task-03/kubernetes/depl-app.yml` for backend environment variables.

**Relevant Snippet:**
```yaml
        env:
        - name: DB_HOST
          value: db
        - name: DB_USER
          value: root
        - name: DB_PASSWORD
          value: passwond # <--- TYPO!
        - name: DB_NAME
          value: tododb
```
**Fix:** Corrected `passwond` to `password`.

**File Change (`task-03/kubernetes/depl-app.yml`):**
```diff
          - name: DB_PASSWORD
-           value: passwond
+           value: password
          - name: DB_NAME
```

**Verification:** Applied the change and restarted the backend.
```sh
kubectl apply -f depl-app.yml && kubectl rollout restart deployment backend
sleep 5 # allow time for restart
kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}' | xargs kubectl logs
```
**Result:** The same "pool timeout" error persisted, indicating another issue.

### 3b. Database Service Port Mismatch

Checked the `db` service details.
**Command:**
```sh
kubectl get svc db
```
**Output:**
```
NAME   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
db     ClusterIP   10.96.26.102   <none>        3308/TCP   13m
```
The `db` service was exposing port `3308`. MariaDB (used by the `db` pod) defaults to `3306`. The backend application (`task-03/backend/server.js`) was configured to connect to `process.env.DB_HOST` without specifying a port, thus defaulting to `3306`.

**Fix:** Changed the `db` service port in `task-03/kubernetes/services.yml` from `3308` to `3306` to match the default MariaDB port and the backend's expectation.

**File Change (`task-03/kubernetes/services.yml`):**
```diff
  ports:
-  - port: 3308
+  - port: 3306
    targetPort: 3306
```

**Verification:** Applied the service change and restarted the backend.
```sh
kubectl apply -f services.yml && kubectl rollout restart deployment backend
sleep 5
kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}' | xargs kubectl logs
```
**Relevant Output (Backend Logs):**
```
Server running on port 3000
Connected to MariaDB
Todos table created or already exists
```
The backend now successfully connected to the database. 

## 4. Dashboard Still Errored, Backend Log Shows "Table 'tododb.to_dos' doesn't exist"

Although the DB connection was fixed, accessing `http://localhost:30080/dashboard` still showed an error page (though different from before, now it rendered some HTML but with a data fetching error).

Checked backend logs again.
**Command:**
```sh
kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}' | xargs kubectl logs
```

**Relevant Output (Backend Logs):**
```
[2025-05-21T12:32:07.015Z] GET /api/stats?date_filter=2025-05-21
Error fetching statistics: SqlError: Table 'tododb.to_dos' doesn't exist
sql: 
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total_tasks,
        SUM(completed = 1) as completed_tasks,
        AVG(LENGTH(task)) as avg_task_length
      FROM to_dos
     WHERE DATE(created_at) = '2025-05-21' - parameters:[]
...
  code: 'ER_NO_SUCH_TABLE'
```

**Diagnosis:** The backend was trying to query a table named `to_dos`, but the table initialization code in `task-03/backend/server.js` creates a table named `todos`.

**Relevant Snippet from `initializeDatabase()` in `server.js`:**
```javascript
        const createTableQuery = `
          CREATE OR REPLACE TABLE todos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task VARCHAR(255) NOT NULL,
            // ... other columns
          )
        `;
```
**Relevant Snippet from `/api/stats` route in `server.js`:**
```javascript
        const statsQuery = `
      SELECT
        // ... columns
      FROM to_dos // <--- MISMATCHED TABLE NAME
    `;
```

**Fix:** Corrected the table name in the statistics query in `task-03/backend/server.js` from `to_dos` to `todos`.

**File Change (`task-03/backend/server.js`):**
```diff
        AVG(LENGTH(task)) as avg_task_length
-      FROM to_dos
+      FROM todos
    `;
```

**Verification:** 
1. Rebuilt and pushed the backend Docker image:
   ```sh
   cd task-03/backend && docker build -t localhost:5001/todo-backend:task03 . && docker push localhost:5001/todo-backend:task03
   ```
2. Returned to `task-03/kubernetes` and restarted the backend deployment:
   ```sh
   cd ../kubernetes && kubectl rollout restart deployment backend
   ```
3. Waited a few seconds and checked backend logs and dashboard access:
   ```sh
   sleep 5
   kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}' | xargs kubectl logs
   curl http://localhost:30080/dashboard
   ```
**Relevant Output (Backend Logs):**
```
Server running on port 3000
Connected to MariaDB
Todos table created or already exists
```
**Relevant Output (`curl http://localhost:30080/dashboard`):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo Stats Dashboard</title>
    <!-- ... styles ... -->
</head>
<body>
    <div class="container">
        <h1>Todo Statistics Dashboard</h1>
        <!-- ... date filter ... -->
        <div class="stats-grid">
            <div class="stat-card">
                <p>Total Tasks</p>
                <h2>0</h2> <!-- Or 1 if a task was created -->
            </div>
            <!-- ... other stats cards ... -->
        </div>
    </div>
    <!-- ... script ... -->
</body>
</html>
```
The dashboard now loaded correctly and displayed statistics (initially 0, then updated after creating a todo).

## 5. Final Application Verification

Created a test todo item and verified it appeared in the list and on the dashboard.

**Create Todo:**
```sh
kubectl run curl-test --image=curlimages/curl -i --tty --rm --restart=Never -- curl -X POST -H "Content-Type: application/json" -d '{"task":"Test Todo"}' http://backend:3000/api/todos
```
**Output:**
```
{"id":1,"task":"Test Todo","completed":false}pod "curl-test" deleted
```

**Get Todos:**
```sh
kubectl run curl-test --image=curlimages/curl -i --tty --rm --restart=Never -- curl http://backend:3000/api/todos
```
**Output:**
```
[{"id":1,"task":"Test Todo","completed":0,"dobedoo":"32a5d944204305780f68452d12c7740419e113eca5be206d1654c4d8237cc7f7","created_at":"2025-05-21T12:34:04.000Z"}]pod "curl-test" deleted
```

**Check Dashboard:**
```sh
curl http://localhost:30080/dashboard
```
**Relevant Output (Dashboard HTML):**
```html
                <div class="stat-card">
                    <p>Total Tasks</p>
                    <h2>1</h2>
                </div>
```
All components were functioning as expected. 