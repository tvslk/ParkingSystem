# SpotMonitoring Backend

SpotMonitoring is a parking lot monitoring and reservation system. This backend application is built using [Next.js](https://nextjs.org/) and [MySQL](https://www.mysql.com/). It provides APIs, user dashboards, and admin dashboards for managing parking spots, reservations, and QR code-based gate access.

---

## Production

**Production version** of this app is available on **https://parkingsystem-gl.vercel.app/**

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
├── parking-system/
│   ├── .env                # Environment variables
│   ├── lib/
│   │   └── db.ts           # MySQL database connection
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/        # API routes
│   │   │   ├── components/ # Shared React components
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   ├── dashboard/  # User and admin dashboard pages
│   │   │   ├── latest-visits/
│   │   │   ├── profile/
│   │   │   ├── users/
│   │   └── actions/        # Server-side actions (auth, roles, etc.)
│   ├── public/             # Static assets (images, etc.)
│   ├── README.md           # Project documentation
│   ├── next.config.js      # Next.js configuration
│   └── package.json        # Project dependencies
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

### API Endpoints
- **`/api/auth/[auth0]`**: Api self-managed by Auth0. Handles sign up and login.
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