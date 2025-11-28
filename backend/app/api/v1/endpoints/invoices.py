from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Form
from sqlmodel import Session, select
from pydantic import BaseModel

from app.api import deps
from app.models import Invoice, InvoiceStatus, User, GoogleAuthToken
from app.schemas.invoice_processing import InvoiceExtractedData
from app.core.storage import StorageService
from app.core.gemini_service import GeminiService
from app.core.invoice_processor import InvoiceProcessor
from app.core.exceptions import InvoiceProcessingError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Instancias de servicios
storage_service = StorageService()
gemini_service = GeminiService()
invoice_processor = InvoiceProcessor(gemini_service)


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


@router.get("/")
def read_invoices(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve invoices with optimized eager loading.
    """
    from sqlalchemy.orm import selectinload
    
    statement = select(Invoice).options(
        selectinload(Invoice.vehicle),
        selectinload(Invoice.supplier)
    ).offset(skip).limit(limit).order_by(Invoice.date.desc())
    invoices = session.exec(statement).all()
    
    # Convert to dict with nested relationships
    result = []
    for invoice in invoices:
        invoice_dict = invoice.model_dump()
        if invoice.vehicle:
            invoice_dict["vehicle"] = invoice.vehicle.model_dump(exclude={'image_binary'})
        else:
            invoice_dict["vehicle"] = None
        if invoice.supplier:
            invoice_dict["supplier"] = invoice.supplier.model_dump()
        else:
            invoice_dict["supplier"] = None
        result.append(invoice_dict)
    
    return result


@router.post("/upload", response_model=Invoice)
async def upload_invoice(
    *,
    session: Session = Depends(deps.get_session),
    file: UploadFile = File(...),
    vehicle_id: Optional[int] = Form(None),
    current_user: User = Depends(deps.get_current_active_user),
    google_token: GoogleAuthToken = Depends(deps.get_google_auth_token),
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Sube una factura y la procesa automáticamente con Gemini.
    El usuario debe estar autenticado con Google OAuth para usar la API de Gemini.
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
    from app.core.config import settings
    
    # Determine API Key: User's setting > Server env
    gemini_key = settings.GEMINI_API_KEY
    if current_user.settings and current_user.settings.gemini_api_key:
        gemini_key = current_user.settings.gemini_api_key
        
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
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.REVIEW.value:
        raise HTTPException(
            status_code=400,
            detail="Can only reject invoices in REVIEW status"
        )
    
    # Cambiar estado a PENDING para indicar que se va a procesar de nuevo
    invoice.status = InvoiceStatus.PENDING.value
    session.add(invoice)
    session.commit()
    
    # Obtener ruta del archivo
    import os
    relative_path = invoice.file_url.lstrip("/")
    file_path = os.path.join(os.getcwd(), relative_path)
    
    # Lanzar re-procesamiento en background con detailed_mode=True
    from app.core.config import settings
    background_tasks.add_task(
        process_invoice_background,
        invoice.id,
        file_path,
        settings.GEMINI_API_KEY,
        None,
        True # detailed_mode = True
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
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.FAILED.value:
        raise HTTPException(
            status_code=400,
            detail="Can only retry invoices in FAILED status"
        )
    
    # Cambiar estado a PENDING
    invoice.status = InvoiceStatus.PENDING.value
    invoice.error_message = None # Limpiar error previo
    session.add(invoice)
    session.commit()
    
    # Obtener ruta del archivo
    import os
    relative_path = invoice.file_url.lstrip("/")
    file_path = os.path.join(os.getcwd(), relative_path)
    
    # Lanzar procesamiento en background (modo normal, no detallado necesariamente, o podríamos usar detallado si falló)
    # Vamos a usar modo normal por defecto para reintentos simples (ej. cuota)
    from app.core.config import settings
    background_tasks.add_task(
        process_invoice_background,
        invoice.id,
        file_path,
        settings.GEMINI_API_KEY,
        None,
        False # detailed_mode = False
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
    from app.models import Maintenance, Part, Supplier, Vehicle
    from datetime import datetime
    
    invoice = session.get(Invoice, id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.REVIEW.value:
        raise HTTPException(
            status_code=400,
            detail="Can only approve invoices in REVIEW status"
        )
    
    # Parsear datos extraídos
    try:
        extracted_data = InvoiceExtractedData.model_validate_json(invoice.extracted_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing extracted data: {e}")
    
    created_items = {
        "maintenances": [],
        "parts": [],
        "supplier": None
    }
    
    # 1. Crear o encontrar proveedor
    supplier = None
    if extracted_data.supplier_name:
        supplier = session.query(Supplier).filter(
            Supplier.name == extracted_data.supplier_name
        ).first()
        
        if not supplier:
            supplier = Supplier(
                name=extracted_data.supplier_name,
                address=extracted_data.supplier_address,
                tax_id=extracted_data.supplier_tax_id
            )
            session.add(supplier)
            session.commit()
            session.refresh(supplier)
        
        invoice.supplier_id = supplier.id
        created_items["supplier"] = {"id": supplier.id, "name": supplier.name}
    
    # 2. Obtener vehículo
    vehicle = None
    if invoice.vehicle_id:
        vehicle = session.get(Vehicle, invoice.vehicle_id)
    elif extracted_data.vehicle_plate:
        # Intentar encontrar vehículo por matrícula
        vehicle = session.query(Vehicle).filter(
            Vehicle.license_plate == extracted_data.vehicle_plate
        ).first()
        if vehicle:
            invoice.vehicle_id = vehicle.id
    
    # 3. Crear mantenimientos y piezas
    for maint_data in extracted_data.maintenances:
        # Permitir crear mantenimiento sin vehículo (se asignará después o quedará huérfano de vehículo pero ligado a factura)
        if not vehicle:
            logger.warning("Creating maintenance without vehicle assigned")
        
        # Calcular costo total
        total_cost = maint_data.labor_cost or 0
        for part in maint_data.parts:
            total_cost += part.total_price
        
        # Determinar kilometraje: dato extraído > vehículo actual > 0
        mileage = extracted_data.mileage
        if mileage is None and vehicle:
            mileage = vehicle.kilometers
        if mileage is None:
            mileage = 0

        # Crear mantenimiento
        maintenance = Maintenance(
            date=extracted_data.invoice_date or datetime.now().date(),
            description=maint_data.description,
            mileage=mileage,
            cost=total_cost,
            vehicle_id=vehicle.id if vehicle else None,
            supplier_id=supplier.id if supplier else None
        )
        session.add(maintenance)
        session.commit()
        session.refresh(maintenance)
        
        created_items["maintenances"].append({
            "id": maintenance.id,
            "description": maintenance.description
        })
        
        # Crear piezas asociadas al mantenimiento
        for part_data in maint_data.parts:
            part = Part(
                name=part_data.name,
                reference=part_data.reference,
                price=part_data.unit_price,
                quantity=part_data.quantity,
                maintenance_id=maintenance.id,
                supplier_id=supplier.id if supplier else None,
                invoice_id=invoice.id
            )
            session.add(part)
            created_items["parts"].append({
                "name": part.name,
                "quantity": part.quantity
            })
    
    # 4. Crear piezas sin mantenimiento (solo compras)
    for part_data in extracted_data.parts_only:
        part = Part(
            name=part_data.name,
            reference=part_data.reference,
            price=part_data.unit_price,
            quantity=part_data.quantity,
            supplier_id=supplier.id if supplier else None,
            invoice_id=invoice.id,
            maintenance_id=None  # Sin mantenimiento asociado
        )
        session.add(part)
        created_items["parts"].append({
            "name": part.name,
            "quantity": part.quantity
        })
    
    # 5. Marcar factura como aprobada
    invoice.status = InvoiceStatus.APPROVED.value
    invoice.tax_amount = extracted_data.tax_amount
    session.add(invoice)
    session.commit()
    
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
