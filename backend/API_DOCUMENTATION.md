# CBT (Computer Based Test) Backend API Documentation

## 📋 Overview

Backend API untuk sistem Computer Based Test menggunakan Laravel 10 dengan autentikasi Sanctum.

## 🚀 Setup & Installation

### Prerequisites
- PHP >= 8.1
- Composer
- MySQL/PostgreSQL
- Node.js & NPM (untuk dependencies)

### Installation Steps

```bash
# Install dependencies
composer install
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# DB_DATABASE=your_database
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database dengan data sample
php artisan db:seed

# Start development server
php artisan serve
```

### Default Test Accounts

**Admin:**
- Username: `admin`
- Password: `admin123`

**Students:**
- Username: `budi` | Password: `password`
- Username: `siti` | Password: `password`

---

## 🔐 Authentication

### Register
**POST** `/api/register`

**Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "siswa",
  "kelas_id": 1
}
```

**Response:**
```json
{
  "message": "Registrasi berhasil",
  "user": { ... },
  "token": "1|xyz...",
  "token_type": "Bearer"
}
```

### Login
**POST** `/api/login`

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "name": "Admin CBT",
    "username": "admin",
    "email": "admin@cbt.com",
    "role": "admin",
    "kelas_id": null
  },
  "token": "1|xyz...",
  "token_type": "Bearer"
}
```

### Logout
**POST** `/api/logout`

**Headers:** `Authorization: Bearer {token}`

### Get Current User
**GET** `/api/me`

**Headers:** `Authorization: Bearer {token}`

---

## 📝 Exam Routes (Student)

**All routes require authentication:** `Authorization: Bearer {token}`

### Get All Exams
**GET** `/api/exams`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Ujian Matematika Semester 1",
    "description": "Ujian tengah semester...",
    "duration_minutes": 90,
    "start_at": "2026-02-09T...",
    "end_at": "2026-02-16T...",
    "question_count": 10
  }
]
```

### Get Exam Detail
**GET** `/api/exams/{exam_id}`

**Response:**
```json
{
  "exam": {
    "id": 1,
    "title": "Ujian Matematika Semester 1",
    "description": "...",
    "duration_minutes": 90
  },
  "questions": [
    {
      "id": 1,
      "prompt": "Berapa hasil dari 2 + 2?",
      "options": ["2", "3", "4", "5"],
      "score": 10
    }
  ]
}
```

### Start Exam
**POST** `/api/exams/{exam_id}/start`

**Response:**
```json
{
  "message": "Ujian dimulai",
  "user_exam": {
    "id": 1,
    "user_id": 2,
    "exam_id": 1,
    "status": "in_progress",
    "started_at": "2026-02-09T..."
  }
}
```

### Submit Exam Answers
**POST** `/api/exams/{exam_id}/submit`

**Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "answer": "4"
    },
    {
      "question_id": 2,
      "answer": "15"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Ujian berhasil dikumpulkan",
  "score": 20,
  "user_exam": { ... }
}
```

