
# Attendance Management System - Backend Specs

This document provides the complete Java Spring Boot code and MySQL schema for the backend.

## 1. MySQL Schema

```sql
CREATE DATABASE attendance_system;
USE attendance_system;

-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER') NOT NULL,
    student_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    marked_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_daily_attendance (student_id, date)
);
```

## 2. Spring Boot Implementation

### Maven Dependencies (`pom.xml`)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
</dependencies>
```

### Entity Classes
```java
@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;
    
    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    
    @ManyToOne
    @JoinColumn(name = "marked_by")
    private User teacher;
}
```

### REST Controller
```java
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> markAttendance(@RequestBody List<AttendanceRequest> requests) {
        attendanceService.saveAll(requests);
        return ResponseEntity.ok("Attendance marked successfully");
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.findByStudentId(id));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getByDate(@PathVariable String date) {
        return ResponseEntity.ok(attendanceService.findByDate(LocalDate.parse(date)));
    }
}
```

## 3. How to Run
1.  **Backend**: Import the code into IntelliJ/Eclipse, configure `application.properties` with your MySQL credentials, and run as a Spring Boot App.
2.  **Frontend**: Run `npm install` followed by `npm start`.
3.  **Database**: Execute the SQL script above in your MySQL Workbench or CLI.
