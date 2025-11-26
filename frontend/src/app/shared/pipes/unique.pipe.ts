import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'unique',
    standalone: true
})
export class UniquePipe implements PipeTransform {
    transform(value: any[], key?: string): any[] {
        if (!value || !Array.isArray(value)) {
            return value;
        }

        if (key) {
            const uniqueItems = new Map();
            value.forEach(item => {
                if (item[key] && !uniqueItems.has(item[key])) {
                    uniqueItems.set(item[key], item);
                }
            });
            return Array.from(uniqueItems.values());
        }

        return [...new Set(value)];
    }
}
