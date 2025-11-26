import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
import mimetypes

class StorageService:
    """Servicio para almacenar archivos de facturas subidas"""
    
    ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def __init__(self, upload_dir: str = "uploads/invoices"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    async def save_file(self, file: UploadFile) -> tuple[str, str]:
        """
        Guarda un archivo y retorna (file_path, file_url)
        
        Args:
            file: Archivo subido por el usuario
            
        Returns:
            tuple: (ruta_absoluta_archivo, url_relativa)
            
        Raises:
            ValueError: Si el archivo no es válido
        """
        # Validar extensión
        file_ext = Path(file.filename or "").suffix.lower()
        if file_ext not in self.ALLOWED_EXTENSIONS:
            raise ValueError(f"File type not allowed: {file_ext}. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}")
        
        # Generar nombre único
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = self.upload_dir / unique_filename
        
        # Guardar archivo
        content = await file.read()
        
        # Validar tamaño
        if len(content) > self.MAX_FILE_SIZE:
            raise ValueError(f"File too large. Maximum size: {self.MAX_FILE_SIZE / 1024 / 1024}MB")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # URL relativa para acceder al archivo
        file_url = f"/uploads/invoices/{unique_filename}"
        
        return str(file_path), file_url
    
    def delete_file(self, file_path: str) -> None:
        """Elimina un archivo del almacenamiento"""
        path = Path(file_path)
        if path.exists() and path.is_file():
            path.unlink()
