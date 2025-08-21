import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { UserService } from '../services/user.service';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import fs from 'fs';
import path from 'path';

export class ProfileController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
     * Get logged-in user's profile
     */
    getProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'User not authenticated' });
            }

            // Get user without password
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: ['role']
            });

            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }

            res.status(200).json({ status: 'success', data: user });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch profile' });
        }
    };

    /**
     * Update logged-in user's profile
     */
    updateProfile = [
        // Validation
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Must be a valid email'),
        body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                const userId = (req as AuthenticatedRequest).user?.id;

                if (!userId) {
                    return res.status(401).json({ status: 'error', message: 'User not authenticated' });
                }

                // Check if email is being changed and already exists
                if (req.body.email) {
                    const existingUser = await this.userService.findByEmail(req.body.email);
                    if (existingUser && existingUser.id !== userId) {
                        return res.status(400).json({ status: 'error', message: 'Email already in use' });
                    }
                }

                // Prevent the user from changing their role
                const updateData = { ...req.body };
                delete updateData.roleId;

                // Update user profile
                const updated = await this.userService.update(userId, updateData);

                if (!updated) {
                    return res.status(404).json({ status: 'error', message: 'User not found' });
                }

                // Get updated user without password
                const updatedUser = await User.findByPk(userId, {
                    attributes: { exclude: ['password'] },
                    include: ['role']
                });

                res.status(200).json({ status: 'success', data: updatedUser });
            } catch (error) {
                console.error('Error updating profile:', error);
                res.status(500).json({ status: 'error', message: 'Failed to update profile' });
            }
        }
    ];

    /**
     * Download user's data as JSON file
     */
    downloadProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'User not authenticated' });
            }

            // Get user with all associated data
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: ['role']
            });

            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }

            // Create a JSON file with user data
            const userData = JSON.stringify(user, null, 2);
            const fileName = `user_${userId}_data.json`;
            const tempDir = path.join(__dirname, '../../temp');

            // Create temp directory if it doesn't exist
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const filePath = path.join(tempDir, fileName);
            fs.writeFileSync(filePath, userData);

            // Send file to the user
            res.download(filePath, fileName, (err) => {
                // Delete the file after sending it
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                if (err) {
                    console.error('Error sending file:', err);
                }
            });

        } catch (error) {
            console.error('Error downloading profile data:', error);
            res.status(500).json({ status: 'error', message: 'Failed to download profile data' });
        }
    };

    /**
     * Request account deletion
     */
    requestDeletion = async (req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'User not authenticated' });
            }

            // Flag user for deletion
            await User.update(
                { deletionRequested: true, deletionRequestDate: new Date() },
                { where: { id: userId } }
            );

            res.status(200).json({
                status: 'success',
                message: 'Account deletion request submitted successfully. Your account has been flagged for deletion.'
            });
        } catch (error) {
            console.error('Error requesting account deletion:', error);
            res.status(500).json({ status: 'error', message: 'Failed to submit deletion request' });
        }
    };
}

export default new ProfileController();
