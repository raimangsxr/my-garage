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
    
    # Monthly costs for last 6 months
    monthly_costs = []
    for i in range(5, -1, -1):
        month_date = datetime.now() - relativedelta(months=i)
        month_start = date(month_date.year, month_date.month, 1)
        
        if i == 0:
            month_end = date.today()
        else:
            next_month = month_start + relativedelta(months=1)
            month_end = next_month - relativedelta(days=1)
        
        month_total_result = db.exec(
            select(func.sum(Maintenance.cost))
            .where(Maintenance.date >= month_start)
            .where(Maintenance.date <= month_end)
        ).one()
        
        month_total = month_total_result if month_total_result else 0.0
        
        monthly_costs.append({
            "month": month_start.strftime("%b %Y"),
            "cost": month_total
        })
    
    # Total suppliers
    total_suppliers = db.exec(select(func.count(Supplier.id))).one()
    
    # Circuit summary statistics
    from app.models.track_record import TrackRecord
    
    # Get all track records with circuit information
    track_records = db.exec(select(TrackRecord)).all()
    
    # Calculate circuit statistics
    circuit_data = {}
    for record in track_records:
        circuit_name = record.circuit_name
        if circuit_name not in circuit_data:
            circuit_data[circuit_name] = []
        circuit_data[circuit_name].append(record.best_lap_time)
    
    # Get best time for each circuit
    best_times_per_circuit = []
    for circuit_name, times in circuit_data.items():
        # Sort times to get the best (minimum) time
        sorted_times = sorted(times)
        best_times_per_circuit.append({
            "circuit_name": circuit_name,
            "best_time": sorted_times[0] if sorted_times else None
        })
    
    # Sort by circuit name for consistent display
    best_times_per_circuit.sort(key=lambda x: x["circuit_name"])
    
    circuit_summary = {
        "total_circuits": len(circuit_data),
        "best_times_per_circuit": best_times_per_circuit,
        "total_track_days": len(track_records)
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
