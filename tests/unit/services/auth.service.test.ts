import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/models/User.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtConfig, getJwtConfig } from '../../../src/config/jwt.config';
import { JwtPayloadInterface } from '../../../src/interfaces/auth.interface';
import { SettingsService } from '../../../src/services/settings.service';

// Mock dependencies
jest.mock('../../../src/models/User.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/services/settings.service');
jest.mock('../../../src/config/jwt.config', () => ({
    jwtConfig: {
        secret: 'test_secret',
        expiresIn: '1h'
    },
    getJwtConfig: jest.fn().mockResolvedValue({
        secret: 'test_secret_from_settings',
        expiresIn: '2h'
    })
}));

describe('AuthService', () => {
    let authService: AuthService;
    const mockUserData = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        roleId: '456',
        role: { id: '456', roleName: 'user' }
    };
    const mockLoginData = {
        email: 'test@example.com',
        password: 'password123'
    };
    const mockPayload: JwtPayloadInterface = {
        id: '123',
        email: 'test@example.com',
        roleId: '456'
    };
    const mockToken = 'mocked.jwt.token';

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create service instance
        authService = new AuthService();

        // Default mock implementations
        (User.findOne as jest.Mock).mockResolvedValue(mockUserData);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
    });

    describe('login', () => {
        it('should return a token when credentials are valid', async () => {
            const result = await authService.login(mockLoginData);

            expect(result).toBe(mockToken);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: mockLoginData.email },
                include: ['role']
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginData.password, mockUserData.password);
            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                'test_secret_from_settings',
                { expiresIn: '2h' }
            );
        });

        it('should return null when user is not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            const result = await authService.login(mockLoginData);

            expect(result).toBeNull();
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('should return null when password does not match', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await authService.login(mockLoginData);

            expect(result).toBeNull();
            expect(User.findOne).toHaveBeenCalled();
            expect(bcrypt.compare).toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('should throw an error when database operation fails', async () => {
            (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(authService.login(mockLoginData)).rejects.toThrow('Database error');
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
    });

    describe('verifyToken', () => {
        it('should return decoded payload when token is valid', async () => {
            const result = await authService.verifyToken(mockToken);

            expect(result).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test_secret_from_settings');
        });

        it('should return null when token verification fails', async () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = await authService.verifyToken(mockToken);

            expect(result).toBeNull();
            expect(jwt.verify).toHaveBeenCalled();
        });

        it('should fall back to environment variable config if settings service fails', async () => {
            (getJwtConfig as jest.Mock).mockRejectedValueOnce(new Error('Settings error'));

            const result = await authService.verifyToken(mockToken);

            expect(result).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, jwtConfig.secret);
        });
    });
});
