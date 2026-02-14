from sqlmodel import Session, select

from app.models import Track, TrackRecord, TrackRecordCreate, TrackRecordUpdate, Vehicle


class TrackRecordsService:
    def list_for_vehicle(self, *, session: Session, vehicle_id: int) -> list[TrackRecord]:
        vehicle = session.get(Vehicle, vehicle_id)
        if not vehicle:
            raise LookupError("Vehicle not found")

        statement = (
            select(TrackRecord)
            .where(TrackRecord.vehicle_id == vehicle_id)
            .order_by(TrackRecord.date_achieved.desc(), TrackRecord.id.desc())
        )
        return list(session.exec(statement).all())

    def create_for_vehicle(
        self,
        *,
        session: Session,
        vehicle_id: int,
        payload: TrackRecordCreate,
    ) -> TrackRecord:
        vehicle = session.get(Vehicle, vehicle_id)
        if not vehicle:
            raise LookupError("Vehicle not found")

        record_data = payload.model_dump()
        self._sync_track_fields(session=session, record_data=record_data)

        record = TrackRecord(vehicle_id=vehicle_id, **record_data)
        session.add(record)
        session.commit()
        session.refresh(record)
        return record

    def update(self, *, session: Session, record_id: int, payload: TrackRecordUpdate) -> TrackRecord:
        record = session.get(TrackRecord, record_id)
        if not record:
            raise LookupError("Track record not found")

        update_data = payload.model_dump(exclude_unset=True)
        self._sync_track_fields(session=session, record_data=update_data)
        for key, value in update_data.items():
            setattr(record, key, value)

        session.add(record)
        session.commit()
        session.refresh(record)
        return record

    def delete(self, *, session: Session, record_id: int) -> TrackRecord:
        record = session.get(TrackRecord, record_id)
        if not record:
            raise LookupError("Track record not found")

        session.delete(record)
        session.commit()
        return record

    def _sync_track_fields(self, *, session: Session, record_data: dict) -> None:
        track_id = record_data.get("track_id")
        circuit_name = record_data.get("circuit_name")

        if track_id:
            track = session.get(Track, track_id)
            if track:
                record_data["circuit_name"] = track.name
            return

        if not circuit_name:
            return

        track = session.exec(select(Track).where(Track.name == circuit_name)).first()
        if not track:
            track = Track(name=circuit_name)
            session.add(track)
            session.flush()

        record_data["track_id"] = track.id
