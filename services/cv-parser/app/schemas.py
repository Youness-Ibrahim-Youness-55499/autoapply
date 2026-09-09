from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ParseRequest(BaseModel):
    document_id: str = Field(min_length=36, max_length=36)


class EducationEntry(BaseModel):
    id: str
    institution: str
    degree: str
    field: str = ""
    startDate: str = ""
    endDate: str = ""


class ExperienceEntry(BaseModel):
    id: str
    company: str
    role: str
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    current: bool = False
    description: str = ""


class LanguageEntry(BaseModel):
    id: str
    name: str
    level: str
    confirmed: bool = False


class ParsedProfile(BaseModel):
    full_name: str = ""
    location: str = ""
    skills: list[str] = Field(default_factory=list)
    education: list[EducationEntry] = Field(default_factory=list)
    experience: list[ExperienceEntry] = Field(default_factory=list)
    languages: list[LanguageEntry] = Field(default_factory=list)


class ParseResponse(BaseModel):
    document_id: str
    status: Literal["ready"]
    profile: ParsedProfile
