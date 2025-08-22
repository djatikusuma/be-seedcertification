import { Request } from 'express';

export interface LoginRequestInterface {
    email: string;
    password: string;
}

export interface JwtPayloadInterface {
    id: string;
    email: string;
    roleId: string;
    role?: any; // Optional role object for enhanced authentication
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayloadInterface;
}
