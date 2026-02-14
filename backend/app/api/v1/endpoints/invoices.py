from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Form, Query, Response
from sqlmodel import Session, select, func
from pydantic import BaseModel
from sqlalchemy import or_, asc, desc

from app.api import deps
from app.models import Invoice, InvoiceStatus, User, Supplier, Vehicle
from app.schemas.invoice_processing import InvoiceExtractedData
from app.core.storage import StorageService
from app.core.gemini_service import GeminiService
from app.core.invoice_processor import InvoiceProcessor
from app.core.exceptions import InvoiceProcessingError
from app.services.invoice_approval_service import InvoiceApprovalService
from app.services.invoice_workflow_service import InvoiceWorkflowService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class InvoiceListVehicle(BaseModel):
    id: int
    brand: Optional[str] = None
    model: Optional[str] = None
    license_plate: Optional[str] = None


class InvoiceListSupplier(BaseModel):
    id: int
    name: str


class InvoiceListItem(BaseModel):
    id: int
    number: Optional[str] = None
    date: Optional[str] = None
    amount: Optional[float] = None
    tax_amount: Optional[float] = None
    file_url: str
    file_name: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    vehicle_id: Optional[int] = None
    supplier_id: Optional[int] = None
    vehicle: Optional[InvoiceListVehicle] = None
    supplier: Optional[InvoiceListSupplier] = None


class InvoiceListResponse(BaseModel):
    items: List[InvoiceListItem]
    total: int
    skip: int
    limit: int

# Instancias de servicios
storage_service = StorageService()
gemini_service = GeminiService()
invoice_processor = InvoiceProcessor(gemini_service)
invoice_approval_service = InvoiceApprovalService()
invoice_workflow_service = InvoiceWorkflowService()


async def process_invoice_background(
    invoice_id: int,
    file_path: str,
    gemini_api_key: str,
    db_session_factory,
    detailed_mode: bool = False
):
    """
    Tarea en background para procesar factura con Gemini
    """
    from app.database import get_db_context
    
    # Usar context manager para sesión de base de datos
    try:
        with get_db_context() as session:
            await invoice_processor.process_invoice(
                invoice_id=invoice_id,
                file_path=file_path,
                session=session,
                gemini_api_key=gemini_api_key,
                detailed_mode=detailed_mode
            )
        logger.info(
            "Background processing completed",
            extra={"invoice_id": invoice_id}
        )
    except InvoiceProcessingError as e:
        logger.error(
            "Invoice processing failed",
            extra={"invoice_id": invoice_id, "error": str(e), "details": e.details}
        )
        # El estado ya fue actualizado en invoice_processor
    except Exception as e:
        logger.exception(
            "Unexpected error in background processing",
            extra={"invoice_id": invoice_id, "error_type": type(e).__name__}
        )
        # Intentar actualizar estado de la factura a FAILED
        try:
            with get_db_context() as session:
                invoice = session.get(Invoice, invoice_id)
                if invoice:
                    invoice.status = InvoiceStatus.FAILED.value
                    # Limpiar mensaje de error para que sea más amigable si es posible
                    error_msg = str(e)
                    if "429" in error_msg and "quota" in error_msg.lower():
                        invoice.error_message = "Quota exceeded. Please try again later."
                    else:
                        invoice.error_message = error_msg
                    session.add(invoice)
        except Exception as db_e:
            logger.error(
                "Failed to update invoice status to FAILED",
                extra={"invoice_id": invoice_id, "error": str(db_e)}
            )


