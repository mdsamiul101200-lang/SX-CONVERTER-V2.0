# SX CONVERTER

Real backend-powered converter for PDF, HTML, APK, ZIP, DOCX and TXT.

The browser is only the client. Conversion happens on the server/container using real document/PDF/ZIP engines and an Android SDK for WebView APK builds. The backend registry recognizes all 36 input/output pairs; unsupported or inherently meaningless routes fail instead of fabricating output.

## Docker
`docker compose up --build`

Then open `http://localhost:8080`.

## Deployment
GitHub stores source code; a real server/container must run the backend. Set `API_BASE_URL` to the public backend origin if frontend and backend are hosted separately.

## Safety
Uploaded APKs are never executed. ZIP extraction rejects traversal paths. Temporary files are isolated and cleaned after processing.


## Render deployment

Deploy this repository as a **Web Service using the Docker runtime**. Render supports Dockerfiles for web services and expects the app to listen on `0.0.0.0` using the `PORT` environment variable. This project defaults to port `10000` and exposes `/api/health`. No Publish Directory is used for a Docker Web Service.

The Docker image installs Node.js, Java 17, Android SDK/build tools, Gradle 8.10, Chromium for Playwright, LibreOffice and Poppler so the HTML/PDF/DOCX and HTML/ZIP-to-APK pipelines can run on the server.

Important: generated files and the in-memory job map are instance-local. For a small single-instance deployment this is sufficient for an immediate conversion/download workflow. For multi-instance production, replace the in-process job map with Redis/queue storage and use persistent object storage for outputs.
