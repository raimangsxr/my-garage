import asyncio
import os
from dotenv import load_dotenv
from app.core.gemini_service import GeminiService
from app.schemas.invoice_processing import InvoiceExtractedData
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_processing():
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env")
        return

    service = GeminiService(api_key=api_key)
    
    # Path to the user provided image
    image_path = "/Users/rromanit/.gemini/antigravity/brain/4dfce37e-c5c0-4fff-b5f4-a01d6a1ac7b8/uploaded_image_1763951452593.jpg"
    
    print(f"Processing image: {image_path}")
    
    try:
        result = await service.extract_invoice_data(image_path)
        print("\n--- Extraction Success ---")
        print(result.model_dump_json(indent=2))
        print("--------------------------")
    except Exception as e:
        print(f"\n--- Extraction Failed ---")
        print(f"Error: {e}")
        print("-------------------------")

if __name__ == "__main__":
    asyncio.run(test_processing())
