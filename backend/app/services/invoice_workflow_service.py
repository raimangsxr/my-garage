import os
from typing import TypedDict

from sqlmodel import Session

from app.core.config import settings
from app.models import Invoice, InvoiceStatus, User


class InvoiceProcessingJob(TypedDict):
    invoice_id: int
    file_path: str
    gemini_api_key: str
    detailed_mode: bool


class InvoiceWorkflowService:
    def reject_for_reprocess(
        self,
        *,
        session: Session,
        invoice_id: int,
        current_user: User,
    ) -> InvoiceProcessingJob:
        invoice = session.get(Invoice, invoice_id)
        if not invoice:
            raise LookupError("Invoice not found")
        if invoice.status != InvoiceStatus.REVIEW.value:
            raise ValueError("Can only reject invoices in REVIEW status")

        invoice.status = InvoiceStatus.PENDING.value
        session.add(invoice)
        session.commit()

        return self._build_processing_job(
            invoice=invoice,
            current_user=current_user,
            detailed_mode=True,
        )

    def retry_failed(
        self,
        *,
        session: Session,
        invoice_id: int,
        current_user: User,
    ) -> InvoiceProcessingJob:
        invoice = session.get(Invoice, invoice_id)
        if not invoice:
            raise LookupError("Invoice not found")
        if invoice.status != InvoiceStatus.FAILED.value:
            raise ValueError("Can only retry invoices in FAILED status")

        invoice.status = InvoiceStatus.PENDING.value
        invoice.error_message = None
        session.add(invoice)
        session.commit()

        return self._build_processing_job(
            invoice=invoice,
            current_user=current_user,
            detailed_mode=False,
        )

    def resolve_gemini_api_key(self, current_user: User) -> str:
        user_settings = getattr(current_user, "settings", None)
        if user_settings and user_settings.gemini_api_key:
            return user_settings.gemini_api_key
        return settings.GEMINI_API_KEY

    def resolve_file_path(self, file_url: str) -> str:
        relative_path = file_url.lstrip("/")
        return os.path.join(os.getcwd(), relative_path)

    def _build_processing_job(
        self,
        *,
        invoice: Invoice,
        current_user: User,
        detailed_mode: bool,
    ) -> InvoiceProcessingJob:
        if invoice.id is None:
            raise ValueError("Invoice has no identifier")
        return InvoiceProcessingJob(
            invoice_id=invoice.id,
            file_path=self.resolve_file_path(invoice.file_url),
            gemini_api_key=self.resolve_gemini_api_key(current_user),
            detailed_mode=detailed_mode,
        )
