import { SettingsRepository } from '../repositories/settings.repository';
import { Settings } from '../models/Settings.model';

export class SettingsService {
    private settingsRepository: SettingsRepository;

    constructor(repository?: SettingsRepository) {
        this.settingsRepository = repository || new SettingsRepository();
    }

    async getAllSettings(): Promise<Record<string, any>> {
        try {
            return await this.settingsRepository.findAllAsObject();
        } catch (error) {
            throw error;
        }
    }

    async updateSettings(updates: Record<string, any>): Promise<Record<string, any>> {
        try {
            const updatedSettings: Record<string, any> = {};

            // Process each setting update
            for (const [key, value] of Object.entries(updates)) {
                const updated = await this.settingsRepository.updateByKey(key, value);
                if (updated) {
                    // Handle JSON objects stored as strings
                    let parsedValue: any = updated.value;
                    try {
                        if (typeof parsedValue === 'string' && (parsedValue.startsWith('{') || parsedValue.startsWith('['))) {
                            parsedValue = JSON.parse(parsedValue);
                        }
                    } catch (error) {
                        // Keep as string if not valid JSON
                    }

                    updatedSettings[key] = parsedValue;
                }
            }

            return updatedSettings;
        } catch (error) {
            throw error;
        }
    }

    async getSetting(key: string): Promise<any> {
        try {
            const setting = await this.settingsRepository.findByKey(key);
            if (!setting) return null;

            // Try to parse JSON values
            let value: any = setting.value;
            try {
                if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                    value = JSON.parse(value);
                }
            } catch (error) {
                // If parsing fails, keep the original string value
            }

            return value;
        } catch (error) {
            throw error;
        }
    }
}
