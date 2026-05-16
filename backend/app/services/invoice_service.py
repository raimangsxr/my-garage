from __future__ import annotations

import logging

from sqlmodel import Session

from app.core.exceptions import DatabaseError, InvoiceProcessingError
from app.core.gemini_service import GeminiService
from app.models.invoice import Invoice, InvoiceStatus
from app.schemas.invoice_processing import InvoiceExtractedData

logger = logging.getLogger(__name__)


class InvoiceService:
    """Domain service for invoice extraction and processing orchestration."""

    EXTRACTION_MODELS = [
        "gemini-3.1-flash-lite",
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ]

    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    async def process_invoice(
        self,
        invoice_id: int,
        file_path: str,
        session: Session,
        gemini_api_key: str,
        detailed_mode: bool = False,
    ) -> InvoiceExtractedData:
        invoice = session.get(Invoice, invoice_id)
        if not invoice:
            raise DatabaseError(f"Invoice {invoice_id} not found")

        try:
            logger.info(
                f"Starting processing for invoice {invoice_id}",
                extra={"invoice_id": invoice_id, "detailed_mode": detailed_mode},
            )

            invoice.status = InvoiceStatus.PROCESSING.value
            session.add(invoice)
            session.commit()

            extracted_data = self.extract_invoice_data(
                file_path=file_path,
                api_key=gemini_api_key,
                detailed_mode=detailed_mode,
            )

            logger.info(
                f"Extraction successful for invoice {invoice_id}",
                extra={"invoice_id": invoice_id},
            )

            invoice.extracted_data = extracted_data.model_dump_json()
            invoice.number = extracted_data.invoice_number
            invoice.date = extracted_data.invoice_date
            invoice.amount = extracted_data.total_amount
            invoice.status = InvoiceStatus.REVIEW.value

            session.add(invoice)
            session.commit()
            session.refresh(invoice)

            return extracted_data
        except Exception as exc:
            logger.exception(
                f"Error processing invoice {invoice_id}",
                extra={"invoice_id": invoice_id, "error_type": type(exc).__name__},
            )
            invoice.status = InvoiceStatus.FAILED.value
            invoice.error_message = str(exc)
            session.add(invoice)
            session.commit()
            raise InvoiceProcessingError(f"Failed to process invoice: {str(exc)}", {"invoice_id": invoice_id})

    def extract_invoice_data(
        self,
        *,
        file_path: str,
        api_key: str,
        detailed_mode: bool = False,
    ) -> InvoiceExtractedData:
        logger.info("Processing invoice with Gemini", extra={"file_path": file_path, "detailed_mode": detailed_mode})

        with self.gemini_service.multimodal_content(file_path=file_path, api_key=api_key) as content:
            payload = self.gemini_service.generate_json_payload(
                prompt=self._build_extraction_prompt(detailed_mode),
                content=content,
                models=self.EXTRACTION_MODELS,
                api_key=api_key,
                temperature=0.1 if detailed_mode else 0.2,
            )
        return InvoiceExtractedData(**payload)

    def _build_extraction_prompt(self, detailed_mode: bool = False) -> str:
        base_prompt = """
Analiza esta factura y extrae TODA la información en formato JSON estricto.

**IMPORTANTE**: Responde ÚNICAMENTE con JSON válido, sin texto adicional.
"""

        if detailed_mode:
            base_prompt += """
**MODO DETALLADO**: Esta factura ha sido rechazada previamente por errores en la extracción.
Por favor, realiza un análisis EXHAUSTIVO y CRÍTICO de cada campo.
- Verifica doblemente los números, fechas y totales.
- Asegúrate de distinguir correctamente entre mano de obra (mantenimiento) y compra de piezas.
- Busca detalles sutiles que se hayan podido pasar por alto.
- Si hay ambigüedad, prefiere la interpretación más lógica basada en el contexto de un taller mecánico.
"""

        base_prompt += """
**CLASIFICACIÓN DE LA FACTURA (MUY IMPORTANTE):**

Debes determinar si esta factura corresponde a:

A) SERVICIO DE MANTENIMIENTO (is_maintenance=true):
   La factura incluye trabajo/servicios realizados en un vehículo.

   **Indicadores clave de mantenimiento:**
   - Mano de obra / Labor / Servicio
   - Palabras de acción: "Cambio de...", "Reparación de...", "Instalación de...", "Revisión de...", "Sustitución de..."
   - Servicios: "Cambio de aceite", "Alineación", "Balanceo", "Diagnóstico", "Revisión pre-ITV"
   - Trabajos mecánicos: "Reparación de frenos", "Cambio de correa de distribución"
   - Puede incluir piezas utilizadas durante el servicio

   **Acción:** Poblar el array "maintenances" con:
   - description: descripción del trabajo/servicio realizado
   - labor_cost: costo de mano de obra (si aparece separado)
   - parts: array con las piezas utilizadas en el servicio

B) COMPRA DE PIEZAS (is_parts_only=true):
   Solo adquisición de repuestos/piezas sin servicio de instalación o trabajo asociado.

   **Indicadores clave de compra:**
   - Solo productos/artículos listados
   - Sin cargos de mano de obra
   - Palabras como: "Venta", "Compra", "Suministro", "Producto"
   - Descripciones simples: "Filtro de aceite", "Pastillas de freno", "Neumático 205/55R16"
   - Facturas de distribuidores de repuestos o tiendas de autopartes

   **Acción:** Poblar el array "parts_only" con las piezas adquiridas

**REGLA DE DECISIÓN (sigue este orden):**
1. ¿Hay cargo por mano de obra/servicio? → SÍ = is_maintenance=true
2. ¿Hay palabras de acción (cambio, reparación, instalación, revisión)? → SÍ = is_maintenance=true
3. ¿Solo hay productos/piezas sin servicio asociado? → SÍ = is_parts_only=true
4. **IMPORTANTE:** is_maintenance e is_parts_only son MUTUAMENTE EXCLUYENTES (solo uno puede ser true)

**Ejemplos:**
- "Cambio de aceite y filtros - Mano de obra: 25€, Filtro: 15€" → is_maintenance=true
- "Reparación de sistema de frenos" → is_maintenance=true
- "Filtro de aceite Mann W920/21" (sin instalación) → is_parts_only=true
- "4x Neumáticos Michelin 205/55R16" (sin montaje mencionado) → is_parts_only=true

Estructura del JSON:
{
    "invoice_number": "string o null",
    "invoice_date": "YYYY-MM-DD o null",
    "supplier_name": "string o null",
    "supplier_address": "string o null",
    "supplier_tax_id": "string o null (NIF/CIF)",

    "is_maintenance": boolean (true si incluye mano de obra/reparación),
    "is_parts_only": boolean (true si solo compra de piezas),

    "vehicle_plate": "string o null (matrícula si aparece)",
    "vehicle_vin": "string o null (VIN/bastidor si aparece)",
    "mileage": number o null (kilometraje si aparece),

    "maintenances": [
        {
            "description": "string (descripción del trabajo)",
            "labor_cost": number o null,
            "parts": [
                {
                    "name": "string",
                    "reference": "string o null",
                    "quantity": number,
                    "unit_price": number,
                    "total_price": number
                }
            ]
        }
    ],

    "parts_only": [
        {
            "name": "string",
            "reference": "string o null",
            "quantity": number,
            "unit_price": number,
            "total_price": number
        }
    ],

    "subtotal": number o null,
    "tax_amount": number o null (IVA),
    "total_amount": number,

    "confidence": number entre 0 y 1 (tu confianza en la extracción)
}

**Reglas:**
- Si es mantenimiento: usa "maintenances" con descripción del trabajo y piezas asociadas
- Si solo son piezas: usa "parts_only"
- Extrae TODOS los conceptos, piezas y precios que veas
- Si no encuentras un dato, usa null
- Los precios deben ser números (float), sin símbolos de moneda
- Las fechas en formato ISO: YYYY-MM-DD
- **IMPORTANTE**: Si hay múltiples servicios/trabajos en la factura, DEBES consolidarlos en UN SOLO objeto en "maintenances"
  - Crea una descripción resumida que sintetice TODOS los trabajos realizados en una sola frase (ej: "Cambio de aceite, filtros y revisión de frenos")
  - Suma TODOS los costos de mano de obra en un único "labor_cost"
  - Agrupa TODAS las piezas utilizadas en un único array "parts"
  - El array "maintenances" debe contener MÁXIMO 1 elemento
"""
        return base_prompt
