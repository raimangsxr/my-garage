import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { TrackRecord } from '../../../../core/services/vehicle.service';
import { OrganizerService } from '../../../../services/organizer.service';

// Popular Spanish and European circuits
const POPULAR_CIRCUITS = [
  'Circuit de Barcelona-Catalunya',
  'Circuito de Jerez',
  'Circuit Ricardo Tormo',
  'Circuito del Jarama',
  'Motorland Aragón',
  'Circuit de Catalunya',
  'Portimão',
  'Estoril',
  'Monza',
  'Spa-Francorchamps',
  'Nürburgring',
  'Mugello',
  'Paul Ricard',
  'Imola',
  'Red Bull Ring',
  'Zandvoort',
  'Silverstone'
].sort();

@Component({
  selector: 'app-track-record-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSelectModule
  ],
  templateUrl: './track-record-dialog.html',
  styleUrls: ['./track-record-dialog.scss']
})
export class TrackRecordDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TrackRecordDialogComponent>);
  private data: TrackRecord | undefined = inject(MAT_DIALOG_DATA);
  private organizerService = inject(OrganizerService);

  form: FormGroup;
  isEditMode = false;
  circuits = POPULAR_CIRCUITS;
  filteredCircuits: string[] = POPULAR_CIRCUITS;
  organizers: string[] = [];

  constructor() {
    this.isEditMode = !!this.data;
    this.form = this.fb.group({
      circuit_name: [this.data?.circuit_name || '', Validators.required],
      best_lap_time: [this.data?.best_lap_time || '', [Validators.required, Validators.pattern(/^\d{1,2}:\d{2}\.\d{3}$/)]],
      date_achieved: [this.data?.date_achieved || '', Validators.required],
      weather_conditions: [this.data?.weather_conditions || ''],
      tire_compound: [this.data?.tire_compound || ''],
      group: [this.data?.group || ''],
      organizer: [this.data?.organizer || ''],
      notes: [this.data?.notes || '']
    });

    // Load organizers from backend
    this.organizerService.getOrganizers().subscribe(orgs => {
      this.organizers = orgs;
    });

    // Setup autocomplete filtering
    this.form.get('circuit_name')?.valueChanges.subscribe(value => {
      this.filteredCircuits = this._filterCircuits(value || '');
    });
  }

  private _filterCircuits(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.circuits.filter(circuit =>
      circuit.toLowerCase().includes(filterValue)
    );
  }

  private formatDate(date: Date | string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const recordData: TrackRecord = {
        ...formValue,
        date_achieved: this.formatDate(formValue.date_achieved),
        id: this.data?.id,
        vehicle_id: this.data?.vehicle_id
      };
      this.dialogRef.close(recordData);
    }
  }
}
