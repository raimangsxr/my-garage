export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
}

export function extractItems<T>(response: T[] | PaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.items;
}

export function normalizePaginated<T>(
    response: T[] | PaginatedResponse<T>,
    skip: number,
    limit: number
): PaginatedResponse<T> {
    if (Array.isArray(response)) {
        return {
            items: response,
            total: response.length,
            skip,
            limit
        };
    }

    return response;
}
