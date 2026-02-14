from typing import Any
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import date, datetime
from dateutil.relativedelta import relativedelta

from app.api import deps
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import Maintenance
from app.models.invoice import Invoice
from app.models.supplier import Supplier
from app.models.track_record import TrackRecord

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard statistics.
    """
    # Total vehicles
    total_vehicles = db.exec(select(func.count(Vehicle.id))).one()
    
    # Scheduled maintenance (future dates)
    today = date.today()
    scheduled_maintenance = db.exec(
        select(func.count(Maintenance.id)).where(Maintenance.date >= today)
    ).one()
    
    # Total spent (sum of all maintenance costs)
    total_spent_result = db.exec(select(func.sum(Maintenance.cost))).one()
    total_spent = total_spent_result if total_spent_result else 0.0
    
    # Recent activity (last 5 maintenance records)
    from sqlalchemy.orm import selectinload
    recent_stmt = (
        select(Maintenance)
        .options(selectinload(Maintenance.vehicle))
        .order_by(Maintenance.date.desc())
        .limit(5)
    )
    recent_maintenances = db.exec(recent_stmt).all()
    
    recent_activity = []
    for m in recent_maintenances:
        recent_activity.append({
            "id": m.id,
            "date": m.date.isoformat(),
            "vehicle_name": f"{m.vehicle.brand} {m.vehicle.model}" if m.vehicle else "Unknown",
            "description": m.description,
            "cost": m.cost,
            "mileage": m.mileage
        })
    
    # Monthly costs for last 6 months (single aggregated query)
    monthly_costs = []
    month_cursor = datetime.now() - relativedelta(months=5)
    first_month_start = date(month_cursor.year, month_cursor.month, 1)

    monthly_totals_stmt = (
        select(
            func.extract("year", Maintenance.date).label("year"),
            func.extract("month", Maintenance.date).label("month"),
            func.coalesce(func.sum(Maintenance.cost), 0.0).label("total"),
        )
        .where(Maintenance.date >= first_month_start)
        .group_by("year", "month")
    )
    monthly_totals_rows = db.exec(monthly_totals_stmt).all()
    monthly_totals_map = {
        (int(year), int(month)): float(total)
        for year, month, total in monthly_totals_rows
    }

    for i in range(5, -1, -1):
        month_date = datetime.now() - relativedelta(months=i)
        month_start = date(month_date.year, month_date.month, 1)
        month_total = monthly_totals_map.get((month_start.year, month_start.month), 0.0)

        monthly_costs.append({
            "month": month_start.strftime("%b %Y"),
            "cost": month_total
        })
    
    # Total suppliers
    total_suppliers = db.exec(select(func.count(Supplier.id))).one()
    
    # Circuit summary statistics (single grouped query)
    circuit_rows = db.exec(
        select(
            TrackRecord.circuit_name,
            func.min(TrackRecord.best_lap_time),
            func.count(TrackRecord.id),
        )
        .where(TrackRecord.circuit_name.is_not(None))
        .group_by(TrackRecord.circuit_name)
        .order_by(TrackRecord.circuit_name)
    ).all()

    best_times_per_circuit = [
        {"circuit_name": circuit_name, "best_time": best_time}
        for circuit_name, best_time, _ in circuit_rows
    ]

    total_track_days = db.exec(select(func.count(TrackRecord.id))).one()

    circuit_summary = {
        "total_circuits": len(circuit_rows),
        "best_times_per_circuit": best_times_per_circuit,
        "total_track_days": total_track_days
    }
    
    return {
        "total_vehicles": total_vehicles,
        "scheduled_maintenance": scheduled_maintenance,
        "total_spent": total_spent,
        "total_suppliers": total_suppliers,
        "recent_activity": recent_activity,
        "monthly_costs": monthly_costs,
        "circuit_summary": circuit_summary
    }
