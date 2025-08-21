import { BaseRepository } from './base.repository';
import { Settings } from '../models/Settings.model';
import { SettingsInterface } from '../interfaces/settings.interface';

export class SettingsRepository extends BaseRepository<Settings> {
    constructor() {
        super(Settings);
    }

    async findByKey(key: string): Promise<Settings | null> {
        return this.model.findOne({ where: { key } });
    }

    async findAllAsObject(): Promise<Record<string, any>> {
        const settings = await this.model.findAll();
        const result: Record<string, any> = {};

        // Convert settings array to an object with key-value pairs
        settings.forEach((setting) => {
            let value: any = setting.value;

            // Try to parse JSON values
            try {
                if (value.startsWith('{') || value.startsWith('[')) {
                    value = JSON.parse(value);
                }
            } catch (error) {
                // If parsing fails, keep the original string value
            }

            result[setting.key] = value;
        });

        return result;
    }

    async updateByKey(key: string, value: any): Promise<Settings | null> {
        // Convert objects/arrays to JSON strings for storage
        let stringValue = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        const [affectedCount] = await this.model.update(
            { value: stringValue },
            { where: { key } }
        );

        if (affectedCount > 0) {
            return this.findByKey(key);
        }
        return null;
    }
}
