import { ProfileApplicant } from '../../../src/models/ProfileApplicant.model';
import { CryptoUtil } from '../../../src/utils/crypto.util';

// Mock the CryptoUtil
jest.mock('../../../src/utils/crypto.util');
const MockedCryptoUtil = CryptoUtil as jest.Mocked<typeof CryptoUtil>;

describe('ProfileApplicant Model - Encryption and Masking', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock CryptoUtil methods
        MockedCryptoUtil.encrypt.mockReturnValue('encrypted:iv:salt');
        MockedCryptoUtil.decrypt.mockReturnValue('decrypted-value');
        MockedCryptoUtil.hash.mockReturnValue('hashed-value');
    });

    describe('Field Encryption', () => {
        it('should define correct encrypted fields', () => {
            const encryptedFields = ProfileApplicant.getEncryptedFields();
            expect(encryptedFields).toEqual([
                'nik', 'npwp', 'email', 'namaPemohon', 'telepon',
                'alamatPemohon', 'alamatPerusahaan', 'nikKuasa', 'namaKuasa'
            ]);
        });
    });

    describe('Data Masking', () => {
        let mockProfile: any;

        beforeEach(() => {
            mockProfile = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                userId: 'user-id-123',
                nik: '1234567890123456',
                npwp: '123456789012345',
                email: 'john.doe@example.com',
                namaPemohon: 'John Doe Smith',
                telepon: '+621234567890',
                alamatPemohon: 'Jl. Example Street No. 123, Jakarta',
                alamatPerusahaan: 'Jl. Company Street No. 456, Bandung',
                nikKuasa: '9876543210987654',
                namaKuasa: 'Jane Attorney',
                toJSON: jest.fn().mockReturnValue({
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    userId: 'user-id-123',
                    nik: '1234567890123456',
                    npwp: '123456789012345',
                    email: 'john.doe@example.com',
                    namaPemohon: 'John Doe Smith',
                    telepon: '+621234567890',
                    alamatPemohon: 'Jl. Example Street No. 123, Jakarta',
                    alamatPerusahaan: 'Jl. Company Street No. 456, Bandung',
                    nikKuasa: '9876543210987654',
                    namaKuasa: 'Jane Attorney',
                    nikHash: 'nik-hash',
                    emailHash: 'email-hash'
                }),
                applyMasking: ProfileApplicant.prototype.applyMasking
            };
        });

        it('should not mask data for admin role', () => {
            const result = mockProfile.applyMasking('admin');

            expect(result.namaPemohon).toBe('John Doe Smith');
            expect(result.nik).toBe('1234567890123456');
            expect(result.email).toBe('john.doe@example.com');
            expect(result.telepon).toBe('+621234567890');
            expect(result.npwp).toBe('123456789012345');
            expect(result.nikHash).toBeUndefined(); // Should be removed
            expect(result.emailHash).toBeUndefined(); // Should be removed
        });

        it('should apply partial masking for manager role', () => {
            const result = mockProfile.applyMasking('manager');

            // Manager should see partially masked data
            expect(result.namaPemohon).not.toBe('John Doe Smith');
            expect(result.nik).not.toBe('1234567890123456');
            expect(result.email).not.toBe('john.doe@example.com');
            expect(result.telepon).not.toBe('+621234567890');
            expect(result.npwp).not.toBe('123456789012345');
            expect(result.nikKuasa).not.toBe('9876543210987654');
            expect(result.namaKuasa).not.toBe('Jane Attorney');
        });

        it('should apply heavy masking for user/guest role', () => {
            const result = mockProfile.applyMasking('user');

            // User should see heavily masked data
            expect(result.namaPemohon).not.toBe('John Doe Smith');
            expect(result.nik).not.toBe('1234567890123456');
            expect(result.email).not.toBe('john.doe@example.com');
            expect(result.telepon).not.toBe('+621234567890');
            expect(result.npwp).not.toBe('123456789012345');
            expect(result.nikKuasa).not.toBe('9876543210987654');
            expect(result.namaKuasa).not.toBe('Jane Attorney');
        });

        it('should default to guest masking when no role provided', () => {
            const result = mockProfile.applyMasking();

            // Should apply guest level masking (heavy)
            expect(result.namaPemohon).not.toBe('John Doe Smith');
            expect(result.nik).not.toBe('1234567890123456');
            expect(result.email).not.toBe('john.doe@example.com');
        });
    });

    describe('Static Methods', () => {
        it('should apply masking to array of profiles', () => {
            const mockProfiles = [
                { applyMasking: jest.fn().mockReturnValue({ masked: true }) },
                { applyMasking: jest.fn().mockReturnValue({ masked: true }) }
            ] as any[];

            const result = ProfileApplicant.applyMaskingToArray(mockProfiles, 'admin');

            expect(result).toHaveLength(2);
            expect(mockProfiles[0].applyMasking).toHaveBeenCalledWith('admin');
            expect(mockProfiles[1].applyMasking).toHaveBeenCalledWith('admin');
        });

        it('should check NIK existence using hash', async () => {
            const mockFindOne = jest.fn().mockResolvedValue({ id: '123' });
            ProfileApplicant.findOne = mockFindOne;

            await ProfileApplicant.nikExists('1234567890123456');

            expect(MockedCryptoUtil.hash).toHaveBeenCalledWith('1234567890123456');
            expect(mockFindOne).toHaveBeenCalledWith({
                where: { nikHash: 'hashed-value' },
                attributes: ['id']
            });
        });

        it('should check email existence using hash', async () => {
            const mockFindOne = jest.fn().mockResolvedValue({ id: '123' });
            ProfileApplicant.findOne = mockFindOne;

            await ProfileApplicant.emailExists('john.doe@example.com');

            expect(MockedCryptoUtil.hash).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockFindOne).toHaveBeenCalledWith({
                where: { emailHash: 'hashed-value' },
                attributes: ['id']
            });
        });

        it('should find profile by NIK using hash', async () => {
            const mockFindOne = jest.fn().mockResolvedValue({ id: '123' });
            ProfileApplicant.findOne = mockFindOne;

            await ProfileApplicant.findByNik('1234567890123456');

            expect(MockedCryptoUtil.hash).toHaveBeenCalledWith('1234567890123456');
            expect(mockFindOne).toHaveBeenCalledWith({
                where: { nikHash: 'hashed-value' },
                include: ['user']
            });
        });

        it('should find profile by email using hash', async () => {
            const mockFindOne = jest.fn().mockResolvedValue({ id: '123' });
            ProfileApplicant.findOne = mockFindOne;

            await ProfileApplicant.findByEmail('john.doe@example.com');

            expect(MockedCryptoUtil.hash).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockFindOne).toHaveBeenCalledWith({
                where: { emailHash: 'hashed-value' },
                include: ['user']
            });
        });
    });
});
