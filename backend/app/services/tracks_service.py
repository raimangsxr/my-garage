from datetime import date
from typing import Any, Dict, List, TypedDict

from sqlmodel import Session, select, func

from app.models import Track, TrackRecord, Vehicle


class TrackSummaryData(TypedDict):
    id: int
    name: str
    location: str | None
    length_meters: int | None
    total_sessions: int
    best_lap_time: str | None
    best_lap_vehicle_name: str | None
    vehicle_count: int
    last_session_date: date | None


class VehicleRecordGroupData(TypedDict):
    vehicle_id: int
    vehicle_name: str
    vehicle_brand: str | None
    vehicle_model: str | None
    records: List[Dict[str, Any]]
    best_lap_time: str


class TrackDetailData(TypedDict):
    id: int
    name: str
    location: str | None
    length_meters: int | None
    description: str | None
    image_url: str | None
    total_sessions: int
    best_lap_time: str | None
    vehicle_groups: List[VehicleRecordGroupData]


class TracksService:
    def list_with_stats(
        self,
        *,
        session: Session,
        skip: int,
        limit: int,
        q: str | None,
        only_active: bool,
        sort_by: str,
        sort_dir: str,
    ) -> tuple[List[TrackSummaryData], int]:
        sessions_subq = (
            select(func.count(TrackRecord.id))
            .where(TrackRecord.track_id == Track.id)
            .scalar_subquery()
        )
        best_lap_subq = (
            select(func.min(TrackRecord.best_lap_time))
            .where(TrackRecord.track_id == Track.id)
            .scalar_subquery()
        )
        vehicle_count_subq = (
            select(func.count(func.distinct(TrackRecord.vehicle_id)))
            .where(TrackRecord.track_id == Track.id)
            .scalar_subquery()
        )
        last_session_subq = (
            select(func.max(TrackRecord.date_achieved))
            .where(TrackRecord.track_id == Track.id)
            .scalar_subquery()
        )

        filters = []
        if q:
            needle = f"%{q.strip()}%"
            filters.append((Track.name.ilike(needle)) | (Track.location.ilike(needle)))
        if only_active:
            filters.append(sessions_subq > 0)

        order_field_map = {
            "name": Track.name,
            "location": Track.location,
            "length_meters": Track.length_meters,
            "total_sessions": sessions_subq,
            "best_lap_time": best_lap_subq,
            "vehicle_count": vehicle_count_subq,
            "last_session_date": last_session_subq,
            "id": Track.id,
        }
        order_field = order_field_map.get(sort_by, Track.name)
        order_expr = order_field.desc() if sort_dir == "desc" else order_field.asc()

        total_stmt = select(func.count(Track.id))
        if filters:
            total_stmt = total_stmt.where(*filters)
        total = session.exec(total_stmt).one()

        tracks_stmt = select(Track)
        if filters:
            tracks_stmt = tracks_stmt.where(*filters)
        tracks_stmt = tracks_stmt.order_by(order_expr).offset(skip).limit(limit)
        tracks = session.exec(tracks_stmt).all()

        track_ids = [track.id for track in tracks if track.id is not None]
        if not track_ids:
            return [], total

        records_stmt = (
            select(TrackRecord, Vehicle)
            .join(Vehicle, TrackRecord.vehicle_id == Vehicle.id)
            .where(TrackRecord.track_id.in_(track_ids))
        )
        all_records = session.exec(records_stmt).all()
        records_by_track_id: Dict[int, List[tuple[TrackRecord, Vehicle]]] = {}
        for record, vehicle in all_records:
            if record.track_id is None:
                continue
            records_by_track_id.setdefault(record.track_id, []).append((record, vehicle))

        summaries: List[TrackSummaryData] = []
        for track in tracks:
            if track.id is None:
                continue
            results = records_by_track_id.get(track.id, [])
            if not results:
                summaries.append(
                    TrackSummaryData(
                        id=track.id,
                        name=track.name,
                        location=track.location,
                        length_meters=track.length_meters,
                        total_sessions=0,
                        best_lap_time=None,
                        best_lap_vehicle_name=None,
                        vehicle_count=0,
                        last_session_date=None,
                    )
                )
                continue

            best_time = results[0][0].best_lap_time
            best_vehicle = self._vehicle_name(results[0][1])
            last_date = results[0][0].date_achieved
            vehicle_ids = set()

            for record, vehicle in results:
                vehicle_ids.add(vehicle.id)
                if record.best_lap_time < best_time:
                    best_time = record.best_lap_time
                    best_vehicle = self._vehicle_name(vehicle)
                if record.date_achieved > last_date:
                    last_date = record.date_achieved

            summaries.append(
                TrackSummaryData(
                    id=track.id,
                    name=track.name,
                    location=track.location,
                    length_meters=track.length_meters,
                    total_sessions=len(results),
                    best_lap_time=best_time,
                    best_lap_vehicle_name=best_vehicle,
                    vehicle_count=len(vehicle_ids),
                    last_session_date=last_date,
                )
            )

        return summaries, total

    def get_detail(self, *, session: Session, track_id: int) -> TrackDetailData:
        track = session.get(Track, track_id)
        if not track:
            raise LookupError("Track not found")

        statement = (
            select(TrackRecord, Vehicle)
            .join(Vehicle, TrackRecord.vehicle_id == Vehicle.id)
            .where(TrackRecord.track_id == track_id)
        )
        results = session.exec(statement).all()

        if not results:
            return TrackDetailData(
                id=track.id,
                name=track.name,
                location=track.location,
                length_meters=track.length_meters,
                description=track.description,
                image_url=track.image_url,
                total_sessions=0,
                best_lap_time=None,
                vehicle_groups=[],
            )

        vehicle_groups_dict: Dict[int, Dict[str, Any]] = {}
        overall_best_time = results[0][0].best_lap_time

        for record, vehicle in results:
            vehicle_id = vehicle.id
            if vehicle_id not in vehicle_groups_dict:
                vehicle_groups_dict[vehicle_id] = {
                    "vehicle_id": vehicle_id,
                    "vehicle_name": self._vehicle_name(vehicle),
                    "vehicle_brand": vehicle.brand,
                    "vehicle_model": vehicle.model,
                    "records": [],
                    "best_lap_time": record.best_lap_time,
                }

            vehicle_groups_dict[vehicle_id]["records"].append(record.model_dump())

            if record.best_lap_time < vehicle_groups_dict[vehicle_id]["best_lap_time"]:
                vehicle_groups_dict[vehicle_id]["best_lap_time"] = record.best_lap_time
            if record.best_lap_time < overall_best_time:
                overall_best_time = record.best_lap_time

        for group_data in vehicle_groups_dict.values():
            group_data["records"].sort(key=lambda r: r["date_achieved"])

        vehicle_groups = [
            VehicleRecordGroupData(**group_data)
            for group_data in vehicle_groups_dict.values()
        ]
        vehicle_groups.sort(key=lambda g: g["best_lap_time"])

        return TrackDetailData(
            id=track.id,
            name=track.name,
            location=track.location,
            length_meters=track.length_meters,
            description=track.description,
            image_url=track.image_url,
            total_sessions=len(results),
            best_lap_time=overall_best_time,
            vehicle_groups=vehicle_groups,
        )

    def _vehicle_name(self, vehicle: Vehicle) -> str:
        full_name = f"{vehicle.brand or ''} {vehicle.model or ''}".strip()
        return full_name or vehicle.license_plate
