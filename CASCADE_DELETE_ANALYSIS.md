# Cascade Delete Analysis - Student & Recruiter Data Dependencies

## Summary of Cascade-Delete Requirements

When deleting a **Student** or **Recruiter** user, the following data must be cascade-deleted to maintain database referential integrity:

---

## STUDENT USER CASCADE-DELETE

### 1. **User Document** (Primary)
- **Collection:** `User`
- **Field:** Document with `role: 'student'`
- **Contains:** `studentProfile` object (embedded - will be deleted with User)

### 2. **StudentProfile (Embedded in User)**
- **Location:** `User.studentProfile`
- **Fields to delete:** All embedded profile data
  - rollNumber, department, batch, cgpa
  - phone, address, gender, skills
  - resumeUrl, resumeBase64, profileImage
  - linkedIn, github, portfolio
  - placementStatus (isPlaced, placedAt)
  - Parsed resume data (parsedResumeData)
  - AI Analysis (aiResumeAnalysis)
  - AI Recommendations (aiRecommendations with roadmap, topics, tasks)

### 3. **Applications**
- **Collection:** `Application`
- **Reference:** `student` field (foreign key to User)
- **Delete:** All applications where `student === studentId`
- **Includes:** AI evaluation scores and ATS evaluation data

### 4. **Resume Analysis Records**
- **Collection:** `ResumeAnalysis`
- **Reference:** `studentId` field (foreign key to User)
- **Delete:** All resume analysis records where `studentId === deleted_student_id`
- **Includes:** Score breakdowns, strengths, weaknesses, suggestions

### 5. **Recommendation Plans**
- **Collection:** `RecommendationPlan`
- **Reference:** `studentId` field (foreign key to User)
- **Delete:** All recommendation plans where `studentId === deleted_student_id`
- **Includes:** Target role, skill gap analysis, roadmap phases, projects, resources, interview tips

### 6. **Interview Evaluations**
- **Collection:** `InterviewEvaluation`
- **Reference:** `studentId` field (foreign key to User)
- **Delete:** All evaluations where `studentId === deleted_student_id`
- **Includes:** Q&A pairs, scores, strengths, weaknesses, AI analysis

### 7. **Mock Test Attempts**
- **Collection:** `MockTestAttempt`
- **Reference:** `student` field (foreign key to User)
- **Delete:** All attempts where `student === deleted_student_id`
- **Includes:** Answers, feedback, scores, percentage, AI feedback

### 8. **Notifications**
- **Collection:** `Notification`
- **Reference:** `user` field (foreign key to User)
- **Delete:** All notifications where `user === deleted_student_id`
- **Includes:** Messages, announcements, application updates

### 9. **OTP Records (if exists)**
- **Collection:** `OTP`
- **Reference:** `email` field (implicit via email)
- **Delete:** OTP records for deleted student's email (cleanup convenience)
- **Note:** Not a hard foreign key, but should be cleaned up

### 10. **Login Attempt Records (if exists)**
- **Collection:** `LoginAttempt`
- **Reference:** `email` field (implicit via email)
- **Delete:** Failed login attempts for deleted student's email (cleanup convenience)
- **Note:** Not a hard foreign key, but should be cleaned up

---

## RECRUITER USER CASCADE-DELETE

### 1. **User Document** (Primary)
- **Collection:** `User`
- **Field:** Document with `role: 'recruiter'`
- **Contains:** `recruiterProfile` object (embedded - will be deleted with User)

### 2. **RecruiterProfile (Embedded in User)**
- **Location:** `User.recruiterProfile`
- **Fields to delete:** All embedded profile data
  - company, designation, phone
  - companyWebsite, companyDescription
  - companyLogo, industry
  - profileImage, profileImageContentType

### 3. **Jobs Posted**
- **Collection:** `Job`
- **Reference:** `postedBy` field (foreign key to User)
- **Delete:** All jobs where `postedBy === recruiter_id`
- **Cascade Note:** Deleting these jobs should also cascade-delete their Applications (see below)
- **Includes:** Job attachments, eligibility criteria, requirements, responsibilities

### 4. **Applications (for jobs posted by this recruiter)**
- **Collection:** `Application`
- **Indirect Reference:** Via deleted Job documents
- **Delete:** All applications where `job` references a deleted Job
- **Includes:** AI evaluation scores, ATS evaluation, cover letters

### 5. **Notifications**
- **Collection:** `Notification`
- **Reference:** `user` field (foreign key to User)
- **Delete:** All notifications where `user === deleted_recruiter_id`
- **Includes:** Messages, job updates, application notifications
- **Note:** May also include notifications sent BY recruiter via `sentBy` field

### 6. **OTP Records (if exists)**
- **Collection:** `OTP`
- **Reference:** `email` field (implicit via email)
- **Delete:** OTP records for deleted recruiter's email (cleanup convenience)
- **Note:** Not a hard foreign key, but should be cleaned up

### 7. **Login Attempt Records (if exists)**
- **Collection:** `LoginAttempt`
- **Reference:** `email` field (implicit via email)
- **Delete:** Failed login attempts for deleted recruiter's email (cleanup convenience)
- **Note:** Not a hard foreign key, but should be cleaned up

---

## ADMIN USER CASCADE-DELETE

### 1. **User Document** (Primary)
- **Collection:** `User`
- **Field:** Document with `role: 'admin'`

### 2. **Announcement Documents**
- **Collection:** `Announcement`
- **Reference:** `createdBy` field (foreign key to User)
- **Delete:** All announcements where `createdBy === admin_id`

