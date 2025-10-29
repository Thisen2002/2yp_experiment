# Unified Organizer Dashboard Backend

A consolidated Node.js Express backend that combines all microservices into a single application.

## Features

- **Authentication Service**: User registration, login, and JWT-based authentication
- **Organizer Management**: CRUD operations for organizers
- **Event Management**: CRUD operations for events
- **Building Management**: CRUD operations for buildings with tag-based filtering
- **Analytics**: Overview analytics including visitor statistics and building metrics
- **Heatmap Analytics**: Peak occupancy, dwell time, and activity level analytics
- **Export Service**: Generate PDF and CSV reports for various data sets

## Project Structure

```
unified-backend/
├── src/
│   ├── index.js                 # Main application entry point
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── verifyToken.js       # JWT authentication middleware
│   ├── controllers/             # Request handlers
│   │   ├── authController.js
│   │   ├── organizerController.js
│   │   ├── eventController.js
│   │   ├── buildingController.js
│   │   ├── analyticsController.js
│   │   ├── heatmapController.js
│   │   └── exportController.js
│   ├── routes/                  # Route definitions
│   │   ├── authRoutes.js
│   │   ├── organizerRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── buildingRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── heatmapRoutes.js
│   │   └── exportRoutes.js
│   ├── services/                # Business logic
│   │   ├── analyticsService.js
│   │   ├── heatmapService.js
│   │   └── [export services]
│   └── utils/                   # Utility functions
│       └── sendApproveEmail.js
├── tests/                       # Test files
├── exports/                     # Generated export files
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new organizer
- `POST /api/auth/login` - Login organizer
- `GET /api/auth/approve/:id` - Approve organizer (admin)

### Organizers (`/api/organizers`)
- `GET /api/organizers` - Get all organizers
- `GET /api/organizers/:id` - Get organizer by ID
- `PUT /api/organizers/:id` - Update organizer
- `DELETE /api/organizers/:id` - Delete organizer

### Events (`/api/events`)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Buildings (`/api/buildings`)
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get building by ID
- `GET /api/buildings/filterByTag?tag=...` - Filter buildings by tag
- `GET /api/buildings/tags` - Get available tags
- `POST /api/buildings` - Create new building
- `PUT /api/buildings/:id` - Update building
- `DELETE /api/buildings/:id` - Delete building

### Analytics (`/api/analytics`)
- `GET /api/analytics/total-visitors` - Get total visitors
- `GET /api/analytics/total-checkins` - Get total check-ins
- `GET /api/analytics/avg-duration` - Get average duration
- `GET /api/analytics/repeat-visitors` - Get repeat visitors
- `GET /api/analytics/top3-buildings` - Get top 3 buildings
- `GET /api/analytics/visitors-per-building` - Get visitors per building

### Heatmap (`/api/heatmap`)
- `GET /api/heatmap/peak-occupancy` - Get peak occupancy data
- `GET /api/heatmap/avg-dwell-time` - Get average dwell time
- `GET /api/heatmap/activity-level` - Get activity level data

### Export (`/api/export`)
- `GET /api/export/attendance/pdf/:day?` - Generate attendance PDF
- `GET /api/export/attendance/csv/:day?` - Generate attendance CSV
- `GET /api/export/movement/pdf/:day?` - Generate movement PDF
- `GET /api/export/movement/csv/:day?` - Generate movement CSV
- `GET /api/export/security/pdf/:day?` - Generate security PDF
- `GET /api/export/event/pdf/:day?` - Generate event PDF

## Installation

1. Clone the repository and navigate to the unified-backend directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   copy .env.example .env
   ```

4. Update the `.env` file with your database and email configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode
- `BASE_URL` - Base URL for the application
- `JWT_SECRET` - JWT signing secret
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database configuration
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOTIFY_EMAIL` - Email configuration
- `CORS_ORIGIN` - CORS allowed origin

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email sending
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Testing

Run tests using:
```bash
npm test
```

## Migration from Microservices

This unified backend consolidates the following original services:
- auth-service (port 5004)
- orgMng-service (port 5001)
- event-service (port 5002)
- building-service (port 5003)
- overview_analytics (port 5006)
- Heatmapanalytic-service (port 5005)
- export-service (port 5007)

All endpoints have been prefixed with `/api/` and the original functionality is preserved.