import { Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

const AUTH_COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict' as const,
    path: '/'
};

export interface AuthTokenPayload extends JwtPayload {
    userId: string;
    tokenType: 'access' | 'refresh';
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }

    return secret;
}

function signToken(userId: string, tokenType: 'access' | 'refresh', expiresIn: SignOptions['expiresIn']): string {
    const options: SignOptions = { expiresIn };
    return jwt.sign({ userId, tokenType }, getJwtSecret(), options);
}

export function generateAuthTokens(userId: string) {
    return {
        accessToken: signToken(userId, 'access', ACCESS_TOKEN_EXPIRES_IN),
        refreshToken: signToken(userId, 'refresh', REFRESH_TOKEN_EXPIRES_IN)
    };
}

function verifyToken(token: string, expectedType: 'access' | 'refresh'): AuthTokenPayload {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === 'string' || decoded.tokenType !== expectedType) {
        throw new Error('Invalid token');
    }

    return decoded as AuthTokenPayload;
}

export function verifyAccessToken(token: string): AuthTokenPayload {
    return verifyToken(token, 'access');
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
    return verifyToken(token, 'refresh');
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
        ...AUTH_COOKIE_BASE_OPTIONS,
        maxAge: 15 * 60 * 1000
    });

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
        ...AUTH_COOKIE_BASE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE_NAME, AUTH_COOKIE_BASE_OPTIONS);
    res.clearCookie(REFRESH_COOKIE_NAME, AUTH_COOKIE_BASE_OPTIONS);
}

export function readCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
    if (!cookieHeader) {
        return undefined;
    }

    const cookie = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    return cookie ? cookie.slice(name.length + 1) : undefined;
}