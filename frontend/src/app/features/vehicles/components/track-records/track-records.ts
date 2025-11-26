import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TrackRecord } from '../../../../core/services/vehicle.service';
import { TrackRecordDialogComponent } from '../track-record-dialog/track-record-dialog';
import { CircuitHistoryDialogComponent } from '../circuit-history-dialog/circuit-history-dialog';

@Component({
  selector: 'app-track-records',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './track-records.html',
  styleUrls: ['./track-records.scss']
})
export class TrackRecordsComponent {
  private dialog = inject(MatDialog);

  @Input() records: TrackRecord[] = [];
  @Output() recordAdded = new EventEmitter<TrackRecord>();
  @Output() recordUpdated = new EventEmitter<TrackRecord>();
  @Output() recordDeleted = new EventEmitter<number>();

  sortBy: 'circuit' | 'time' = 'circuit';

  get uniqueCircuits(): TrackRecord[] {
    const grouped = new Map<string, TrackRecord[]>();

    this.records.forEach(record => {
      if (!grouped.has(record.circuit_name)) {
        grouped.set(record.circuit_name, []);
      }
      grouped.get(record.circuit_name)?.push(record);
    });

    const bestRecords: TrackRecord[] = [];

    grouped.forEach((records) => {
      // Sort records for this circuit by time (ascending)
      records.sort((a, b) => a.best_lap_time.localeCompare(b.best_lap_time));
      // Take the best one
      if (records.length > 0) {
        bestRecords.push(records[0]);
      }
    });

    return bestRecords.sort((a, b) => {
      if (this.sortBy === 'circuit') {
        return a.circuit_name.localeCompare(b.circuit_name);
      } else {
        return a.best_lap_time.localeCompare(b.best_lap_time);
      }
    });
  }

  toggleSort() {
    this.sortBy = this.sortBy === 'circuit' ? 'time' : 'circuit';
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(TrackRecordDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recordAdded.emit(result);
      }
    });
  }

  openCircuitHistory(record: TrackRecord) {
    const circuitRecords = this.records.filter(r => r.circuit_name === record.circuit_name);

    const dialogRef = this.dialog.open(CircuitHistoryDialogComponent, {
      width: '800px',
      data: {
        circuitName: record.circuit_name,
        records: circuitRecords
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'update') {
          this.recordUpdated.emit(result.record);
        } else if (result.action === 'delete') {
          this.recordDeleted.emit(result.recordId);
        }
      }
    });
  }

  getCircuitSessionCount(circuitName: string): number {
    return this.records.filter(r => r.circuit_name === circuitName).length;
  }
}
