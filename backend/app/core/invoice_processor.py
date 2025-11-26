from app.models.invoice import Invoice, InvoiceStatus
from app.schemas.invoice_processing import InvoiceExtractedData
from app.core.gemini_service import GeminiService
from sqlmodel import Session
import logging

logger = logging.getLogger(__name__)

class InvoiceProcessor:
    """Orquestador del procesamiento completo de facturas"""
    
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service
    
    async def process_invoice(
        self, 
        invoice_id: int,
        file_path: str,
        session: Session,
        gemini_api_key: str,
        detailed_mode: bool = False
    ) -> InvoiceExtractedData:
        """
        Procesa una factura completa con Gemini
        
        Args:
            invoice_id: ID de la factura a procesar
            file_path: Ruta al archivo de la factura
            session: Sesión de base de datos
            gemini_api_key: API key de Gemini del usuario
            detailed_mode: Si es True, usa un prompt más exhaustivo (para reintentos)
            
        Returns:
            InvoiceExtractedData: Datos extraídos
            
        Raises:
            ValueError: Si hay error en el procesamiento
        """
        invoice = session.get(Invoice, invoice_id)
        if not invoice:
            raise ValueError(f"Invoice {invoice_id} not found")
        
        try:
            logger.info(f"Starting processing for invoice {invoice_id} (detailed={detailed_mode})")
            
            # 1. Configurar Gemini con el API key del usuario
            self.gemini_service.set_api_key(gemini_api_key)
            
            # 2. Cambiar estado a PROCESSING
            invoice.status = InvoiceStatus.PROCESSING.value
            session.add(invoice)
            session.commit()
            
            # 3. Procesar con Gemini (multimodal)
            extracted_data = await self.gemini_service.extract_invoice_data(file_path, detailed_mode)
            
            logger.info(f"Extraction successful for invoice {invoice_id}")
            
            # 4. Actualizar invoice con datos extraídos
            invoice.extracted_data = extracted_data.model_dump_json()
            invoice.number = extracted_data.invoice_number
            invoice.date = extracted_data.invoice_date
            invoice.amount = extracted_data.total_amount
            invoice.status = InvoiceStatus.REVIEW.value
            
            session.add(invoice)
            session.commit()
            session.refresh(invoice)
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error processing invoice {invoice_id}: {e}")
            invoice.status = InvoiceStatus.FAILED.value
            invoice.error_message = str(e)
            session.add(invoice)
            session.commit()
            raise
