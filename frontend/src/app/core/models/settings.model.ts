export interface Settings {
    id: number;
    user_id: number;
    language: string;
    currency: string;
    theme: string;
    notifications_enabled: boolean;
    google_client_id?: string;
    gemini_api_key?: string;
}

export interface SettingsUpdate {
    language?: string;
    currency?: string;
    theme?: string;
    notifications_enabled?: boolean;
    google_client_id?: string;
    gemini_api_key?: string;
}
