import { Request } from 'express';

export interface LoginRequestInterface {
    email: string;
    password: string;
}

export interface JwtPayloadInterface {
    id: string;
    email: string;
    roleId: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayloadInterface;
}
