from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from app.models import Invoice, InvoiceStatus, Maintenance, Part, Supplier, Vehicle
from app.schemas.invoice_processing import InvoiceExtractedData


class InvoiceApprovalService:
    def approve(self, session: Session, invoice: Invoice) -> dict[str, Any]:
        if invoice.status != InvoiceStatus.REVIEW.value:
            raise ValueError("Can only approve invoices in REVIEW status")

        try:
            extracted_data = InvoiceExtractedData.model_validate_json(invoice.extracted_data)
        except Exception as exc:
            raise ValueError(f"Error parsing extracted data: {exc}") from exc

        created_items: dict[str, Any] = {
            "maintenances": [],
            "parts": [],
            "supplier": None,
        }

        supplier = None
        if extracted_data.supplier_name:
            supplier = session.exec(
                select(Supplier).where(Supplier.name == extracted_data.supplier_name)
            ).first()
            if not supplier:
                supplier = Supplier(
                    name=extracted_data.supplier_name,
                    address=extracted_data.supplier_address,
                    tax_id=extracted_data.supplier_tax_id,
                )
                session.add(supplier)
                session.flush()

            invoice.supplier_id = supplier.id
            created_items["supplier"] = {"id": supplier.id, "name": supplier.name}

        vehicle = None
        if invoice.vehicle_id:
            vehicle = session.get(Vehicle, invoice.vehicle_id)
        elif extracted_data.vehicle_plate:
            vehicle = session.exec(
                select(Vehicle).where(Vehicle.license_plate == extracted_data.vehicle_plate)
            ).first()
            if vehicle:
                invoice.vehicle_id = vehicle.id

        for maint_data in extracted_data.maintenances:
            total_cost = (maint_data.labor_cost or 0) + sum(part.total_price for part in maint_data.parts)
            mileage = extracted_data.mileage
            if mileage is None and vehicle:
                mileage = vehicle.kilometers
            if mileage is None:
                mileage = 0

            maintenance = Maintenance(
                date=extracted_data.invoice_date or datetime.now().date(),
                description=maint_data.description,
                mileage=mileage,
                cost=total_cost,
                vehicle_id=vehicle.id if vehicle else None,
                supplier_id=supplier.id if supplier else None,
            )
            session.add(maintenance)
            session.flush()

            created_items["maintenances"].append({
                "id": maintenance.id,
                "description": maintenance.description,
            })

            for part_data in maint_data.parts:
                part = Part(
                    name=part_data.name,
                    reference=part_data.reference,
                    price=part_data.unit_price,
                    quantity=part_data.quantity,
                    maintenance_id=maintenance.id,
                    supplier_id=supplier.id if supplier else None,
                    invoice_id=invoice.id,
                )
                session.add(part)
                created_items["parts"].append({"name": part.name, "quantity": part.quantity})

        for part_data in extracted_data.parts_only:
            part = Part(
                name=part_data.name,
                reference=part_data.reference,
                price=part_data.unit_price,
                quantity=part_data.quantity,
                supplier_id=supplier.id if supplier else None,
                invoice_id=invoice.id,
                maintenance_id=None,
            )
            session.add(part)
            created_items["parts"].append({"name": part.name, "quantity": part.quantity})

        invoice.status = InvoiceStatus.APPROVED.value
        invoice.tax_amount = extracted_data.tax_amount
        session.add(invoice)
        session.commit()

        return created_items