### Get Exam Results History
**GET** `/api/exams/results/history`

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "exam_id": 1,
    "score": 80,
    "status": "completed",
    "submitted_at": "2026-02-09T...",
    "exam": {
      "id": 1,
      "title": "Ujian Matematika Semester 1"
    }
  }
]
```

### Get Specific Result Detail
**GET** `/api/exams/results/{user_exam_id}`

---

## 👨‍💼 Admin Routes

**All admin routes require:**
- Authentication: `Authorization: Bearer {token}`
- Role: `admin`

Base URL: `/api/admin`

### Exam Management

#### List All Exams
**GET** `/api/admin/exams`

#### Create Exam
**POST** `/api/admin/exams`

**Body:**
```json
{
  "title": "Ujian Fisika",
  "slug": "ujian-fisika",
  "description": "Ujian fisika semester 1",
  "duration_minutes": 120,
  "start_at": "2026-02-10 08:00:00",
  "end_at": "2026-02-17 17:00:00"
}
```

#### Update Exam
**PUT** `/api/admin/exams/{exam_id}`

#### Delete Exam
**DELETE** `/api/admin/exams/{exam_id}`

#### Add Question to Exam
**POST** `/api/admin/exams/{exam_id}/questions`

**Body:**
```json
{
  "prompt": "Berapa kecepatan cahaya?",
  "options": ["300.000 km/s", "150.000 km/s", "500.000 km/s", "100.000 km/s"],
  "answer": "300.000 km/s",
  "score": 10
}
```

#### Update Question
**PUT** `/api/admin/exams/{exam_id}/questions/{question_id}`

#### Delete Question
**DELETE** `/api/admin/exams/{exam_id}/questions/{question_id}`

---

### Kelas Management

#### List Kelas
**GET** `/api/admin/kelas`

#### Create Kelas
**POST** `/api/admin/kelas`

**Body:**
```json
{
  "nama_kelas": "Kelas 10 IPA 1"
}
```

#### Update Kelas
**PUT** `/api/admin/kelas/{id}`

#### Delete Kelas
**DELETE** `/api/admin/kelas/{id}`

---

### Mapel Management

#### Get Mapel by Kelas
**GET** `/api/admin/mapel/{kelas_id}`

#### Create Mapel
**POST** `/api/admin/mapel`

**Body:**
```json
{
  "kelas_id": 1,
  "nama_mapel": "Matematika Lanjut"
}
```

#### Update Mapel
**PUT** `/api/admin/mapel/{id}`

#### Delete Mapel
**DELETE** `/api/admin/mapel/{id}`

---

### Soal Management

#### Get Soal by Mapel
**GET** `/api/admin/soal/{mapel_id}`

#### Import Soal from Excel
**POST** `/api/admin/soal/import`

**Body:** `multipart/form-data`
```
file: [Excel file]
mapel_id: 1
```

**Note:** This will delete existing questions for the mapel and import new ones.

#### Update Soal
**PUT** `/api/admin/soal/{id}`

**Body:**
```json
{
  "pertanyaan": "Updated question",
  "opsi_a": "Option A",
  "opsi_b": "Option B",
  "opsi_c": "Option C",
  "opsi_d": "Option D",
  "jawaban_benar": "A"
}
```

#### Delete Soal
**DELETE** `/api/admin/soal/{id}`

---

### Nilai Management

#### Save Nilai
**POST** `/api/admin/nilai`

**Body:**
```json
{
  "user_id": 2,
  "mapel_id": 1,
  "skor": 85
}
```

#### Get Nilai by User
**GET** `/api/admin/nilai/{user_id}`

---

## 📊 Database Schema

### Main Tables
- `users` - User accounts (admin & siswa)
- `exams` - Exam definitions
- `questions` - Exam questions
- `user_exams` - Tracking exam attempts and results
- `kelas` - Class definitions
- `mapel` - Subject/course definitions
- `soal` - Question bank per subject
- `nilai` - Grades/scores

---

## 🔒 Security Features

1. **Sanctum Token Authentication** - Secure API token-based auth
2. **Role-Based Access Control** - Admin/Student role separation
3. **Password Hashing** - Bcrypt password hashing
4. **CSRF Protection** - Built-in CSRF for web routes
5. **Request Validation** - All inputs validated

---

## 🧪 Testing

```bash
# Run tests
php artisan test

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 📦 Key Dependencies

- Laravel 10
- Laravel Sanctum (API Authentication)
- Maatwebsite Excel (Excel import/export)
- Carbon (Date handling)

---

## 🐛 Troubleshooting

### Token Authentication Issues
```bash
# Make sure Sanctum migrations are run
php artisan migrate

# Clear config cache
php artisan config:clear
```

### Database Issues
```bash
# Reset and reseed database
php artisan migrate:fresh --seed
```

### Permission Issues
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

---

## 📝 License

This project is open-sourced software licensed under the MIT license.
