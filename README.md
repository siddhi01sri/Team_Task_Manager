# Team Task Manager

Tech stack used  in this project - 

Backend Runtime     : Node.js
Framework           : Express.js
Language            : TypeScript
Database            : PostgreSQL
ORM                 : Prisma
Cache               : Redis
Authentication      : JWT
Password Security   : bcryptjs
Containerization    : Docker + Docker Compose
API Testing         : Postman

# Project Structure 
In this project I used monolith architecture, which is well suited for smaller projects. This approach makes it easy to maintain APIs and ensures a well organized structure.

# How to Run

Prerequisite:

Docker Desktop should be installed and running.

Steps:

git clone <repo-url>
cd TeamTaskManager
docker compose up --build

API will run on:

http://localhost:4000

Health check:

GET http://localhost:4000/api/v1/health

Expected response:

{
  "status": "success",
  "message": "API is running"
}

No manual Node.js, PostgreSQL, Redis, Prisma, or .env setup is needed.
Docker Compose provides all required environment variables as stated in the assigment.

# Postman Collection

A Postman collection is included in project file-

postman/TeamTaskManager.postman_collection.json

Import it in Postman and run requests in this order or you wish as stated in assigment-

1. Health Check
2. Register Admin
3. Login Admin
4. Create Manager
5. Create Member
6. Create Project
7. Create Task assigned to Member
8. List Tasks
9. Login Member
10. List Member Tasks
11. Update Task Status
12. Test Invalid Status Transition
13. Test Manager Cannot Manage Users

Protected APIs use:

Authorization: Bearer <accessToken>

The collection stores tokens and ids using Postman collection variables.

Roles
ADMIN
- Can manage users, projects, and tasks inside the organization

MANAGER
- Can manage projects and tasks
- Cannot manage users

MEMBER
- Can view only assigned tasks
- Can update status only for assigned tasks


# Design Decision

I stored organizationId directly on the Task table.

Reason: most task queries need organization-level filtering. Keeping organizationId on Task makes access control simpler and avoids accidentally exposing tasks across organizations.

# Redis Caching

Task list is cached per assignee.

Cache is cleared when:

task is created
task is updated
task is deleted
task is reassigned
task status changes

A short TTL is also used so stale cache does not stay for long.

## Diagrams

Erd diagram is in github readme you can check from there 