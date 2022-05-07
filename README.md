# Time Logger
A time logging web application built in the MERN stack.

## MVP Requirements
- An application with a REST API and a web front-end.
- User can create a task and give it a name
- User can start and stop the task
- Display the total duration to the user during and at the end of the task
- Display the total duration across tasks to the user

## API Endpoints
- `/api`
  - `/tasks`
    - `GET`     returns list of tasks (with start and stop times and work duration), applies queries (e.g., todo, done)
    - `POST`    creates a new task with a name (can't edit anything else)
    - `PUT`     not allowed
    - `DELETE`  delete all tasks
  - `/tasks/:taskId`
    - `GET`     returns the task (with start and stop times and work duration)
    - `POST`    not allowed
    - `PUT`     change a task's name, start or stop a task (can't edit anything else)
    - `DELETE`  deletes the task
  - `/stats`
    - `GET`     returns user statistics: no. of tasks (todo, doing, done) and total work start and stop times and duration