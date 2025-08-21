import { UserService } from '../../../src/services/user.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('User Service', () => {
    let userService: UserService;
    let mockRepository: jest.Mocked<UserRepository>;

    const mockUserData = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        roleId: '456',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementations
        mockRepository = {
            findByEmail: jest.fn().mockResolvedValue(mockUserData),
            create: jest.fn().mockResolvedValue(mockUserData),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            model: {}
        } as unknown as jest.Mocked<UserRepository>;

        // Mock bcrypt
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

        // Setup prototype mock to return our mockRepository when instantiated
        (UserRepository as jest.MockedClass<typeof UserRepository>).mockImplementation(() => mockRepository);

        // Create service instance
        userService = new UserService();
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            const result = await userService.findByEmail('test@example.com');

            expect(result).toEqual(mockUserData);
            expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should return null when user not found', async () => {
            mockRepository.findByEmail.mockResolvedValueOnce(null);

            const result = await userService.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
            expect(mockRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        });
    });

    describe('create', () => {
        it('should hash password and create user', async () => {
            const userData = {
                name: 'New User',
                email: 'new@example.com',
                password: 'plain_password',
                roleId: '789'
            };

            await userService.create(userData);

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 'salt');
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...userData,
                password: 'hashed_password'
            });
        });

        it('should not attempt to hash password if not provided', async () => {
            const userData = {
                name: 'New User',
                email: 'new@example.com',
                roleId: '789'
            };

            await userService.create(userData);

            expect(bcrypt.genSalt).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockRepository.create).toHaveBeenCalledWith(userData);
        });

        it('should throw error if repository throws', async () => {
            mockRepository.create.mockRejectedValueOnce(new Error('Repository error'));

            await expect(userService.create({ name: 'Test' })).rejects.toThrow('Repository error');
        });
    });
});
