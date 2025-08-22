import { UserService } from '../../../src/services/user.service';
import { User } from '../../../src/models/User.model';

// Mock the User model
jest.mock('../../../src/models/User.model');
const MockedUser = User as jest.Mocked<typeof User>;

describe('UserService - Data Masking', () => {
    let userService: UserService;
    let mockUser: any;

    beforeEach(() => {
        userService = new UserService();

        mockUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            email: 'john.doe@example.com',
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
            applyMasking: jest.fn((role: string) => {
                if (role === 'admin') {
                    return {
                        id: mockUser.id,
                        name: mockUser.name,
                        email: mockUser.email,
                        roleId: mockUser.roleId,
                        role: mockUser.role
                    };
                } else {
                    return {
                        id: mockUser.id,
                        name: 'J*** D**',
                        email: 'jo**',
                        roleId: mockUser.roleId,
                        role: mockUser.role
                    };
                }
            })
        };

        jest.clearAllMocks();
    });

    describe('findAllWithMasking', () => {
        beforeEach(() => {
            MockedUser.findAll = jest.fn().mockResolvedValue([mockUser]);
            MockedUser.applyMaskingToArray = jest.fn().mockReturnValue([
                mockUser.applyMasking('user')
            ]);
        });

        it('should return masked users for regular user role', async () => {
            const result = await userService.findAllWithMasking('user');

            expect(MockedUser.findAll).toHaveBeenCalledWith({
                attributes: { exclude: ['password'] },
                include: ['role']
            });
            expect(MockedUser.applyMaskingToArray).toHaveBeenCalledWith([mockUser], 'user');
            expect(result).toEqual([{
                id: mockUser.id,
                name: 'J*** D**',
                email: 'jo**',
                roleId: mockUser.roleId,
                role: mockUser.role
            }]);
        });

        it('should return less masked users for admin role', async () => {
            MockedUser.applyMaskingToArray = jest.fn().mockReturnValue([
                mockUser.applyMasking('admin')
            ]);

            const result = await userService.findAllWithMasking('admin');

            expect(MockedUser.applyMaskingToArray).toHaveBeenCalledWith([mockUser], 'admin');
            expect(result).toEqual([{
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                roleId: mockUser.roleId,
                role: mockUser.role
            }]);
        });

        it('should default to guest role when no role provided', async () => {
            const result = await userService.findAllWithMasking();

            expect(MockedUser.applyMaskingToArray).toHaveBeenCalledWith([mockUser], 'guest');
        });
    });

    describe('findByIdWithMasking', () => {
        beforeEach(() => {
            MockedUser.findByPk = jest.fn().mockResolvedValue(mockUser);
        });

        it('should return masked user data', async () => {
            const result = await userService.findByIdWithMasking('123', 'user');

            expect(MockedUser.findByPk).toHaveBeenCalledWith('123', {
                attributes: { exclude: ['password'] },
                include: ['role']
            });
            expect(mockUser.applyMasking).toHaveBeenCalledWith('user');
            expect(result).toEqual({
                id: mockUser.id,
                name: 'J*** D**',
                email: 'jo**',
                roleId: mockUser.roleId,
                role: mockUser.role
            });
        });

        it('should return null when user not found', async () => {
            MockedUser.findByPk = jest.fn().mockResolvedValue(null);

            const result = await userService.findByIdWithMasking('999', 'user');

            expect(result).toBeNull();
        });

        it('should apply admin-level masking for admin role', async () => {
            const result = await userService.findByIdWithMasking('123', 'admin');

            expect(mockUser.applyMasking).toHaveBeenCalledWith('admin');
            expect(result).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                roleId: mockUser.roleId,
                role: mockUser.role
            });
        });
    });

    describe('updateWithMasking', () => {
        beforeEach(() => {
            MockedUser.findByEmail = jest.fn().mockResolvedValue(null);
            MockedUser.update = jest.fn().mockResolvedValue([1]);
        });

        it('should update user and return masked data', async () => {
            const updateData = { name: 'Jane Smith' };
            const updatedUser = { ...mockUser, name: 'Jane Smith' };

            MockedUser.findByPk = jest.fn().mockResolvedValue(updatedUser);
            updatedUser.applyMasking = jest.fn().mockReturnValue({
                ...updatedUser,
                name: 'J*** S****'
            });

            const result = await userService.updateWithMasking('123', updateData, 'user');

            expect(MockedUser.update).toHaveBeenCalledWith(updateData, { where: { id: '123' } });
            expect(result).toEqual({
                ...updatedUser,
                name: 'J*** S****'
            });
        });

        it('should return null when user not found for update', async () => {
            MockedUser.update = jest.fn().mockResolvedValue([0]);

            const result = await userService.updateWithMasking('999', { name: 'Test' }, 'user');

            expect(result).toBeNull();
        });

        it('should throw error when email already exists', async () => {
            const existingUser = { ...mockUser, id: 'different-id' };
            MockedUser.findByEmail = jest.fn().mockResolvedValue(existingUser);

            await expect(
                userService.updateWithMasking('123', { email: 'existing@example.com' }, 'user')
            ).rejects.toThrow('Email already exists');
        });

        it('should allow updating email to same email', async () => {
            MockedUser.findByEmail = jest.fn().mockResolvedValue(mockUser);
            MockedUser.update = jest.fn().mockResolvedValue([1]);
            MockedUser.findByPk = jest.fn().mockResolvedValue(mockUser);

            const result = await userService.updateWithMasking('123', { email: 'john.doe@example.com' }, 'user');

            expect(result).toBeDefined();
            expect(MockedUser.update).toHaveBeenCalled();
        });
    });
});
