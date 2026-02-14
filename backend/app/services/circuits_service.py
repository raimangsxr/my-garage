from datetime import date
from typing import Any, Dict, List, TypedDict

from sqlalchemy import asc, desc
from sqlmodel import Session, select, func

from app.models import TrackRecord, Vehicle


class CircuitSummaryData(TypedDict):
    circuit_name: str
    total_sessions: int
    best_lap_time: str
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


class CircuitDetailData(TypedDict):
    circuit_name: str
    total_sessions: int
    best_lap_time: str
    vehicle_groups: List[VehicleRecordGroupData]


class CircuitsService:
    def list_with_stats(
        self,
        *,
        session: Session,
        skip: int,
        limit: int,
        q: str | None,
        sort_by: str,
        sort_dir: str,
    ) -> tuple[List[CircuitSummaryData], int]:
        grouped_stmt = (
            select(
                TrackRecord.circuit_name.label("circuit_name"),
                func.count(TrackRecord.id).label("total_sessions"),
                func.min(TrackRecord.best_lap_time).label("best_lap_time"),
                func.count(func.distinct(TrackRecord.vehicle_id)).label("vehicle_count"),
                func.max(TrackRecord.date_achieved).label("last_session_date"),
            )
            .group_by(TrackRecord.circuit_name)
        )
        if q:
            grouped_stmt = grouped_stmt.where(TrackRecord.circuit_name.ilike(f"%{q.strip()}%"))

        grouped_subq = grouped_stmt.subquery()
        order_field_map = {
            "circuit_name": grouped_subq.c.circuit_name,
            "total_sessions": grouped_subq.c.total_sessions,
            "best_lap_time": grouped_subq.c.best_lap_time,
            "vehicle_count": grouped_subq.c.vehicle_count,
            "last_session_date": grouped_subq.c.last_session_date,
        }
        order_field = order_field_map.get(sort_by, grouped_subq.c.circuit_name)
        order_expr = desc(order_field) if sort_dir == "desc" else asc(order_field)

        total = session.exec(select(func.count()).select_from(grouped_subq)).one()
        page_stmt = select(grouped_subq).order_by(order_expr).offset(skip).limit(limit)
        rows = session.exec(page_stmt).all()
        if not rows:
            return [], total

        best_time_by_circuit = {row.circuit_name: row.best_lap_time for row in rows}
        circuit_names = list(best_time_by_circuit.keys())
        best_vehicle_candidates_stmt = (
            select(TrackRecord, Vehicle)
            .join(Vehicle, TrackRecord.vehicle_id == Vehicle.id)
            .where(TrackRecord.circuit_name.in_(circuit_names))
            .order_by(TrackRecord.circuit_name.asc(), TrackRecord.best_lap_time.asc(), TrackRecord.id.asc())
        )
        best_vehicle_candidates = session.exec(best_vehicle_candidates_stmt).all()

        best_vehicle_name_by_circuit: Dict[str, str | None] = {
            name: None for name in circuit_names
        }
        for record, vehicle in best_vehicle_candidates:
            expected_best = best_time_by_circuit.get(record.circuit_name)
            if expected_best is None or record.best_lap_time != expected_best:
                continue
            current = best_vehicle_name_by_circuit.get(record.circuit_name)
            if current is None:
                best_vehicle_name_by_circuit[record.circuit_name] = self._vehicle_name(vehicle)

        paged_items = [
            CircuitSummaryData(
                circuit_name=row.circuit_name,
                total_sessions=row.total_sessions,
                best_lap_time=row.best_lap_time,
                best_lap_vehicle_name=best_vehicle_name_by_circuit.get(row.circuit_name),
                vehicle_count=row.vehicle_count,
                last_session_date=row.last_session_date,
            )
            for row in rows
        ]
        return paged_items, total

    def get_detail(self, *, session: Session, circuit_name: str) -> CircuitDetailData:
        statement = (
            select(TrackRecord, Vehicle)
            .join(Vehicle, TrackRecord.vehicle_id == Vehicle.id)
            .where(TrackRecord.circuit_name == circuit_name)
        )
        results = session.exec(statement).all()
        if not results:
            raise LookupError("Circuit not found")

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
            group_data["records"].sort(key=lambda item: item["date_achieved"])

        vehicle_groups = [
            VehicleRecordGroupData(**group_data)
            for group_data in vehicle_groups_dict.values()
        ]
        vehicle_groups.sort(key=lambda item: item["best_lap_time"])

        return CircuitDetailData(
            circuit_name=circuit_name,
            total_sessions=len(results),
            best_lap_time=overall_best_time,
            vehicle_groups=vehicle_groups,
        )

    def _vehicle_name(self, vehicle: Vehicle) -> str:
        full_name = f"{vehicle.brand or ''} {vehicle.model or ''}".strip()
        return full_name or vehicle.license_plate
