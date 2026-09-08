from __future__ import annotations

import os

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .extractor import extract_lines
from .profile_parser import parse_profile
from .schemas import ParseRequest, ParseResponse
from .supabase_gateway import SupabaseGateway


def required_environment(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


app = FastAPI(title="Jobman CV Parser", version="1.0.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/parse", response_model=ParseResponse)
async def parse_cv(
    request: ParseRequest,
    authorization: str = Header(default=""),
) -> ParseResponse:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="A user access token is required.")

    gateway = SupabaseGateway(
        required_environment("SUPABASE_URL"),
        required_environment("SUPABASE_ANON_KEY"),
        authorization.removeprefix("Bearer ").strip(),
    )

    try:
        user_id = await gateway.authenticated_user_id()
        document = await gateway.document(request.document_id, user_id)
        if document.get("category") != "cv" or document.get("mime_type") != "application/pdf":
            raise ValueError("Only PDF documents categorized as CVs can be parsed.")

        await gateway.set_document_status(request.document_id, "processing")
        pdf_bytes = await gateway.download(str(document["storage_path"]))
        lines, page_widths = extract_lines(pdf_bytes)
        profile = parse_profile(lines, page_widths)
        await gateway.update_profile(user_id, profile)
        await gateway.set_document_status(request.document_id, "ready")
        return ParseResponse(document_id=request.document_id, status="ready", profile=profile)
    except (httpx.HTTPError, LookupError, ValueError) as error:
        try:
            await gateway.set_document_status(request.document_id, "failed")
        except httpx.HTTPError:
            pass
        status_code = 404 if isinstance(error, LookupError) else 422
        raise HTTPException(status_code=status_code, detail=str(error)) from error