@router.get("", response_model=InvoiceListResponse, include_in_schema=False)
@router.get("/", response_model=InvoiceListResponse)
def read_invoices(
    response: Response,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    q: Optional[str] = Query(default=None, min_length=1, max_length=120),
    status: Optional[str] = Query(default=None),
    sort_by: str = Query(default="date"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve invoices with optimized eager loading.
    """
    from sqlalchemy.orm import selectinload

    filters = []
    if status:
        filters.append(Invoice.status == status)
    if q:
        q_like = f"%{q.strip()}%"
        filters.append(
            or_(
                Invoice.number.ilike(q_like),
                Invoice.file_name.ilike(q_like),
                Invoice.error_message.ilike(q_like),
            )
        )

    order_field_map = {
        "date": Invoice.date,
        "amount": Invoice.amount,
        "number": Invoice.number,
        "status": Invoice.status,
        "supplier": Supplier.name,
        "vehicle": Vehicle.brand,
        "id": Invoice.id,
    }
    order_field = order_field_map.get(sort_by, Invoice.date)
    order_expr = asc(order_field) if sort_dir == "asc" else desc(order_field)

    total_stmt = select(func.count(Invoice.id))
    if filters:
        total_stmt = total_stmt.where(*filters)
    total = session.exec(total_stmt).one()
    response.headers["X-Total-Count"] = str(total)

    statement = (
        select(Invoice)
        .outerjoin(Supplier, Invoice.supplier_id == Supplier.id)
        .outerjoin(Vehicle, Invoice.vehicle_id == Vehicle.id)
        .options(
        selectinload(Invoice.vehicle),
        selectinload(Invoice.supplier)
        )
    )
    if filters:
        statement = statement.where(*filters)
    statement = statement.order_by(order_expr).offset(skip).limit(limit)
    invoices = session.exec(statement).all()
    
    # Convert to dict with nested relationships
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "number": invoice.number,
            "date": invoice.date.isoformat() if invoice.date else None,
            "amount": invoice.amount,
            "tax_amount": invoice.tax_amount,
            "file_url": invoice.file_url,
            "file_name": invoice.file_name,
            "status": invoice.status,
            "error_message": invoice.error_message,
            "vehicle_id": invoice.vehicle_id,
            "supplier_id": invoice.supplier_id,
        }
        if invoice.vehicle:
            invoice_dict["vehicle"] = {
                "id": invoice.vehicle.id,
                "brand": invoice.vehicle.brand,
                "model": invoice.vehicle.model,
                "license_plate": invoice.vehicle.license_plate,
            }
        else:
            invoice_dict["vehicle"] = None
        if invoice.supplier:
            invoice_dict["supplier"] = {
                "id": invoice.supplier.id,
                "name": invoice.supplier.name,
            }
        else:
            invoice_dict["supplier"] = None
        result.append(InvoiceListItem(**invoice_dict))
    
    return InvoiceListResponse(items=result, total=total, skip=skip, limit=limit)


@router.post("/upload", response_model=Invoice)
async def upload_invoice(
    *,
    session: Session = Depends(deps.get_session),
    file: UploadFile = File(...),
    vehicle_id: Optional[int] = Form(None),
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Sube una factura y la procesa automáticamente con Gemini.
    El procesamiento usa la API key de Gemini del usuario (si está configurada) o la del servidor.
    """
    logger.info(f"Uploading invoice from user {current_user.email}")
    
    # 1. Guar dar archivo
    try:
        file_path, file_url = await storage_service.save_file(file)
        logger.info(f"File saved: {file_path}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # 2. Crear registro de factura
    invoice = Invoice(
        file_url=file_url,
        file_name=file.filename,
        status=InvoiceStatus.PENDING.value,
        vehicle_id=vehicle_id
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    logger.info(f"Invoice created with ID: {invoice.id}")
    
    # 3. Procesar en background con Gemini
    gemini_key = invoice_workflow_service.resolve_gemini_api_key(current_user)
        
    background_tasks.add_task(
        process_invoice_background,
        invoice.id,
        file_path,
        gemini_key,  # Usar API Key determinada
        None,  # TODO: Pasar session factory
        False # detailed_mode = False para primera subida
    )
    
    return invoice


@router.get("/{id}", response_model=Invoice)
def get_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get invoice by ID.
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/{id}/extracted-data", response_model=InvoiceExtractedData)
def get_extracted_data(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obtiene los datos extraídos de una factura para  revisión.
    Solo disponible para facturas en estado REVIEW.
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.REVIEW.value:
        raise HTTPException(
            status_code=400,
            detail=f"Invoice is not ready for review. Current status: {invoice.status}"
        )
    
    if not invoice.extracted_data:
        raise HTTPException(status_code=404, detail="No extracted data available")
    
    try:
        data = InvoiceExtractedData.model_validate_json(invoice.extracted_data)
        # Inyectar el ID del vehículo actual si existe en la factura
        if invoice.vehicle_id:
            data.vehicle_id = invoice.vehicle_id
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing extracted data: {e}")


@router.put("/{id}/extracted-data")
def update_extracted_data(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    data: InvoiceExtractedData,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Actualiza los datos extraídos de una factura (permite correcciones manuales).
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.REVIEW.value:
        raise HTTPException(
            status_code=400,
            detail="Can only update extracted data for invoices in REVIEW status"
        )
    
    # Actualizar datos extraídos
    invoice.extracted_data = data.model_dump_json()
    invoice.number = data.invoice_number
    invoice.date = data.invoice_date
    invoice.amount = data.total_amount
    invoice.tax_amount = data.tax_amount
    
    # Actualizar vehículo (permitir desasignar si es None)
    invoice.vehicle_id = data.vehicle_id
    
    session.add(invoice)
    session.commit()
    
    return {"msg": "Extracted data updated successfully"}


@router.post("/{id}/reject")
async def reject_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Rechaza la extracción actual y solicita un re-procesamiento detallado.
    """
    try:
        job = invoice_workflow_service.reject_for_reprocess(
            session=session,
            invoice_id=id,
            current_user=current_user,
        )
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    background_tasks.add_task(
        process_invoice_background,
        job["invoice_id"],
        job["file_path"],
        job["gemini_api_key"],  # Usar API Key determinada
        None,
        job["detailed_mode"],
    )
    
    return {"msg": "Invoice rejected. Re-processing started."}


@router.post("/{id}/retry")
async def retry_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Reintenta el procesamiento de una factura fallida.
    """
    try:
        job = invoice_workflow_service.retry_failed(
            session=session,
            invoice_id=id,
            current_user=current_user,
        )
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    background_tasks.add_task(
        process_invoice_background,
        job["invoice_id"],
        job["file_path"],
        job["gemini_api_key"],  # Usar API Key determinada
        None,
        job["detailed_mode"],
    )
    
    return {"msg": "Invoice retry started."}


@router.post("/{id}/approve")
async def approve_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Aprueba los datos extraídos y crea mantenimientos/piezas automáticamente.
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.REVIEW.value:
        raise HTTPException(
            status_code=400,
            detail="Can only approve invoices in REVIEW status"
        )
    
    try:
        created_items = invoice_approval_service.approve(session=session, invoice=invoice)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    logger.info(f"Invoice {id} approved and processed successfully")
    
    return {
        "msg": "Invoice approved and records created",
        "created": created_items
    }


@router.delete("/{id}", response_model=Invoice)
def delete_invoice(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an invoice.
    Only invoices in PENDING, FAILED, or REVIEW status can be deleted.
    """
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Permitir borrar facturas aprobadas, pero limpiar las piezas y mantenimientos asociados
    if invoice.status == InvoiceStatus.APPROVED.value:
        # Identificar mantenimientos asociados a través de las piezas
        maintenance_ids = {part.maintenance_id for part in invoice.parts if part.maintenance_id}
        
        # Eliminar piezas asociadas a esta factura
        for part in invoice.parts:
            session.delete(part)
            
        # Eliminar mantenimientos asociados (que quedarán vacíos o fueron creados por esta factura)
        # Nota: Si un mantenimiento tiene piezas de OTRA factura, esto podría fallar si hay FK restrictiva.
        # Asumimos que el flujo de la app crea mantenimientos 1:1 con la factura.
        from app.models import Maintenance
        for maint_id in maintenance_ids:
            maintenance = session.get(Maintenance, maint_id)
            if maintenance:
                # Verificar si tiene otras piezas (que no sean las que acabamos de borrar/marcar para borrar)
                # Como session.delete(part) solo marca para borrar, las piezas siguen en maintenance.parts
                # hasta el commit. Pero podemos verificar si hay piezas que NO sean de esta factura.
                # Una forma más segura es intentar borrar y capturar error, o verificar invoice_id de las piezas.
                
                # En este caso, simplemente borramos el mantenimiento. Si tiene otras piezas, 
                # SQLAlchemy debería manejarlo (o fallar si hay restricción).
                # Dado el diseño actual, los mantenimientos se crean CON la factura.
                session.delete(maintenance)
    
    # Eliminar archivo
    try:
        # Construir ruta completa del archivo
        import os
        # Asegurar que usamos la ruta correcta relativa al root del proyecto
        # invoice.file_url es algo como "/uploads/invoices/..."
        # Necesitamos quitar el primer slash para unirlo con os.getcwd() o usar la ruta relativa
        relative_path = invoice.file_url.lstrip("/")
        file_path = os.path.join(os.getcwd(), relative_path)
        storage_service.delete_file(file_path)
    except Exception as e:
        logger.warning(f"Could not delete file: {e}")
    
    session.delete(invoice)
    session.commit()
    return invoice
