export interface TrackSummary {
    id: number;
    name: string;
    location: string | null;
    length_meters: number | null;
    total_sessions: number;
    best_lap_time: string | null;
    best_lap_vehicle_name: string | null;
    vehicle_count: number;
    last_session_date: string | null;
    image_url: string | null;
}

export interface TrackRecordRead {
    id: number;
    vehicle_id: number;
    track_id: number | null;
    circuit_name: string;
    best_lap_time: string;
    date_achieved: string;
    weather_conditions: string | null;
    tire_compound: string | null;
    group: string | null;
    organizer: string | null;
    notes: string | null;
}

export interface VehicleRecordGroup {
    vehicle_id: number;
    vehicle_name: string;
    vehicle_brand: string | null;
    vehicle_model: string | null;
    records: TrackRecordRead[];
    best_lap_time: string;
}

export interface TrackDetail {
    id: number;
    name: string;
    location: string | null;
    length_meters: number | null;
    description: string | null;
    total_sessions: number;
    best_lap_time: string | null;
    vehicle_groups: VehicleRecordGroup[];
    image_url: string | null;
}
