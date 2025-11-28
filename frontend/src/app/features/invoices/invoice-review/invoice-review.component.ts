import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoiceService, InvoiceExtractedData, Invoice } from '../../../core/services/invoice.service';
import { VehicleService, Vehicle } from '../../../core/services/vehicle.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImageDialogComponent } from '../../../shared/components/image-dialog/image-dialog.component';

@Component({
    selector: 'app-invoice-review',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatDividerModule,
        MatSelectModule,
        MatDialogModule,
        MatTooltipModule
    ],
    templateUrl: './invoice-review.component.html',
    styleUrls: ['./invoice-review.component.scss']
})
export class InvoiceReviewComponent implements OnInit {
    invoiceId: number | null = null;
    invoice: Invoice | null = null;
    reviewForm: FormGroup;
    loading = true;
    approving = false;
    previewUrl: string | null = null;
    vehicles: Vehicle[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private invoiceService: InvoiceService,
        private vehicleService: VehicleService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
        // ... (constructor remains same)
        this.reviewForm = this.fb.group({
            invoice_number: [''],
            invoice_date: [''],
            supplier_name: [''],
            supplier_address: [''],
            supplier_tax_id: [''],
            is_maintenance: [false],
            is_parts_only: [false],
            vehicle_id: [null],
            vehicle_plate: [''],
            vehicle_vin: [''],
            mileage: [null],
            subtotal: [null],
            tax_amount: [null],
            total_amount: [null, Validators.required],
            confidence: [0],
            maintenances: this.fb.array([]),
            parts_only: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadVehicles();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.invoiceId = +params['id'];
                this.loadInvoiceData();
            }
        });
    }

    loadVehicles() {
        this.vehicleService.getVehicles().subscribe({
            next: (vehicles) => this.vehicles = vehicles,
            error: (err) => console.error('Error loading vehicles', err)
        });
    }

    loadInvoiceData() {
        if (!this.invoiceId) return;

        this.loading = true;

        // Load invoice details (for the image)
        this.invoiceService.getInvoice(this.invoiceId).subscribe({
            next: (invoice) => {
                this.invoice = invoice;
                this.previewUrl = invoice.file_url;
            },
            error: (err) => console.error('Error loading invoice details', err)
        });

        // Load extracted data
        this.invoiceService.getExtractedData(this.invoiceId).subscribe({
            next: (data) => {
                this.populateForm(data);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading extracted data', err);
                this.snackBar.open('Error loading invoice data', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    openImagePreview() {
        if (this.previewUrl) {
            this.dialog.open(ImageDialogComponent, {
                data: { imageUrl: this.previewUrl },
                panelClass: 'image-preview-dialog',
                maxWidth: '95vw',
                maxHeight: '95vh'
            });
        }
    }

    populateForm(data: InvoiceExtractedData) {
        this.reviewForm.patchValue({
            invoice_number: data.invoice_number,
            invoice_date: data.invoice_date,
            supplier_name: data.supplier_name,
            supplier_address: data.supplier_address,
            supplier_tax_id: data.supplier_tax_id,
            is_maintenance: data.is_maintenance,
            is_parts_only: data.is_parts_only,
            vehicle_id: data.vehicle_id,
            vehicle_plate: data.vehicle_plate,
            vehicle_vin: data.vehicle_vin,
            mileage: data.mileage,
            subtotal: data.subtotal,
            tax_amount: data.tax_amount,
            total_amount: data.total_amount,
            confidence: data.confidence
        });

        // Maintenances
        const maintenancesArray = this.reviewForm.get('maintenances') as FormArray;
        maintenancesArray.clear();
        data.maintenances.forEach(m => {
            const mGroup = this.fb.group({
                description: [m.description, Validators.required],
                labor_cost: [m.labor_cost],
                parts: this.fb.array([])
            });

            const partsArray = mGroup.get('parts') as FormArray;
            m.parts.forEach(p => {
                partsArray.push(this.fb.group({
                    name: [p.name, Validators.required],
                    reference: [p.reference],
                    quantity: [p.quantity, Validators.required],
                    unit_price: [p.unit_price, Validators.required],
                    total_price: [p.total_price, Validators.required]
                }));
            });

            maintenancesArray.push(mGroup);
        });

        // Parts only
        const partsOnlyArray = this.reviewForm.get('parts_only') as FormArray;
        partsOnlyArray.clear();
        data.parts_only.forEach(p => {
            partsOnlyArray.push(this.fb.group({
                name: [p.name, Validators.required],
                reference: [p.reference],
                quantity: [p.quantity, Validators.required],
                unit_price: [p.unit_price, Validators.required],
                total_price: [p.total_price, Validators.required]
            }));
        });
    }

    get maintenances() {
        return this.reviewForm.get('maintenances') as FormArray;
    }

    getParts(maintenanceIndex: number) {
        return this.maintenances.at(maintenanceIndex).get('parts') as FormArray;
    }

    get partsOnly() {
        return this.reviewForm.get('parts_only') as FormArray;
    }

    get taxRate(): number {
        const subtotal = this.reviewForm.get('subtotal')?.value || 0;
        const tax = this.reviewForm.get('tax_amount')?.value || 0;
        if (!subtotal) return 0;
        return tax / subtotal;
    }

    getAmountAfterTax(amount: number): number {
        return amount * (1 + this.taxRate);
    }

    get isTotalValid(): boolean {
        const subtotal = this.reviewForm.get('subtotal')?.value || 0;
        const tax = this.reviewForm.get('tax_amount')?.value || 0;
        const total = this.reviewForm.get('total_amount')?.value || 0;

        // Allow small rounding difference (e.g. 0.05)
        return Math.abs((subtotal + tax) - total) < 0.05;
    }

    approveInvoice() {
        if (!this.invoiceId || this.reviewForm.invalid) return;

        if (!this.isTotalValid) {
            if (!confirm('The sum of Subtotal + Tax does not match the Total Amount. Do you want to proceed anyway?')) {
                return;
            }
        }

        this.approving = true;

        // First update the data with what's in the form
        const formData = this.reviewForm.value;

        this.invoiceService.updateExtractedData(this.invoiceId, formData).subscribe({
            next: () => {
                // Then approve
                this.invoiceService.approveInvoice(this.invoiceId!).subscribe({
                    next: () => {
                        this.approving = false;
                        this.snackBar.open('Invoice approved successfully!', 'Close', { duration: 3000 });
                        this.router.navigate(['/invoices']);
                    },
                    error: (err) => {
                        this.approving = false;
                        console.error('Error approving invoice', err);
                        this.snackBar.open('Error approving invoice', 'Close', { duration: 3000 });
                    }
                });
            },
            error: (err) => {
                this.approving = false;
                console.error('Error updating data', err);
                this.snackBar.open('Error saving changes', 'Close', { duration: 3000 });
            }
        });
    }

    rejectInvoice() {
        if (!this.invoiceId) return;

        if (confirm('Are you sure you want to reject this invoice? It will be re-processed with a more detailed analysis.')) {
            this.loading = true;
            this.invoiceService.rejectInvoice(this.invoiceId).subscribe({
                next: () => {
                    this.snackBar.open('Invoice rejected. Re-processing started...', 'Close', { duration: 3000 });
                    this.router.navigate(['/invoices']);
                },
                error: (err) => {
                    this.loading = false;
                    console.error('Error rejecting invoice', err);
                    this.snackBar.open('Error rejecting invoice', 'Close', { duration: 3000 });
                }
            });
        }
    }
}
