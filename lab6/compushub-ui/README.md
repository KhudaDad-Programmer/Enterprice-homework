# CampusHub Courses React Client

Student name: Mohammad Amir Ataee

This React application displays course records from the CampusHub Spring Boot API.

## Ports

- Backend API: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- Courses endpoint: `http://localhost:8080/api/v1/courses`

## Start the backend

Open a terminal in the backend project and run:

```powershell
cd "F:\7th\spring boot\Enterprise-Web-Application-Labs\lab5\campushub-api"
mvn.cmd spring-boot:run
```

## Start the frontend

Open a second terminal in this project and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:5173/courses` in the browser.

The backend must be running before opening the Courses page. If it is stopped, the interface displays an error message.
