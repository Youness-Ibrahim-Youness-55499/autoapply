# Jobman CV parser service

This isolated Python service extracts native text and layout from uploaded PDF CVs with PyMuPDF, maps recognized sections into Jobman's existing profile schema, and updates the authenticated user's Supabase profile. It does not use an LLM or consume model tokens.

## Security and data flow

The browser sends the signed-in user's Supabase access token and the uploaded document ID. The service validates that token through Supabase Auth, verifies that the document belongs to the same user, downloads it from the private `resumes` bucket, and writes through the existing row-level security policies. No service-role key is required.

The service accepts only documents categorized as `cv` with MIME type `application/pdf`. Processing status moves through `processing`, then `ready` or `failed`.

Existing user-entered profile data is preserved. Parsed name and location fill empty fields, parsed skills are merged without case-insensitive duplicates, and education or experience are populated only when their corresponding profile sections are empty.

## Local development

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_ANON_KEY="your-publishable-key"
$env:ALLOWED_ORIGINS="http://localhost:5173"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Configure the frontend with:

```text
VITE_CV_PARSER_URL=http://localhost:8000
```

## Production

Build and deploy the included container independently from the frontend and Supabase Edge Functions. The service is stateless and can run on any container host.

PyMuPDF is distributed under AGPL-3.0 with commercial licensing available from Artifex. A proprietary Jobman deployment must obtain appropriate commercial terms before enabling this service in production.
