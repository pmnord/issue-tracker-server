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

### Category Endpoints

### Task Endpoints

### Tag Endpoints

## Entity Relationships (PostgreSQL tables)

|Users|Projects|Categories|Tasks|Project_Users|
|-|-|-|-|-|
|id|id|id|id|id|
|username|name|name|title|project_id|
|password|user_id|project_id|category_id|user_id|
|project_id|||assigned_user||
||||due_date||
||||note||
||||priority||

## Development Roadmap

[See Frontend Documentation](https://github.com/pmnord/todo-management-react-capstone-client#user-content-developer-roadmap)