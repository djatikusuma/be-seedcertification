import { Profile } from '../../../src/models/Profile.model';
import { CryptoUtil } from '../../../src/utils/crypto.util';

// Mock the CryptoUtil
jest.mock('../../../src/utils/crypto.util');
const MockedCryptoUtil = CryptoUtil as jest.Mocked<typeof CryptoUtil>;

describe('Profile Model - Encryption and Masking', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock CryptoUtil methods
        MockedCryptoUtil.encrypt.mockReturnValue('encrypted:iv:salt');
        MockedCryptoUtil.decrypt.mockReturnValue('decrypted-value');
        MockedCryptoUtil.hash.mockReturnValue('hashed-value');
    });

    describe('Field Encryption', () => {
        it('should define correct encrypted fields', () => {
            const encryptedFields = Profile.getEncryptedFields();
            expect(encryptedFields).toEqual(['nama', 'nik', 'telepon', 'alamat']);
        });
    });

    describe('Data Masking', () => {
        let mockProfile: any;

        beforeEach(() => {
            mockProfile = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                userId: 'user-id-123',
                nik: '1234567890123456',
                nama: 'John Doe Smith',
                telepon: '+621234567890',
                alamat: 'Jl. Example Street No. 123, Jakarta',
                jabatan: 'Manager',
                golongan: 'III/a',
                pangkat: 'Penata Muda',
                toJSON: jest.fn().mockReturnValue({
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    userId: 'user-id-123',
                    nik: '1234567890123456',
                    nama: 'John Doe Smith',
                    telepon: '+621234567890',
                    alamat: 'Jl. Example Street No. 123, Jakarta',
                    jabatan: 'Manager',
                    golongan: 'III/a',
                    pangkat: 'Penata Muda'
                }),
                applyMasking: Profile.prototype.applyMasking
            };
        });

        it('should not mask data for admin role', () => {
            const result = mockProfile.applyMasking('admin');

            expect(result.nama).toBe('John Doe Smith');
            expect(result.nik).toBe('1234567890123456');
            expect(result.telepon).toBe('+621234567890');
            expect(result.alamat).toBe('Jl. Example Street No. 123, Jakarta');
        });

        it('should apply partial masking for manager role', () => {
            const result = mockProfile.applyMasking('manager');

            // Manager should see partially masked data
            expect(result.nama).not.toBe('John Doe Smith');
            expect(result.nik).not.toBe('1234567890123456');
            expect(result.telepon).not.toBe('+621234567890');
            expect(result.alamat).not.toBe('Jl. Example Street No. 123, Jakarta');
        });

        it('should apply heavy masking for user/guest role', () => {
            const result = mockProfile.applyMasking('user');

            // User should see heavily masked data
            expect(result.nama).not.toBe('John Doe Smith');
            expect(result.nik).not.toBe('1234567890123456');
            expect(result.telepon).not.toBe('+621234567890');
            expect(result.alamat).not.toBe('Jl. Example Street No. 123, Jakarta');
        });

        it('should default to guest masking when no role provided', () => {
            const result = mockProfile.applyMasking();

            // Should apply guest level masking (heavy)
            expect(result.nama).not.toBe('John Doe Smith');
            expect(result.nik).not.toBe('1234567890123456');
        });
    });

    describe('Static Methods', () => {
        it('should apply masking to array of profiles', () => {
            const mockProfiles = [
                { applyMasking: jest.fn().mockReturnValue({ masked: true }) },
                { applyMasking: jest.fn().mockReturnValue({ masked: true }) }
            ] as any[];

            const result = Profile.applyMaskingToArray(mockProfiles, 'admin');

            expect(result).toHaveLength(2);
            expect(mockProfiles[0].applyMasking).toHaveBeenCalledWith('admin');
            expect(mockProfiles[1].applyMasking).toHaveBeenCalledWith('admin');
        });

        it('should check NIK existence using hash', async () => {
            const mockFindOne = jest.fn().mockResolvedValue({ id: '123' });
            Profile.findOne = mockFindOne;

            await Profile.nikExists('1234567890123456');

            expect(MockedCryptoUtil.hash).toHaveBeenCalledWith('1234567890123456');
            expect(mockFindOne).toHaveBeenCalledWith({
                where: { nikHash: 'hashed-value' },
                attributes: ['id']
            });
        });

        it('should find profile by NIK using hash', async () => {
            const mockFindOne = jest.fn().mockResolvedValue({ id: '123' });
            Profile.findOne = mockFindOne;

            await Profile.findByNik('1234567890123456');

            expect(MockedCryptoUtil.hash).toHaveBeenCalledWith('1234567890123456');
            expect(mockFindOne).toHaveBeenCalledWith({
                where: { nikHash: 'hashed-value' },
                include: ['user']
            });
        });
    });
});
