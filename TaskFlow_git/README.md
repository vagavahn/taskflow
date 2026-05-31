# TaskFlow

A full stack task management web application built with 
HTML, Bootstrap 5, jQuery, AWS Lambda, API Gateway, 
and MySQL on Railway.

**Live Demo:** https://vagavahn.github.io/taskflow

## Demo Accounts
| Account | Username | Password | Access |
|---------|----------|----------|--------|
| Regular User | demo | demo123 | Personal task board |
| Admin User | demoadmin | demoadmin123 | Full admin report |

## Features
- **Personal Task Board** — create, edit, and delete tasks 
  with priority, status, and due date tracking
- **Inline Controls** — update task priority and status 
  directly from the task board without page refresh
- **Task Search** — real time filtering as you type
- **Task Overview Chart** — visual breakdown of tasks 
  by priority using Chart.js
- **Completed Tasks** — completed task history with 
  priority badges
- **Teams** — create teams, add members by username, 
  assign tasks to team members
- **Admin Report** — full cross-user task report 
  for admin accounts
- **Demo Accounts** — one click demo login for 
  regular and admin users

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Bootstrap 5.3, jQuery 3.7, Chart.js |
| Backend | AWS Lambda (Node.js ESM) |
| API | AWS API Gateway |
| Database | MySQL on Railway |
| Hosting | GitHub Pages |

## Architecture

```
Browser (GitHub Pages)
↓ jQuery AJAX
AWS API Gateway
↓
AWS Lambda (index.mjs)
↓
MySQL (Railway)
```

## Project Structure

```
taskflow/
├── index.html      # Single page application
├── css/
│   └── app.css     # Custom styles
└── js/
    └── app.js      # All controllers and handlers
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /login | Authenticate user |
| DELETE | /login | Logout |
| GET | /tasks | Get user tasks |
| POST | /task | Create task |
| PUT | /task | Update task |
| DELETE | /task | Delete task |
| PUT | /updatestatus | Update task status |
| PUT | /updatepriority | Update task priority |
| GET | /completedtasks | Get completed tasks |
| POST | /signup | Create account |
| PUT | /editprofile | Update profile |
| PUT | /changepassword | Change password |
| GET | /adminreport | Admin task report |
| POST | /team | Create team |
| GET | /teams | Get user teams |
| POST | /teammember | Add team member |
| DELETE | /teammember | Remove team member |
| GET | /teammembers | Get team members |
| GET | /teamtasks | Get team tasks |
| POST | /teamtask | Create team task |
| PUT | /teamtask | Update team task |
| DELETE | /teamtask | Delete team task |

---
Built by Evangelos Karabassis
