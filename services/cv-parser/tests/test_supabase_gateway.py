from __future__ import annotations

import unittest

from app.schemas import EducationEntry, ParsedProfile
from app.supabase_gateway import merge_profile


class MergeProfileTest(unittest.TestCase):
    def test_preserves_existing_fields_and_merges_new_skills(self) -> None:
        current = {
            "full_name": "Existing Name",
            "location": "Existing Location",
            "skills": ["Python"],
            "education": [{"id": "existing"}],
            "experience": [],
        }
        parsed = ParsedProfile(
            full_name="Parsed Name",
            location="Parsed Location",
            skills=["python", "TypeScript"],
            education=[
                EducationEntry(
                    id="parsed",
                    institution="Example University",
                    degree="MSc",
                )
            ],
        )

        payload = merge_profile(current, parsed)

        self.assertNotIn("full_name", payload)
        self.assertNotIn("location", payload)
        self.assertNotIn("education", payload)
        self.assertEqual(payload["skills"], ["Python", "TypeScript"])


if __name__ == "__main__":
    unittest.main()
