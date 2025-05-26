# SpotMonitoring Backend

SpotMonitoring is a parking lot monitoring and reservation system. This backend application is built using [Next.js](https://nextjs.org/) and [MySQL](https://www.mysql.com/). It provides APIs, user dashboards, and admin dashboards for managing parking spots, reservations, and QR code-based gate access.

---

## Production

**Production version** of this app is available on **https://parkingsystem-gl.vercel.app/**

## Technology Stack

SpotMonitoring Backend leverages a modern web development stack to deliver a robust, scalable, and secure parking management solution:

- **Next.js**: Provides a full-stack React framework for building server-rendered and statically generated web applications. Enables API routes, server-side rendering, and seamless integration with React components.
- **React**: Powers the frontend user interfaces, enabling dynamic, component-based dashboards for both users and administrators.
- **MySQL**: Serves as the primary relational database, storing user data, parking spot statuses, reservations, and visit logs.
- **Tailwind CSS**: Utilized for rapid UI development with utility-first CSS classes, ensuring a responsive and modern design across all dashboards.
- **Auth0**: Handles authentication and authorization, including role-based access control (RBAC) for users and admins. Auth0 secures API endpoints and manages user sessions.
- **Vercel**: The application is deployed on Vercel, providing fast, reliable, and scalable hosting with zero-config deployments and automatic CI/CD integration.

---

## Authentication & Authorization

- **Auth0 Integration**: The backend uses Auth0 for secure authentication, supporting social logins and email/password sign-ups.
- **Role-Based Access Control (RBAC)**: Admin and user roles are managed via Auth0, restricting access to sensitive endpoints and admin dashboards.
- **API Security**: All API endpoints are protected using JWT tokens issued by Auth0. Middleware ensures only authorized users can access protected resources.

---

## Deployment

- **Vercel Hosting**: The backend is continuously deployed to [Vercel](https://vercel.com/), ensuring high availability and seamless updates.
- **Environment Variables**: Sensitive configuration (database credentials, Auth0 secrets) is managed via environment variables, supporting secure deployments across environments.
- **CI/CD**: Vercel automatically builds and deploys the application on every push to the main branch, streamlining the development workflow.

---

## Styling

- **Tailwind CSS**: All UI components are styled using Tailwind CSS, allowing for rapid prototyping and consistent design language.
- **Responsive Design**: Dashboards and pages are fully responsive, providing a seamless experience on both desktop and mobile devices.

---


## Features

### User Features
- **Dashboard**: View available and occupied parking spots.
- **QR Code Access**: Generate QR codes for gate access.
- **Reservation Management**: Reserve parking spots and view active reservations.
- **Visit History**: View the latest parking spot usage logs.

### Admin Features
- **Admin Dashboard**: Manage parking spots, reservations, and users.
- **Spot Monitoring**: View real-time parking spot statuses.
- **User Management**: Manage user roles and permissions.

### API Endpoints
- **`/api/auth/[auth0]`**: Api self-managed by Auth0. Handles sign up and login.
- **`/api/auth/check-admin`**: Checks if the current user has admin privileges.
- **`/api/auth/token`**: Retrieves an authentication token.
- **`/api/qr/generate`**: Generates a QR code for gate access.
- **`/api/latest-visits`**: Retrieves recent parking spots usage logs.
- **`/api/latest-visits/spot/[spotId]`**: Retrieves recent parking spot usage log.
- **`/api/parking-spot`**: Retrieves current status of all parking spots.
- **`/api/parking-spot/[id]`**: Retrieves current status of selected parking spot.
- **`/api/users`**: Provides list of users with usernames and emails.
- **`/api/users/[id]`**: Provides info about selected user.
- **`/api/spot-info`**: Provides a summary of parking spot statuses.
- **`/api/reservations`**: Manages parking spot reservations.

---

## Project Structure

```
backend/
├── .gitignore
├── .gitlab-ci.yml
├── README.md
└── parking-system/
   ├── .env
   ├── .gitignore
   ├── README.md
   ├── eslint.config.mjs
   ├── lib/
   │   └── db.ts
   ├── next-env.d.ts
   ├── next.config.js
   ├── package.json
   ├── postcss.config.js
   ├── public/             # Static assets
   ├── src/
   │   ├── actions/        # Server-side actions
   │   ├── app/
   │   │   ├── api/        # API routes
   │   │   ├── components/ # Shared React components
   │   │   ├── dashboard/
   │   │   ├── globals.css
   │   │   ├── hooks/      # Custom React hooks
   │   │   ├── latest-visits/
   │   │   ├── layout.tsx
   │   │   ├── m/          # Mobile specific routes/layouts
   │   │   ├── map/
   │   │   ├── page.tsx
   │   │   ├── profile/
   │   │   ├── unauthorized/
   │   │   └── users/
   │   └── middleware.ts
   ├── tailwind.config.js
   └── tsconfig.json
```

---

## Setup

### Prerequisites
- Next.js (v14)
- MySQL database
- Auth0 account for authentication

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://gitlab.kosickaakademia.sk/spotmonitoring/backend.git
   cd backend/parking-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the `parking-system/` directory.
   - Add the following variables:
     ```
     DB_HOST=your-database-host
     DB_USER=your-database-username
     DB_PASS=your-database-password
     DB_NAME=your-database-name
     DB_PORT=your-database-port
     AUTH0_DOMAIN='your-auth0-domain'
     AUTH0_CLIENT_ID='your-auth0-client-id'
     AUTH0_CLIENT_SECRET='your-auth0-client-secret'
     AUTH0_SECRET='your-auth0-secret'
     AUTH0_BASE_URL='http://your-auth0-base-url:3000/'
     AUTH0_ISSUER_BASE_URL='https://your-auth0-issuer-burl.com'
     AUTH0_AUDIENCE='https://your-auth0-audience.com'
     NEXT_PUBLIC_ADMIN_ROLE_ID='your-auth0-admin-role-id'

     ```

4. **Set Up the Database**
   - Ensure your MySQL database is running.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

### User Dashboard
- Generate QR codes for gate access.
- View available and occupied parking spots.
- View visit history.

### Admin Dashboard
- Manage parking spots, reservations, and users.

## Key Integrations

- **QR Code Generation**: The backend provides endpoints for generating QR codes, enabling secure and contactless gate access for users.
- **Real-Time Monitoring**: Admin dashboards display real-time parking spot statuses, leveraging efficient database queries and API endpoints.
- **Mobile Support**: The project structure includes dedicated routes and layouts for mobile devices, ensuring usability on smartphones and tablets.

---


### API Endpoints
- **`/api/auth/[auth0]`**: Api self-managed by Auth0. Handles sign up and login.
- **`/api/auth/check-admin`**: Checks if the current user has admin privileges.
- **`/api/auth/token`**: Retrieves an authentication token.
- **`/api/qr/generate`**: Generates a QR code for gate access.
- **`/api/latest-visits`**: Retrieves recent parking spots usage logs.
- **`/api/latest-visits/spot/[spotId]`**: Retrieves recent parking spot usage log.
- **`/api/parking-spot`**: Retrieves current status of all parking spots.
- **`/api/parking-spot/[id]`**: Retrieves current status of selected parking spot.
- **`/api/users`**: Provides list of users with usernames and emails.
- **`/api/users/[id]`**: Provides info about selected user.
- **`/api/spot-info`**: Provides a summary of parking spot statuses.
- **`/api/reservations`**: Manages parking spot reservations.

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Open a pull request describing your changes.

---

## License

This project is proprietary and not open-source. Contact the author for licensing information.

---

## Authors

- **Tomáš Vasiľko**  
  [github.com/tvslk](https://github.com/tvslk)

---

## Screenshots

### User Dashboard
![User Dashboard](https://i.imgur.com/TB7OkP2.png)

### Admin Dashboard
![Admin Dashboard](https://i.imgur.com/n56O3PH.png)

this project uses vercel for deploy, tailwind css, auth0 for role based auth etc. next js, react ...