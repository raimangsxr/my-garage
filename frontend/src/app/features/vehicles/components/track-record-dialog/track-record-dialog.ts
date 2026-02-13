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
import { TracksService } from '../../../tracks/tracks.service';

const OTHER_OPTION = 'Other';

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', OTHER_OPTION];
const TIRE_OPTIONS = ['Classification', 'Soft', 'Medium', 'Hard', OTHER_OPTION];
const GROUP_OPTIONS = ['Very Fast', 'Fast', 'Medium-Fast', 'Medium', 'Slow', OTHER_OPTION];
const ORGANIZER_PREDEFINED = ['TMSR', 'MotorExtremo'];

// Popular Spanish and European circuits
const POPULAR_CIRCUITS = [
  'Circuit de Barcelona-Catalunya',
  'Jerez Circuit',
  'Circuit Ricardo Tormo',
  'Jarama Circuit',
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
  private tracksService = inject(TracksService);

  form: FormGroup;
  isEditMode = false;
  circuits: string[] = [];
  filteredCircuits: string[] = [];
  organizers: string[] = [...ORGANIZER_PREDEFINED, OTHER_OPTION];
  filteredOrganizers: string[] = [...ORGANIZER_PREDEFINED, OTHER_OPTION];
  weatherOptions = WEATHER_OPTIONS;
  tireOptions = TIRE_OPTIONS;
  groupOptions = GROUP_OPTIONS;
  otherOption = OTHER_OPTION;

  constructor() {
    const initialWeather = this.resolveSelectInitialValue(this.data?.weather_conditions, WEATHER_OPTIONS);
    const initialTire = this.resolveSelectInitialValue(this.data?.tire_compound, TIRE_OPTIONS);
    const initialGroup = this.resolveSelectInitialValue(this.data?.group, GROUP_OPTIONS);
    const initialOrganizer = this.resolveOrganizerInitialValue(this.data?.organizer);

    this.isEditMode = !!this.data;
    this.form = this.fb.group({
      circuit_name: [this.data?.circuit_name || '', Validators.required],
      best_lap_time: [this.data?.best_lap_time || '', [Validators.required, Validators.pattern(/^\d{1,2}:\d{2}\.\d{3}$/)]],
      date_achieved: [this.data?.date_achieved || '', Validators.required],
      weather_conditions: [initialWeather],
      weather_conditions_other: [this.data?.weather_conditions && initialWeather === OTHER_OPTION ? this.data.weather_conditions : ''],
      tire_compound: [initialTire],
      tire_compound_other: [this.data?.tire_compound && initialTire === OTHER_OPTION ? this.data.tire_compound : ''],
      group: [initialGroup],
      group_other: [this.data?.group && initialGroup === OTHER_OPTION ? this.data.group : ''],
      organizer: [initialOrganizer],
      organizer_other: [this.data?.organizer && initialOrganizer === OTHER_OPTION ? this.data.organizer : ''],
      notes: [this.data?.notes || '']
    });

    // Load organizers from backend
    this.organizerService.getOrganizers().subscribe(orgs => {
      this.organizers = [...new Set([...ORGANIZER_PREDEFINED, ...orgs.filter(Boolean), OTHER_OPTION])];
      this.filteredOrganizers = this._filterOrganizers(this.form.get('organizer')?.value || '');
    });

    // Load tracks from backend
    // Load tracks from backend
    this.tracksService.getTracks().subscribe(tracks => {
      this.circuits = tracks.map(t => t.name).sort();
      // Also add popular circuits if not present, to help user
      POPULAR_CIRCUITS.forEach(c => {
        if (!this.circuits.includes(c)) {
          this.circuits.push(c);
        }
      });
      this.circuits.sort();

      // Initial filter
      this.filteredCircuits = this._filterCircuits(this.form.get('circuit_name')?.value || '');
    });

    // Setup autocomplete filtering
    this.form.get('circuit_name')?.valueChanges.subscribe(value => {
      this.filteredCircuits = this._filterCircuits(value || '');
    });

    this.form.get('organizer')?.valueChanges.subscribe(value => {
      this.filteredOrganizers = this._filterOrganizers(value || '');
    });

    this.setupOtherFieldValidation('weather_conditions', 'weather_conditions_other');
    this.setupOtherFieldValidation('tire_compound', 'tire_compound_other');
    this.setupOtherFieldValidation('group', 'group_other');
    this.setupOtherFieldValidation('organizer', 'organizer_other');
  }

  private _filterCircuits(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.circuits.filter(circuit =>
      circuit.toLowerCase().includes(filterValue)
    );
  }

  private _filterOrganizers(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.organizers.filter(organizer =>
      organizer.toLowerCase().includes(filterValue)
    );
  }

  private resolveSelectInitialValue(value: string | undefined, options: string[]): string {
    if (!value) return '';
    return options.includes(value) ? value : OTHER_OPTION;
  }

  private resolveOrganizerInitialValue(value: string | undefined): string {
    if (!value) return '';
    const merged = [...new Set([...ORGANIZER_PREDEFINED, OTHER_OPTION])];
    return merged.includes(value) ? value : OTHER_OPTION;
  }

  private setupOtherFieldValidation(controlName: string, otherControlName: string): void {
    const mainControl = this.form.get(controlName);
    const otherControl = this.form.get(otherControlName);

    if (!mainControl || !otherControl) return;

    const updateValidators = (value: string) => {
      if (value === OTHER_OPTION) {
        otherControl.setValidators([Validators.required]);
      } else {
        otherControl.clearValidators();
        otherControl.setValue('', { emitEvent: false });
      }
      otherControl.updateValueAndValidity({ emitEvent: false });
    };

    updateValidators(mainControl.value);
    mainControl.valueChanges.subscribe(value => updateValidators(value));
  }

  get showWeatherOther(): boolean {
    return this.form.get('weather_conditions')?.value === OTHER_OPTION;
  }

  get showTireOther(): boolean {
    return this.form.get('tire_compound')?.value === OTHER_OPTION;
  }

  get showGroupOther(): boolean {
    return this.form.get('group')?.value === OTHER_OPTION;
  }

  get showOrganizerOther(): boolean {
    return this.form.get('organizer')?.value === OTHER_OPTION;
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

      const weather = formValue.weather_conditions === OTHER_OPTION
        ? formValue.weather_conditions_other
        : formValue.weather_conditions;
      const tire = formValue.tire_compound === OTHER_OPTION
        ? formValue.tire_compound_other
        : formValue.tire_compound;
      const group = formValue.group === OTHER_OPTION
        ? formValue.group_other
        : formValue.group;
      const organizer = formValue.organizer === OTHER_OPTION
        ? formValue.organizer_other
        : formValue.organizer;

      const recordData: TrackRecord = {
        circuit_name: formValue.circuit_name,
        best_lap_time: formValue.best_lap_time,
        date_achieved: this.formatDate(formValue.date_achieved) || '',
        weather_conditions: weather || '',
        tire_compound: tire || '',
        group: group || '',
        organizer: organizer || '',
        notes: formValue.notes || '',
        id: this.data?.id,
        vehicle_id: this.data?.vehicle_id
      };
      this.dialogRef.close(recordData);
    }
  }
}
