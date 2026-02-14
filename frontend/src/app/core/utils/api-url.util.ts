import { environment } from '../../../environments/environment';

function stripTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
}

function stripLeadingSlash(value: string): string {
    return value.replace(/^\/+/, '');
}

export function buildApiUrl(path: string): string {
    return `${stripTrailingSlash(environment.apiUrl)}/${stripLeadingSlash(path)}`;
}
