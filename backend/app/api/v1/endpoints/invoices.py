from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.models.invoice import Invoice, InvoiceBase
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Invoice])
def read_invoices(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve invoices.
    """
    statement = select(Invoice).offset(skip).limit(limit)
    invoices = session.exec(statement).all()
    return invoices

@router.post("/", response_model=Invoice)
def create_invoice(
    *,
    session: Session = Depends(deps.get_session),
    invoice_in: InvoiceBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new invoice.
    """
    invoice = Invoice.model_validate(invoice_in)
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice

@router.put("/{id}", response_model=Invoice)
def update_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    invoice_in: InvoiceBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an invoice.
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice_in.model_dump(exclude_unset=True)
    invoice.sqlmodel_update(update_data)
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice

@router.delete("/{id}", response_model=Invoice)
def delete_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an invoice.
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    session.delete(invoice)
    session.commit()
    return invoice
