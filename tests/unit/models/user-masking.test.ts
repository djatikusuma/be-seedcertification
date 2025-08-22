import { User } from '../../../src/models/User.model';
import { DataMaskingUtil, MaskingType } from '../../../src/utils/masking.util';

describe('User Model - Data Masking', () => {
    let mockUser: User;

    beforeEach(() => {
        mockUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe Smith',
            email: 'john.doe@example.com',
            password: 'hashedpassword123',
            emailHash: 'hashvalue',
            roleId: 'role-id-123',
            role: {
                id: 'role-id-123',
                roleName: 'User',
                description: 'Regular user'
            },
            deletionRequested: false,
            deletionRequestDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            toJSON: function () {
                return {
                    id: this.id,
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    emailHash: this.emailHash,
                    roleId: this.roleId,
                    role: this.role,
                    deletionRequested: this.deletionRequested,
                    deletionRequestDate: this.deletionRequestDate,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt
                };
            },
            applyMasking: User.prototype.applyMasking
        } as any;
    });

    describe('applyMasking', () => {
        it('should return unmasked data for admin role', () => {
            const result = mockUser.applyMasking('admin');

            expect(result.name).toBe('John Doe Smith');
            expect(result.email).toBe('john.doe@example.com');
            expect(result.password).toBeUndefined(); // Should be excluded
            expect(result.emailHash).toBeUndefined(); // Should be excluded
        });

        it('should apply partial masking for manager role', () => {
            const result = mockUser.applyMasking('manager');

            expect(result.name).toBe('J*** *** S****');
            expect(result.email).toBe('joh****@example.com');
            expect(result.password).toBeUndefined();
            expect(result.emailHash).toBeUndefined();
        });

        it('should apply heavy masking for user role', () => {
            const result = mockUser.applyMasking('user');

            expect(result.name).toBe('J*** D** S****');
            expect(result.email).toBe('jo**');
            expect(result.password).toBeUndefined();
            expect(result.emailHash).toBeUndefined();
        });

        it('should apply heavy masking for guest role', () => {
            const result = mockUser.applyMasking('guest');

            expect(result.name).toBe('J*** D** S****');
            expect(result.email).toBe('jo**');
            expect(result.password).toBeUndefined();
            expect(result.emailHash).toBeUndefined();
        });

        it('should apply heavy masking for unknown role', () => {
            const result = mockUser.applyMasking('unknown');

            expect(result.name).toBe('J*** D** S****');
            expect(result.email).toBe('jo**');
            expect(result.password).toBeUndefined();
            expect(result.emailHash).toBeUndefined();
        });

        it('should apply heavy masking when no role provided', () => {
            const result = mockUser.applyMasking();

            expect(result.name).toBe('J*** D** S****');
            expect(result.email).toBe('jo**');
            expect(result.password).toBeUndefined();
            expect(result.emailHash).toBeUndefined();
        });
    });

    describe('applyMaskingToArray', () => {
        it('should apply masking to array of users', () => {
            const users = [mockUser, { ...mockUser, id: 'different-id' } as any];
            const result = User.applyMaskingToArray(users, 'manager');

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('J*** *** S****');
            expect(result[1].name).toBe('J*** *** S****');
        });
    });

    describe('getMaskedData', () => {
        it('should return masked data using getMaskedData method', () => {
            const result = mockUser.getMaskedData('manager');

            expect(result.name).toBe('J*** *** S****');
            expect(result.email).toBe('joh****@example.com');
        });
    });
});
