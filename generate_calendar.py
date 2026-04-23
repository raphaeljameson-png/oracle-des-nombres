#!/usr/bin/env python3
"""
generate_calendar.py - Génère le calendrier des tirages EuroMillions à venir
sur les 2 prochaines années (mardis et vendredis).

Produit: calendar.json avec { "draws": ["2026-04-24", "2026-04-28", ...] }
"""

import json
from datetime import date, timedelta
from pathlib import Path


def generate_em_calendar(start: date, years: int = 2) -> list[str]:
    """Les tirages EM ont lieu le mardi (weekday=1) et vendredi (weekday=4)."""
    end = start.replace(year=start.year + years)
    draws = []
    d = start
    while d <= end:
        if d.weekday() in (1, 4):
            draws.append(d.isoformat())
        d += timedelta(days=1)
    return draws


if __name__ == "__main__":
    today = date.today()
    # On commence après aujourd'hui
    start = today + timedelta(days=1)
    draws = generate_em_calendar(start, years=2)
    out = Path(__file__).parent / "calendar.json"
    out.write_text(json.dumps({
        "generated_at": today.isoformat(),
        "first_draw": draws[0],
        "last_draw": draws[-1],
        "count": len(draws),
        "draws": draws,
    }, indent=2))
    print(f"Calendrier généré: {len(draws)} tirages de {draws[0]} à {draws[-1]}")
