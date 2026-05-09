from io import BytesIO
from pathlib import Path

import pytest
from fastapi import UploadFile

from app.core.storage import StorageService


@pytest.mark.asyncio
async def test_save_file_stores_new_uploads_under_media(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    service = StorageService()
    upload = UploadFile(filename="invoice.pdf", file=BytesIO(b"test-bytes"))

    file_path, file_url = await service.save_file(upload)

    assert file_url.startswith("/media/invoices/")
    assert Path(file_path).exists()
    assert Path(file_path).parts[:2] == ("media", "invoices")


def test_resolve_file_path_maps_legacy_upload_urls_to_media(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    service = StorageService()

    resolved = service.resolve_file_path("/uploads/invoices/legacy.pdf")

    assert resolved == str(tmp_path / "media" / "invoices" / "legacy.pdf")