### 3. **Placement Drives**
- **Collection:** `PlacementDrive`
- **Reference:** `createdBy` field (foreign key to User)
- **Delete:** All placement drives where `createdBy === admin_id`

### 4. **Mock Tests**
- **Collection:** `MockTest`
- **Reference:** `createdBy` field (foreign key to User)
- **Delete:** All mock tests where `createdBy === admin_id`
- **Cascade Note:** Should also delete MockTestAttempt records for these tests

### 5. **Question Bank Entries**
- **Collection:** `QuestionBank`
- **Reference:** `usedInTests[].userId` field (array of user references)
- **Update/Delete:** Remove/update entries where `userId === admin_id` in `usedInTests` array

### 6. **Admin Section Access Records**
- **Collection:** `AdminSectionAccess`
- **Reference:** `admin` field (foreign key to User)
- **Delete:** All access records where `admin === admin_id`

### 7. **Notifications**
- **Collection:** `Notification`
- **Reference:** `user` field (if notifications sent to this admin)
- **Delete:** All notifications where `user === admin_id`

### 8. **Login Attempt Records**
- **Collection:** `LoginAttempt`
- **Reference:** `email` field (implicit via email)
- **Delete:** Failed login attempts for deleted admin's email

---

## SHARED DATA BY ROLE

### Collections with `createdBy` Field (User-Created Content)
- **Announcement** - Created by: Admin, Recruiter, or System
- **PlacementDrive** - Created by: Admin (typically)
- **MockTest** - Created by: Admin
- **Job** - Created by: Recruiter (via `postedBy` field)

### Collections with `user` Field (Generic User Reference)
- **Notification** - References: Any user role (student, recruiter, admin)

---

## DELETION ORDER (To Respect Foreign Keys)

**For STUDENT deletion, execute in this order:**
1. Delete from `InterviewEvaluation` (studentId)
2. Delete from `MockTestAttempt` (student)
3. Delete from `RecommendationPlan` (studentId)
4. Delete from `ResumeAnalysis` (studentId)
5. Delete from `Application` (student)
6. Delete from `Notification` (user)
7. Delete OTP records by email
8. Delete LoginAttempt records by email
9. Finally delete from `User` (role='student')

**For RECRUITER deletion, execute in this order:**
1. Delete from `Application` (via cascade of jobs)
2. Delete from `Job` (postedBy)
3. Delete from `Notification` (user)
4. Delete OTP records by email
5. Delete LoginAttempt records by email
6. Finally delete from `User` (role='recruiter')

**For ADMIN deletion, execute in this order:**
1. Delete from `MockTestAttempt` (for admin-created tests)
2. Delete from `MockTest` (createdBy)
3. Delete from `Announcement` (createdBy)
4. Delete from `PlacementDrive` (createdBy)
5. Update `QuestionBank` entries (usedInTests)
6. Delete from `AdminSectionAccess` (admin)
7. Delete from `Notification` (user)
8. Delete LoginAttempt records by email
9. Finally delete from `User` (role='admin')

---

## DATA VOLUME ESTIMATES

### For a typical STUDENT record:
- 1 User document (~5-50KB with embedded profile)
- 0-100 Applications (50-500KB)
- 0-1 ResumeAnalysis (5KB)
- 0-1 RecommendationPlan (10-50KB)
- 0-50 InterviewEvaluations (5-50KB)
- 0-20 MockTestAttempts (10-100KB)
- 0-500 Notifications (5-50KB)
- **Total: ~100KB - 1MB per student**

### For a typical RECRUITER record:
- 1 User document (~5-20KB with embedded profile)
- 0-100 Jobs (100-500KB)
- 0-5000 Applications (250KB-5MB)
- 0-500 Notifications (5-50KB)
- **Total: ~500KB - 10MB per recruiter**

---

## Implementation Notes

### Hard Foreign Keys (Must Delete)
- Application.student / Application.job
- MockTestAttempt.student
- ResumeAnalysis.studentId
- InterviewEvaluation.studentId
- RecommendationPlan.studentId
- Notification.user
- Job.postedBy
- Announcement.createdBy
- PlacementDrive.createdBy
- MockTest.createdBy
- AdminSectionAccess.admin

### Soft References (Should Clean Up)
- OTP.email
- LoginAttempt.email
- Notification.sentBy (soft reference)
- QuestionBank.usedInTests[].userId (array reference)

### Indexes to Consider
- Application: `{ student: 1 }`, `{ job: 1, student: 1 }`
- MockTestAttempt: `{ student: 1 }`
- ResumeAnalysis: `{ studentId: 1 }`
- InterviewEvaluation: `{ studentId: 1 }`
- RecommendationPlan: `{ studentId: 1 }`
- Notification: `{ user: 1 }`
- Job: `{ postedBy: 1 }`
- Announcement: `{ createdBy: 1 }`
- PlacementDrive: `{ createdBy: 1 }`
- MockTest: `{ createdBy: 1 }`

These indexes ensure cascade-delete operations can be executed efficiently.

---

## Potential Additions / Missing Collections

Based on the analysis, there are **NO references found for:**
- Messages collection (referenced in UI but not found in models)
- Uploads collection (referenced in UI but not found in models)
- Files/Attachments separate collection (files stored as base64 in documents)

If these collections exist, they would also need cascade-delete rules:
- Messages: `{ sender: 1 }`, `{ recipient: 1 }`
- Uploads: `{ uploadedBy: 1 }`
