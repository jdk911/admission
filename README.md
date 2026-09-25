Government School Online Admission Portal

A serverless, web-based student admission portal built with Google Apps Script, HTML5 (WebRTC), and Bootstrap 5. This application allows students and parents to submit admission applications for any government school, capture live student photographs directly from their device camera, automatically store records in Google Sheets, and receive a structured, unique Application Reference Code.

Key Features

Dynamic School & Location Entry: Instead of being locked to a single institution, applicants enter their Full School Name, Block, and District.

Live Camera Photo Capture: Integrated HTML5 WebRTC camera stream (navigator.mediaDevices.getUserMedia) lets applicants take a live snapshot using a mobile phone or desktop webcam.

Automated Google Drive Photo Storage: Captured photos are converted to JPEG, named after the student's unique Application ID, and stored in a dedicated Google Drive folder (Govt_School_Admission_Photos).

Zero-Config Google Sheets Database: Automatically creates and formats a Google Spreadsheet (Govt_School_Online_Admissions_DB) with frozen headers on the first run if one is not already linked.

Concurrency Protection: Uses LockService to prevent data collisions when multiple students submit forms simultaneously.

Printable Acknowledgment Receipt: Displays an instant confirmation screen with the generated Application ID and a one-click print option.

How the Unique Application Code Works

Every submitted application is assigned a unique reference code in the following format:

YYMMDD/BLOCK/CLASS/FIRST4


Code Breakdown

Segment

Description

Formatting Rule

Example

YYMMDD

Date of submission

2-digit Year, 2-digit Month, 2-digit Day

260925 (25 Sept 2026)

BLOCK

Block name entered by user

Uppercase, alphanumeric characters only

DANAPUR

CLASS

Admission class selected

Uppercase class number/code

8

FIRST4

First 4 letters of Student's Name

Uppercase A–Z only (padded with X if shorter than 4 letters)

RAHU (for Rahul Kumar)

Sample Generated Code:

260925/DANAPUR/8/RAHU


How Live Camera Capture Works

Stream Initialization: Clicking Start Camera requests browser permission to access the user-facing camera (facingMode: 'user') via the HTML5 MediaDevices API.

Snapshot & Compression: Clicking Capture Photo draws the current video frame onto a hidden HTML5 <canvas> element (320x240 px) and encodes it as a Base64 JPEG data URL (0.85 quality).

Cloud Upload: Upon form submission, Code.gs decodes the Base64 string into a binary blob, saves it inside the Govt_School_Admission_Photos folder in Google Drive as YYMMDD_BLOCK_CLASS_FIRST4.jpg, sets view permissions, and logs the direct Google Drive link in the spreadsheet.

Repository Structure

├── Code.gs       # Backend Google Apps Script (Sheet creation, Drive upload, ID generation)
├── Index.html    # Frontend UI (Bootstrap 5 form, WebRTC camera logic, receipt view)
└── README.md     # Project documentation


Google Sheet Database Schema

When the first application is submitted, the script automatically creates a sheet tab named Admissions with the following columns:

Timestamp

Application Code

Full School Name

Block

District

Admission Class

Student Name

Father Name

Mother Name

Date of Birth

Gender

Category

Aadhaar (Last 4 Digits)

Mobile Number

Full Address

Student Photo Link

Online Deployment Guide (No Local Setup Required)

Open Google Apps Script and click New project.

Rename the project to Govt School Admission Portal.

Copy the contents of Code.gs into the default Code.gs file in the Apps Script editor.

Click the + (Add a file) icon next to Files, select HTML, and name the file Index (case-sensitive).

Copy the contents of Index.html into Index.html and save the project (Ctrl + S).

Click Deploy > New deployment.

Select type Web app:

Execute as: Me

Who has access: Anyone

Click Deploy, authorize the script permissions for Google Sheets and Google Drive, and copy your live Web App URL.

License

This project is open-source and available for educational and government school administration use.
