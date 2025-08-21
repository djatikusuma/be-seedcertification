import { SettingsService } from '../../../src/services/settings.service';
import { SettingsRepository } from '../../../src/repositories/settings.repository';

// Mock dependencies
jest.mock('../../../src/repositories/settings.repository');

describe('Settings Service', () => {
    let settingsService: SettingsService;
    let mockRepository: jest.Mocked<SettingsRepository>;
    const mockSettings = {
        appName: 'Test App',
        timezone: 'UTC',
        jwtTimeout: '24h',
        appMetaData: { version: '1.0.0', description: 'Test app' },
        database: 'mysql'
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create a mock repository instance
        mockRepository = {
            findAllAsObject: jest.fn().mockResolvedValue(mockSettings),
            updateByKey: jest.fn().mockImplementation(async (key, value) => {
                return {
                    key,
                    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }),
            findByKey: jest.fn().mockImplementation(async (key) => {
                const value = mockSettings[key as keyof typeof mockSettings];
                if (value === undefined) return null;
                return {
                    key,
                    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }),
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            model: {} as any
        } as unknown as jest.Mocked<SettingsRepository>;

        // Initialize service with mock repository
        settingsService = new SettingsService(mockRepository);
    });

    describe('getAllSettings', () => {
        it('should return all settings', async () => {
            const result = await settingsService.getAllSettings();

            expect(result).toEqual(mockSettings);
            expect(mockRepository.findAllAsObject).toHaveBeenCalledTimes(1);
        });

        it('should throw error if repository throws', async () => {
            mockRepository.findAllAsObject.mockRejectedValueOnce(new Error('Repository error'));

            await expect(settingsService.getAllSettings()).rejects.toThrow('Repository error');
        });
    });

    describe('updateSettings', () => {
        it('should update settings and return updated values', async () => {
            const updates = {
                appName: 'Updated App',
                timezone: 'GMT',
            };

            const result = await settingsService.updateSettings(updates);

            expect(result).toHaveProperty('appName', 'Updated App');
            expect(result).toHaveProperty('timezone', 'GMT');
            expect(mockRepository.updateByKey).toHaveBeenCalledTimes(2);
            expect(mockRepository.updateByKey).toHaveBeenCalledWith('appName', 'Updated App');
            expect(mockRepository.updateByKey).toHaveBeenCalledWith('timezone', 'GMT');
        });

        it('should handle JSON object values', async () => {
            const updates = {
                appMetaData: { version: '2.0.0', description: 'Updated description' },
            };

            mockRepository.updateByKey.mockResolvedValueOnce({
                key: 'appMetaData',
                value: JSON.stringify(updates.appMetaData),
                createdAt: new Date(),
                updatedAt: new Date()
            } as any);

            const result = await settingsService.updateSettings(updates);

            expect(result).toHaveProperty('appMetaData');
            expect(result.appMetaData).toEqual(updates.appMetaData);
            expect(mockRepository.updateByKey).toHaveBeenCalledWith(
                'appMetaData',
                updates.appMetaData
            );
        });

        it('should throw error if repository throws', async () => {
            mockRepository.updateByKey.mockRejectedValueOnce(new Error('Repository error'));

            await expect(settingsService.updateSettings({ appName: 'Test' })).rejects.toThrow('Repository error');
        });
    });

    describe('getSetting', () => {
        it('should return a specific setting by key', async () => {
            const result = await settingsService.getSetting('appName');

            expect(result).toBe('Test App');
            expect(mockRepository.findByKey).toHaveBeenCalledWith('appName');
        });

        it('should parse JSON values', async () => {
            const result = await settingsService.getSetting('appMetaData');

            expect(result).toEqual({ version: '1.0.0', description: 'Test app' });
        });

        it('should return null for non-existent keys', async () => {
            mockRepository.findByKey.mockResolvedValueOnce(null);

            const result = await settingsService.getSetting('nonExistentKey');

            expect(result).toBeNull();
        });
    });
});
