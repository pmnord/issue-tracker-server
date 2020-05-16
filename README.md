## Todo Together

A collaborative kanban board supporting user concurrency, implemented with React on the front end and Node.js on the back end.

[Demo](https://we-do.pmnord.now.sh/)

[Frontend Documentation](https://github.com/pmnord/todo-management-react-capstone-client)

| | | | | |
|-|-|-|-|-|
|**Front-End**|React|ES10|CSS3||
|**Back-End**|Node.js|Express|PostgreSQL|RESTful API|
|**Development**|Jest|Mocha|Chai|Heroku|Zeit|
| | | | | |

## Endpoints

### Project Endpoints

#### POST /api/project/
Generates a new Project with a UUID which is returned to the client.

#### GET /api/project/:uuid
Returns a project object, complete with categories and tasks subarrays. The project object can then be loaded into the client application state without requiring any further API calls.

### Category Endpoints

### Task Endpoints

### Tag Endpoints

## Entity Relationships (PostgreSQL tables)

![Entity Relationship Diagram](./resources/wedo_erd.png)

## Development Roadmap

[See Frontend Documentation](https://github.com/pmnord/todo-management-react-capstone-client#user-content-developer-roadmap)