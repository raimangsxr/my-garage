import google.generativeai as genai
from PIL import Image
import json
from typing import Optional
from pathlib import Path
from app.schemas.invoice_processing import InvoiceExtractedData
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Servicio para procesar facturas con Google Gemini API
    Gemini puede procesar imágenes directamente sin necesidad de OCR separado
    """
    
    # Lista de modelos priorizada para fallback
    AVAILABLE_MODELS = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-flash-lite',
        'gemini-1.5-flash' # Fallback final
    ]

    def __init__(self, api_key: Optional[str] = None):
        # El API key vendrá del token de OAuth del usuario
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
    
    def set_api_key(self, api_key: str):
        """Configura el API key del usuario autenticado"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
    
    async def extract_invoice_data(
        self, 
        file_path: str,
        detailed_mode: bool = False
    ) -> InvoiceExtractedData:
        """
        Procesa una factura (PDF o imagen) con Gemini y extrae datos estructurados
        Implementa estrategia de fallback entre modelos si se excede la cuota.
        """
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
        
        logger.info(f"Processing invoice with Gemini (detailed_mode={detailed_mode}): {file_path}")
        
        # Determinar tipo de archivo
        file_ext = Path(file_path).suffix.lower()
        mime_type = "application/pdf" if file_ext == ".pdf" else "image/jpeg"
        
        # Preparar contenido (se hace una vez)
        content = []
        file_to_delete = None
        
        try:
            # Para PDFs, usamos la File API de Gemini que es más robusta y soporta múltiples páginas
            if file_ext == '.pdf':
                logger.info("Uploading PDF to Gemini File API...")
                file_to_delete = genai.upload_file(file_path, mime_type=mime_type)
                content = [file_to_delete]
            else:
                # Imágenes directas
                image = Image.open(file_path)
                content = [image]
            
            # Crear prompt
            prompt = self._build_extraction_prompt(detailed_mode)
            
            last_error = None
            
            # Loop de intentos con diferentes modelos
            for model_name in self.AVAILABLE_MODELS:
                try:
                    logger.info(f"Attempting extraction with model: {model_name}")
                    
                    model = genai.GenerativeModel(model_name)
                    
                    # Configuración de generación para asegurar JSON
                    generation_config = genai.types.GenerationConfig(
                        temperature=0.1 if detailed_mode else 0.2,
                    )
                    
                    response = model.generate_content(
                        [prompt, *content],
                        generation_config=generation_config
                    )
                    
                    # Si llegamos aquí, funcionó
                    logger.info(f"Success with model {model_name}")
                    logger.info(f"Gemini raw response: {response.text[:200]}...")
                    
                    # Parsear respuesta JSON
                    json_text = response.text.strip()
                    
                    # Remover markdown si existe
                    if json_text.startswith('```json'):
                        json_text = json_text.split('```json')[1].split('```')[0]
                    elif json_text.startswith('```'):
                        json_text = json_text.split('```')[1].split('```')[0]
                    
                    json_text = json_text.strip()
                    
                    data = json.loads(json_text)
                    
                    return InvoiceExtractedData(**data)
                    
                except Exception as e:
                    error_str = str(e)
                    # Verificar si es error de cuota (429)
                    if "429" in error_str or "quota" in error_str.lower() or "ResourceExhausted" in error_str:
                        logger.warning(f"Quota exceeded for model {model_name}. Trying next model...")
                    else:
                        logger.warning(f"Error with model {model_name}: {e}. Trying next model...")
                    
                    last_error = e
                    continue # Intentar siguiente modelo
            
            # Si salimos del loop, todos fallaron
            logger.error("All Gemini models failed.")
            raise ValueError(f"All models failed. Last error: {last_error}")

        except Exception as e:
            logger.error(f"Gemini processing failed: {e}")
            raise ValueError(f"Gemini processing failed: {e}")
            
        finally:
            # Limpiar archivo remoto si se subió
            if file_to_delete:
                try:
                    file_to_delete.delete()
                except:
                    pass
    
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
