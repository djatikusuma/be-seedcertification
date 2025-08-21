import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { LoginRequestInterface } from '../interfaces/auth.interface';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: yourSecurePassword123
 *       required:
 *         - email
 *         - password
 *       example:
 *         email: admin@example.com
 *         password: securePassword456
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Response status
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT token for authentication
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       example:
 *         status: success
 *         data:
 *           token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjJ9.KjPV8YTfsQdZGOV1KoSSaI98u6R0lJgKmx-ps4pIrtY
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Error status
 *           example: error
 *         message:
 *           type: string
 *           description: Error message
 *           example: Invalid credentials
 *       example:
 *         status: error
 *         message: Invalid credentials
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: The value that failed validation
 *               msg:
 *                 type: string
 *                 description: The error message
 *               param:
 *                 type: string
 *                 description: The parameter that failed validation
 *               location:
 *                 type: string
 *                 description: Where the parameter was found (body, query, etc.)
 *       example:
 *         errors: [
 *           {
 *             value: "invalid-email",
 *             msg: "Valid email is required",
 *             param: "email",
 *             location: "body"
 *           }
 *         ]
 */

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Validate login request
     */
    validateLogin = [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ];

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login user
     *     description: |
     *       Authenticates a user with email and password credentials and returns a JWT token.
     *       
     *       The JWT token should be included in subsequent API requests in the Authorization header:
     *       `Authorization: Bearer {token}`
     *       
     *       This token is required for all protected endpoints and contains encoded user information including role.
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *           examples:
     *             validCredentials:
     *               summary: Valid login credentials
     *               value:
     *                 email: admin@example.com
     *                 password: securePassword456
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginResponse'
     *             examples:
     *               success:
     *                 summary: Successful login response
     *                 value:
     *                   status: success
     *                   data:
     *                     token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjJ9.KjPV8YTfsQdZGOV1KoSSaI98u6R0lJgKmx-ps4pIrtY
     *       400:
     *         description: Bad request - Invalid email format or missing password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationErrorResponse'
     *             examples:
     *               invalidEmail:
     *                 summary: Invalid email format
     *                 value:
     *                   errors: [
     *                     {
     *                       value: "invalid-email",
     *                       msg: "Valid email is required",
     *                       param: "email",
     *                       location: "body"
     *                     }
     *                   ]
     *       401:
     *         description: Unauthorized - Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             examples:
     *               invalidCredentials:
     *                 summary: Invalid credentials error
     *                 value:
     *                   status: error
     *                   message: Invalid credentials
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             examples:
     *               serverError:
     *                 summary: Internal server error
     *                 value:
     *                   status: error
     *                   message: Internal server error
     */
    login = async (req: Request, res: Response) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const loginData: LoginRequestInterface = req.body;
            const token = await this.authService.login(loginData);

            if (!token) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            return res.json({
                status: 'success',
                data: { token }
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    };
}

export default new AuthController();
