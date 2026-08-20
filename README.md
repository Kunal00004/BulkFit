# BulkFit

A hyper-specialized weight gain and home-workout tracking SaaS, built for the "hardgainer" persona:
young, starting light, training at home with bodyweight/no-equipment progressive overload,
and eating in a deliberate caloric surplus to build lean mass.

## Stack

- **Backend:** Java 17, Spring Boot 3.3, Spring Data JPA / Hibernate, Spring Security (JWT), Maven
- **Database:** MySQL 8.0
- **Frontend:** React 18 (Vite), React Router DOM, Axios, Context API
- **UI:** Tailwind CSS, Lucide React, Recharts

## Project Structure

```
bulkfit/
├── backend/           # Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/bulkfit/
│       ├── config/        # Security config, CORS, data seeder
│       ├── controller/     # REST controllers
│       ├── dto/            # Request/response DTOs
│       ├── entity/          # JPA entities
│       ├── enums/           # MealType, DifficultyLevel, Role
│       ├── exception/       # GlobalExceptionHandler + custom exceptions
│       ├── repository/      # Spring Data JPA repositories
│       ├── security/        # JWT filter, utils, UserDetailsService
│       └── service/         # Business logic (incl. NutritionCalculator)
└── frontend/           # React + Vite application
    └── src/
        ├── api/            # Axios instance + service functions
        ├── components/      # Reusable UI (Navbar, MetricCard, ProgressBar...)
        ├── context/          # AuthContext
        ├── layouts/          # AppLayout shell
        └── pages/            # Auth, Dashboard, Diet, Workout
```

## Getting Started

### 1. Database

Create a MySQL 8.0 instance. The app will auto-create the `bulkfit_db` schema on first boot
(`createDatabaseIfNotExist=true`), but you need a running MySQL server reachable at the
configured URL.

```sql
CREATE USER 'root'@'localhost' IDENTIFIED BY 'root'; -- if not already set up
```

### 2. Backend

```bash
cd backend
# Configure src/main/resources/application.properties if your MySQL
# credentials differ from the defaults (root/root, localhost:3306)
mvn spring-boot:run
```

The API boots on `http://localhost:8080`. On first run, `DataSeeder` populates:
- 16 calorie-dense, high-protein `FoodItem`s (chicken, rice, eggs, peanut butter, whey, etc.)
- 15 no-equipment `Exercise`s (push-ups, pull-ups, Bulgarian split squats, planks, etc.)

Set a production JWT secret via env var:
```bash
export BULKFIT_JWT_SECRET=$(openssl rand -base64 32)
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` calls to the backend during dev.

## Core Domain Logic

`NutritionCalculator` (backend) drives all calorie/protein math using:
- **BMR:** Mifflin-St Jeor equation
- **Activity multiplier:** 1.55 (moderate home workouts, 4-5x/week)
- **Surplus:** +400 kcal/day for a lean bulk (~0.25-0.5 kg/week gain)
- **Protein target:** 2g per kg of current bodyweight

## API Overview

All endpoints are prefixed `/api`. `/api/auth/**` is public; everything else requires
`Authorization: Bearer <jwt>`.

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | `/auth/register`              | Create account, returns JWT           |
| POST   | `/auth/login`                 | Authenticate, returns JWT             |
| GET    | `/users/me`                   | Current user profile + computed goals |
| PATCH  | `/users/me/weight`            | Update current weight                 |
| GET    | `/dashboard`                  | Aggregated dashboard payload          |
| GET    | `/foods?query=`               | Search food items                     |
| POST   | `/diet/logs`                  | Log a meal                            |
| GET    | `/diet/summary?date=`         | Daily calorie/protein summary + logs  |
| DELETE | `/diet/logs/{id}`             | Delete a diet log                     |
| GET    | `/exercises`                  | List all exercises                    |
| POST   | `/workout/logs`               | Log a single set                      |
| POST   | `/workout/logs/batch`         | Log multiple sets at once             |
| GET    | `/workout/logs/recent?limit=` | Recent workout logs                   |
| DELETE | `/workout/logs/{id}`          | Delete a workout log                  |

## Notes / Next Steps

- The 30-day weight progression chart currently synthesizes a smooth trend line toward the
  user's live `currentWeightKg` snapshot, since the schema (as specified) doesn't include a
  dedicated `WeightLog` history table. Add one (`WeightLog: id, user, weightKg, loggedDate`)
  to persist real historical points instead.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for development; switch to a proper
  migration tool (Flyway/Liquibase) before production.
