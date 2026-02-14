#!/usr/bin/env python3
from __future__ import annotations

import urllib.parse
from dataclasses import dataclass

import requests
from sqlmodel import Session, select

from app.database import engine
from app.models.track import Track


WIKIPEDIA_SUMMARY_API = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
USER_AGENT = "my-garage-track-enricher/1.0 (contact: admin@example.com)"


@dataclass(frozen=True)
class WikiPayload:
    description: str | None
    image_url: str | None


TRACK_PAGE_TITLE_MAP: dict[str, str] = {
    "Circuit Ricardo Tormo": "Circuit_Ricardo_Tormo",
    "Portimão": "Algarve_International_Circuit",
    "Circuit de Barcelona-Catalunya": "Circuit_de_Barcelona-Catalunya",
    "Circuito de Jerez": "Circuito_de_Jerez",
    "Circuito del Jarama": "Circuito_del_Jarama",
    "Motorland Aragón": "MotorLand_Aragón",
    "Circuit de Catalunya": "Circuit_de_Barcelona-Catalunya",
    "Estoril": "Estoril_Circuit",
    "Monza": "Autodromo_Nazionale_Monza",
    "Spa-Francorchamps": "Circuit_de_Spa-Francorchamps",
    "Nürburgring": "Nürburgring",
    "Mugello": "Mugello_Circuit",
    "Paul Ricard": "Circuit_Paul_Ricard",
    "Imola": "Imola_Circuit",
    "Red Bull Ring": "Red_Bull_Ring",
    "Zandvoort": "Circuit_Zandvoort",
    "Silverstone": "Silverstone_Circuit",
}


def fetch_wikipedia_payload(page_title: str) -> WikiPayload:
    encoded_title = urllib.parse.quote(page_title, safe="()_-")
    url = WIKIPEDIA_SUMMARY_API.format(title=encoded_title)
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
    response.raise_for_status()
    data = response.json()

    description = (data.get("extract") or "").strip() or None
    image_url = (
        data.get("originalimage", {}).get("source")
        or data.get("thumbnail", {}).get("source")
    )
    return WikiPayload(description=description, image_url=image_url)


def main() -> None:
    updated = 0
    skipped = 0
    failed = 0

    with Session(engine) as session:
        tracks = session.exec(select(Track).order_by(Track.id)).all()
        print(f"Found {len(tracks)} tracks in database")

        for track in tracks:
            page_title = TRACK_PAGE_TITLE_MAP.get(track.name)
            if not page_title:
                print(f"SKIP  | {track.name}: no wikipedia title mapping")
                skipped += 1
                continue

            try:
                payload = fetch_wikipedia_payload(page_title)
            except Exception as exc:  # noqa: BLE001 - keep script resilient per-track
                print(f"FAIL  | {track.name}: {exc}")
                failed += 1
                continue

            if payload.description:
                track.description = payload.description
            if payload.image_url:
                track.image_url = payload.image_url

            session.add(track)
            updated += 1
            print(
                f"OK    | {track.name}: "
                f"description={'yes' if payload.description else 'no'}, "
                f"image={'yes' if payload.image_url else 'no'}"
            )

        session.commit()

    print("")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Failed : {failed}")


if __name__ == "__main__":
    main()
