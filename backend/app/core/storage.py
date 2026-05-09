import uuid
from pathlib import Path
from fastapi import UploadFile
import mimetypes


class StorageService:
    """Servicio para almacenar archivos subidos."""

    LEGACY_PUBLIC_PREFIX = "/uploads/"
    PUBLIC_PREFIX = "/media/"
    ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md'}
    CHUNK_SIZE = 1024 * 1024  # 1MB

    def __init__(self, upload_dir: str = "media/invoices"):
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
        
        # Guardar archivo en streaming para soportar documentos grandes
        try:
            with open(file_path, "wb") as f:
                while True:
                    chunk = await file.read(self.CHUNK_SIZE)
                    if not chunk:
                        break
                    f.write(chunk)
        except Exception:
            if file_path.exists():
                file_path.unlink()
            raise
        finally:
            await file.close()
        
        # URL relativa para acceder al archivo
        relative_dir = self.upload_dir.as_posix().lstrip("./")
        file_url = f"/{relative_dir}/{unique_filename}"

        return str(file_path), file_url

    def delete_file(self, file_path: str) -> None:
        """Elimina un archivo del almacenamiento"""
        path = Path(file_path)
        if path.exists() and path.is_file():
            path.unlink()

    def resolve_mime_type(self, file_name: str | None) -> str | None:
        if not file_name:
            return None
        guessed_type, _ = mimetypes.guess_type(file_name)
        return guessed_type

    def resolve_file_path(self, file_url: str) -> str:
        normalized_url = file_url.strip()
        if normalized_url.startswith(self.LEGACY_PUBLIC_PREFIX):
            normalized_url = f"{self.PUBLIC_PREFIX}{normalized_url[len(self.LEGACY_PUBLIC_PREFIX):]}"
        return str(Path.cwd() / normalized_url.lstrip("/"))
