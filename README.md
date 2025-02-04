# Parking System

A system for monitoring parking spot availability.

## Features
- Green dot: Vacant spot
- Red dot: Occupied spot
- Orange dot: Error reading license plate

## Flow
1. User requests parking status.
2. API validates JWT token.
3. Parking system retrieves data from the database.
4. Status is displayed to the user.

## Tech Stack
- Backend: API with JWT authentication (node.js)
- Frontend: ClientApp
- Database: Stores parking, car and user data
