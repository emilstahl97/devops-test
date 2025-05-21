# Task 4: Retrieving the Secret Value

This document outlines the steps taken to complete Task 4, which involved retrieving a secret value from the database after creating a specific todo item.

## 1. Understanding the Task

Task 4 required creating a todo item titled "Customer First" and then finding a secret value associated with this item in the database.

## 2. Identifying the Database Service

To access the database, we first needed to identify the Kubernetes service for the database.

**Command:**
```sh
kubectl get services
```

**Output:**
```
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
backend      NodePort    10.96.169.202   <none>        3000:30090/TCP   45m
dashboard    ClusterIP   10.96.103.117   <none>        8080/TCP         34m
db           ClusterIP   10.96.26.102    <none>        3306/TCP         45m
frontend     NodePort    10.96.60.97     <none>        80:30080/TCP     45m
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP          54m
```
This showed the database service is named `db` on `ClusterIP 10.96.26.102` and port `3306`.

## 3. Identifying the Database Pod

Next, we needed to find the specific pod running the database.

**Command:**
```sh
kubectl get pods -l app=db
```

**Output:**
```
NAME                  READY   STATUS    RESTARTS   AGE
db-567fd98786-7v77b   1/1     Running   0          45m
```
The database pod was identified as `db-567fd98786-7v77b`.

## 4. Attempting Database Connection (Initial Failures)

Several attempts were made to connect to the database instance within the pod.

**Attempt 1 (mysql, no password):**
```sh
kubectl exec -it db-567fd98786-7v77b -- mysql -u root -e 'SELECT * FROM todos.todos WHERE title="Customer First"' | cat
```

**Output:**
```
error: Internal error occurred: Internal error occurred: error executing command in container: failed to exec
 in container: failed to start exec "b0326f8f15aa11f31a462973faa6d29cfc3f5794fd3d0af454ccb9324f8763ff": OCI r
untime exec failed: exec failed: unable to start container process: exec: "mysql": executable file not found
in $PATH
```
This failed because the `mysql` executable was not found.

**Attempt 2 (mariadb, no password):**
```sh
kubectl exec -it db-567fd98786-7v77b -- mariadb -u root -e 'SELECT * FROM todos.todos WHERE title="Customer First"' | cat
```

**Output:**
```
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
command terminated with exit code 1
```
This failed due to access denial, indicating a password was likely required. The table name `todos.todos` was also a guess at this stage.

**Attempt 3 (mariadb, password "root"):**
```sh
kubectl exec -it db-567fd98786-7v77b -- mariadb -u root -proot -e 'SELECT * FROM todos.todos WHERE title="Customer First"' | cat
```

**Output:**
```
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
command terminated with exit code 1
```
Still access denied, suggesting "root" was not the correct password.

## 5. Discovering Database Credentials

Since direct connection attempts failed, the next step was to find the correct credentials by searching the codebase, specifically the Kubernetes deployment files from Task 2.

**Tool Used:** Codebase Search (Semantic Search)
**Query:** "database credentials"
**Target Directory:** `task-02/`

**Relevant Result Snippet (from `task-02/kubernetes/depl-db.yml`):**
```yaml
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: password
        - name: MYSQL_DATABASE
          value: tododb
```
This revealed the root password was `password` and the database name was `tododb`. The backend code (`task-02/backend/server.js`) confirmed the table was named `todos`.

## 6. Successful Database Connection and Secret Retrieval

With the correct credentials and database/table names, the database was queried again.

**Command:**
```sh
kubectl exec -it db-567fd98786-7v77b -- mariadb -u root -ppassword -e 'SELECT * FROM tododb.todos WHERE task="Customer First"' | cat
```

**Output:**
```
+----+----------------+-----------+------------------------------------------------------------------+---------------------+
| id | task           | completed | dobedoo                                                          | created_at          |
+----+----------------+-----------+------------------------------------------------------------------+---------------------+
|  4 | Customer First |         0 | fb2f4484d432c17ce2f385db75c0a05a819a0db2cf54474d167139d4a2eda538 | 2025-05-21 12:56:36 |
+----+----------------+-----------+------------------------------------------------------------------+---------------------+
```
This was successful. The secret value `fb2f4484d432c17ce2f385db75c0a05a819a0db2cf54474d167139d4a2eda538` was found in an unexpected column named `dobedoo`.

## 7. Recording the Secret Value

Finally, the retrieved secret value was added to the `task-04/README.md` file as per the task instructions.

**File Edited:** `task-04/README.md`

**Change:**
```diff
  ## Secret Value
  
- Secret value:
+ Secret value: fb2f4484d432c17ce2f385db75c0a05a819a0db2cf54474d167139d4a2eda538
```

This completed Task 4. 