import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private currentLogLevel: LogLevel = environment.production ? LogLevel.Info : LogLevel.Debug;

    debug(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.Debug, message, optionalParams);
    }

    info(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.Info, message, optionalParams);
    }

    warn(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.Warn, message, optionalParams);
    }

    error(message: string, error?: any): void {
        this.log(LogLevel.Error, message, [error]);
    }

    private log(level: LogLevel, message: string, params: any[]): void {
        if (level < this.currentLogLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${LogLevel[level]}]`;

        switch (level) {
            case LogLevel.Debug:
                console.debug(prefix, message, ...params);
                break;
            case LogLevel.Info:
                console.info(prefix, message, ...params);
                break;
            case LogLevel.Warn:
                console.warn(prefix, message, ...params);
                break;
            case LogLevel.Error:
                console.error(prefix, message, ...params);
                // In production, you could send errors to a remote logging service here
                // Example: this.sendToRemoteLogger(message, params);
                break;
        }
    }

    // Future enhancement: send errors to remote logging service
    // private sendToRemoteLogger(message: string, params: any[]): void {
    //   // Implementation for remote logging service
    // }
}
