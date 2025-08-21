import { RoleService } from '../../../src/services/role.service';
import { RoleRepository } from '../../../src/repositories/role.repository';

// Mock dependencies
jest.mock('../../../src/repositories/role.repository');

describe('Role Service', () => {
    let roleService: RoleService;
    let mockRepository: jest.Mocked<RoleRepository>;

    const mockRoleData = {
        id: 'role-1',
        roleName: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementations
        mockRepository = {
            findByName: jest.fn().mockResolvedValue(mockRoleData),
            findAll: jest.fn().mockResolvedValue([mockRoleData]),
            findById: jest.fn().mockResolvedValue(mockRoleData),
            create: jest.fn().mockResolvedValue(mockRoleData),
            update: jest.fn().mockResolvedValue(mockRoleData),
            delete: jest.fn().mockResolvedValue(true),
            model: {}
        } as unknown as jest.Mocked<RoleRepository>;

        // Setup prototype mock to return our mockRepository when instantiated
        (RoleRepository as jest.MockedClass<typeof RoleRepository>).mockImplementation(() => mockRepository);

        // Create service instance
        roleService = new RoleService();
    });

    describe('findByName', () => {
        it('should return a role by name', async () => {
            const result = await roleService.findByName('admin');

            expect(result).toEqual(mockRoleData);
            expect(mockRepository.findByName).toHaveBeenCalledWith('admin');
        });

        it('should return null when role not found', async () => {
            mockRepository.findByName.mockResolvedValueOnce(null);

            const result = await roleService.findByName('nonexistent');

            expect(result).toBeNull();
            expect(mockRepository.findByName).toHaveBeenCalledWith('nonexistent');
        });

        it('should throw error if repository throws', async () => {
            mockRepository.findByName.mockRejectedValueOnce(new Error('Repository error'));

            await expect(roleService.findByName('admin')).rejects.toThrow('Repository error');
        });
    });

    describe('findAll', () => {
        it('should return all roles', async () => {
            const result = await roleService.findAll();

            expect(result).toEqual([mockRoleData]);
            expect(mockRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a role by ID', async () => {
            const result = await roleService.findById('role-1');

            expect(result).toEqual(mockRoleData);
            expect(mockRepository.findById).toHaveBeenCalledWith('role-1');
        });
    });

    describe('create', () => {
        it('should create a new role', async () => {
            const newRoleData = { roleName: 'user' };

            const result = await roleService.create(newRoleData);

            expect(result).toEqual(mockRoleData);
            expect(mockRepository.create).toHaveBeenCalledWith(newRoleData);
        });
    });

    describe('update', () => {
        it('should update a role', async () => {
            const updateData = { roleName: 'updated-role' };

            const result = await roleService.update('role-1', updateData);

            expect(result).toEqual(mockRoleData);
            expect(mockRepository.update).toHaveBeenCalledWith('role-1', updateData);
        });
    });

    describe('delete', () => {
        it('should delete a role', async () => {
            const result = await roleService.delete('role-1');

            expect(result).toBe(true);
            expect(mockRepository.delete).toHaveBeenCalledWith('role-1');
        });
    });
});
