# FieldEaze - Field Service Management System

FieldEaze is a production-ready, full-stack field service management system built with modern technologies.

## Architecture

- **Monorepo**: Turborepo
- **Backend**: Spring Boot 3, Java 21, Spring Security (JWT), JPA, MySQL, WebSockets
- **Admin Web**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Mobile App**: React Native (Expo), TypeScript, Expo Router, NativeWind
- **DevOps**: Docker & Docker Compose

## Project Structure

```
fieldeaze/
├── apps/
│   ├── admin-web/      # React Admin Dashboard
│   ├── mobile-app/     # React Native Expo Mobile App
│   └── backend/        # Spring Boot REST API
├── packages/
│   ├── types/          # Shared TypeScript Types
│   └── config/         # Shared Configurations
└── docker-compose.yml  # System-wide Docker setup
```

## Getting Started

### Prerequisites

- Node.js (v20+)
- JDK 21
- Maven
- Docker & Docker Compose

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run with Docker** (Recommended)
   ```bash
   docker-compose up --build
   ```

3. **Manual Development Mode**
   - **Backend**: 
     ```bash
     cd apps/backend
     ./gradlew bootRun
     ```
   - **Admin Web**:
     ```bash
     cd apps/admin-web
     npm run dev
     ```
   - **Mobile App**:
     ```bash
     cd apps/mobile-app
     npx expo start
     ```

## Features

- ✅ **Authentication**: JWT-based auth with Role-Based Access Control (RBAC).
- ✅ **Dashboard**: Real-time KPI tracking and analytics.
- ✅ **Tickets**: Service request lifecycle management.
- ✅ **Live Tracking**: Real-time technician location updates via WebSockets.
- ✅ **Responsive Design**: Mobile-first approach for all applications.
- ✅ **Enterprise Ready**: Clean architecture, DTO patterns, and scalable structure.
