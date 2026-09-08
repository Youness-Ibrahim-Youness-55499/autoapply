from __future__ import annotations

import unittest

from app.extractor import TextLine
from app.profile_parser import parse_profile


def line(text: str, y: float, x: float = 220, size: float = 11) -> TextLine:
    return TextLine(
        page=0,
        x0=x,
        y0=y,
        x1=x + 200,
        y1=y + 14,
        text=text,
        font_size=size,
        bold=size > 12,
    )


class ParseProfileTest(unittest.TestCase):
    def test_maps_positioned_sections_without_an_llm(self) -> None:
        lines = [
            line("Example Candidate", 20, size=18),
            line("10115 Berlin, Germany", 45),
            line("Education", 100, x=40, size=14),
            line("2020 - 2022", 130, x=40),
            line("MSc Computer Science, Example University", 130),
            line("Work Experience", 200, x=40, size=14),
            line("2022 - Present", 230, x=40),
            line("Software Engineer, Example GmbH, Berlin", 230),
            line("- Built deterministic document pipelines", 255),
            line("Skills", 320, x=40, size=14),
            line("- Python, TypeScript", 350),
            line("Example Candidate", 700, x=400),
        ]

        profile = parse_profile(lines, [600])

        self.assertEqual(profile.full_name, "Example Candidate")
        self.assertEqual(profile.location, "10115 Berlin, Germany")
        self.assertEqual(profile.skills, ["Python", "TypeScript"])
        self.assertEqual(len(profile.education), 1)
        self.assertEqual(profile.education[0].degree, "MSc Computer Science")
        self.assertEqual(len(profile.experience), 1)
        self.assertEqual(profile.experience[0].company, "Example GmbH")
        self.assertTrue(profile.experience[0].current)


if __name__ == "__main__":
    unittest.main()
