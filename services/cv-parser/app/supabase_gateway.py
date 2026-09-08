from __future__ import annotations

from urllib.parse import quote

import httpx

from .schemas import ParsedProfile


class SupabaseGateway:
    def __init__(self, url: str, anon_key: str, access_token: str) -> None:
        self.url = url.rstrip("/")
        self.headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {access_token}",
        }

    async def authenticated_user_id(self) -> str:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{self.url}/auth/v1/user", headers=self.headers)
        response.raise_for_status()
        return str(response.json()["id"])

    async def document(self, document_id: str, user_id: str) -> dict[str, object]:
        params = {
            "id": f"eq.{document_id}",
            "user_id": f"eq.{user_id}",
            "select": "id,storage_path,mime_type,category",
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{self.url}/rest/v1/documents", headers=self.headers, params=params
            )
        response.raise_for_status()
        rows = response.json()
        if len(rows) != 1:
            raise LookupError("CV document not found for the authenticated user.")
        return rows[0]

    async def download(self, storage_path: str) -> bytes:
        encoded_path = quote(storage_path, safe="/")
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(
                f"{self.url}/storage/v1/object/authenticated/resumes/{encoded_path}",
                headers=self.headers,
            )
        response.raise_for_status()
        return response.content

    async def set_document_status(self, document_id: str, status: str) -> None:
        headers = {**self.headers, "Content-Type": "application/json", "Prefer": "return=minimal"}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.patch(
                f"{self.url}/rest/v1/documents",
                headers=headers,
                params={"id": f"eq.{document_id}"},
                json={"processing_status": status},
            )
        response.raise_for_status()

    async def update_profile(self, user_id: str, profile: ParsedProfile) -> None:
        async with httpx.AsyncClient(timeout=30) as client:
            current_response = await client.get(
                f"{self.url}/rest/v1/profiles",
                headers=self.headers,
                params={
                    "id": f"eq.{user_id}",
                    "select": "full_name,location,skills,education,experience",
                },
            )
        current_response.raise_for_status()
        rows = current_response.json()
        if len(rows) != 1:
            raise LookupError("Profile not found for the authenticated user.")

        payload = merge_profile(rows[0], profile)
        if not payload:
            return
        headers = {**self.headers, "Content-Type": "application/json", "Prefer": "return=minimal"}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.patch(
                f"{self.url}/rest/v1/profiles",
                headers=headers,
                params={"id": f"eq.{user_id}"},
                json=payload,
            )
        response.raise_for_status()


def merge_profile(current: dict[str, object], parsed: ParsedProfile) -> dict[str, object]:
    payload: dict[str, object] = {}
    if not current.get("full_name") and parsed.full_name:
        payload["full_name"] = parsed.full_name
    if not current.get("location") and parsed.location:
        payload["location"] = parsed.location

    raw_skills = current.get("skills", [])
    current_skills = [item for item in raw_skills if isinstance(item, str)] if isinstance(raw_skills, list) else []
    skills = list(current_skills)
    known_skills = {item.casefold() for item in skills}
    for skill in parsed.skills:
        if skill.casefold() not in known_skills:
            skills.append(skill)
            known_skills.add(skill.casefold())
    if skills != current_skills:
        payload["skills"] = skills

    for field_name in ("education", "experience"):
        existing = current.get(field_name, [])
        current_entries = existing if isinstance(existing, list) else []
        parsed_entries = [entry.model_dump() for entry in getattr(parsed, field_name)]
        if not current_entries and parsed_entries:
            payload[field_name] = parsed_entries

    return payload
