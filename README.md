# WorkspaceGuard

## Role-Based Team Workspace & Permissions Manager

WorkspaceGuard is an administrative security portal for managing workspace members, security roles, granular permissions, and audit activity.

## Features

### Authentication & Route Protection

- Supabase Authentication for login and registration.
- Protected administrative routes.
- Workspace-based access control.
- Role-based restrictions for administrative actions.

### Team Member Management

- View workspace members and their active security roles.
- Display member name and email.
- Change member roles.
- Configure granular permissions:
  - Can Edit
  - Can Delete
  - Can Invite
- Remove workspace members.
- Workspace membership is stored in Supabase PostgreSQL.

### Search & Filtering

- Search members by name or email.
- Filter members by security role.
- Supported roles:
  - Owner
  - Admin
  - Editor
  - Viewer
  - Member

### Security Compliance

WorkspaceGuard tracks the configured roles rate:

**Configured Roles Rate = Members with Custom Roles / Total Team Members**

The compliance value updates when member role information changes.

### Audit Log

Important workspace security activities are recorded in the audit log.

Tracked activities include:

- Role changes
- Permission changes
- Member removal

Each audit record stores:

- Workspace
- User who performed the action
- Action
- Entity type
- Entity ID
- Additional details
- Timestamp

The Audit Log page displays authorized workspace activity.

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Authentication
- Supabase PostgreSQL
- PostgreSQL Row Level Security (RLS)
- React Hooks
- React Context API

## Database

The application uses the following main Supabase tables:

### profiles

Stores user profile information including email and full name.

### workspaces

Stores workspace information and workspace ownership.

### workspace_members

Stores workspace membership, roles, and granular permissions.

Important fields include:

- workspace_id
- user_id
- role
- can_edit
- can_delete
- can_invite
- created_at

### audit_logs

Stores workspace security and administrative activity.

Important fields include:

- workspace_id
- user_id
- action
- entity_type
- entity_id
- details
- created_at

## Role Model

| Role   | Description                                 |
| ------ | ------------------------------------------- |
| Owner  | Workspace owner with administrative control |
| Admin  | Administrative team management              |
| Editor | Member with editing capabilities            |
| Viewer | Read-only access                            |
| Member | Standard workspace membership               |

Granular permissions are additionally stored for workspace members.

## Security

Supabase Row Level Security is used to enforce workspace-level access.

Security controls include:

- Authentication
- Workspace membership
- Role-based permissions
- Workspace-scoped data access
- Audit log access control

## Audit Logging Flow

User performs a member action  
↓  
Workspace member record is updated  
↓  
Audit record is created  
↓  
Audit record is stored in `audit_logs`  
↓  
Audit Log page retrieves the record  
↓  
Activity is displayed to authorized users

## Project Architecture

The application uses React components, custom hooks, and React Context for workspace state management.

Main project areas include:

- components
- context
- hooks
- lib
- pages

Workspace member management is implemented using a custom React hook.

## Local Setup

### Requirements

- Node.js
- npm
- Git
- Supabase project

### Installation

Clone the repository:

git clone https://github.com/patelkrushna2624-bit/workspaceguard.git

Install dependencies:

npm install

Create the required Supabase environment variables in your local environment.

Run the development server:

npm run dev

Build the application:

npm run build

## Deployment

The application is deployed using Vercel.

### GitHub Repository

https://github.com/patelkrushna2624-bit/workspaceguard

### Live Application

https://workspaceguard.vercel.app

## Submission

### GitHub Repository

https://github.com/patelkrushna2624-bit/workspaceguard

### Live Deployment

https://workspaceguard.vercel.app

## Project Summary

WorkspaceGuard demonstrates a secure team workspace management system with authentication, role-based access control, granular permissions, PostgreSQL Row Level Security, team member management, and audit logging.

The project provides workspace administrators with a centralized interface for managing team security and reviewing important workspace activity.
