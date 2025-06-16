import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken, refreshAccessToken } from '../../src/middlewares/authenticate';
import pool from '../../src/config/db';
import { getUserByIdQuery } from '../../src/models/userModel';
import { generateAccessToken } from '../../src/utils/token-utils';

// authenticateToken middleware
jest.mock('jsonwebtoken');
jest.mock('../../src/config/db');

describe('authenticateToken middleware', () => {
    // mock request and response for the endpoint tests
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    // initialize mock data before each test
    beforeEach(() => {
        // for authenticateToken
        mockRequest = {
            headers: {
                authorization: 'Bearer valid.token.here'
            },
        };

        // response format
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // for refreshAccessToken
        mockNext = jest.fn();

        // Reset all mocks
        jest.clearAllMocks();
    });

    it('should call next and set user if token is valid', async () => {
        // Mock jwt.verify to call callback with mock user
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
            callback(null, { id: '123' }); // No error, user payload
        });

        // Mock pool.query to resolve successfully
        (pool.query as jest.Mock).mockResolvedValue({});

        // We need to wrap in Promise.resolve because the middleware doesn't return a Promise
        await new Promise<void>((resolve) => {
            authenticateToken(
                mockRequest as Request,
                mockResponse as Response,
                (...args: unknown[]) => {
                    mockNext(...args);
                    resolve();
                }
            );
        });

        // Assertions
        expect(jwt.verify).toHaveBeenCalled();
        expect(mockRequest.user).toEqual({ id: '123' });
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SET app.user_id'));
        expect(mockNext).toHaveBeenCalled();
    });
});

// refreshAccessToken middleware

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../src/models/userModel');
jest.mock('../../src/utils/token-utils');

describe('refreshAccessToken middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        created_at: new Date(),
        updated_at: new Date(),
        provider: '',
        is_premium: false,
        is_verified: true,
        premium_start_date: null,
        premium_end_date: null,
        premium_session_id: '',
        refresh_session_id: 'hashed-session-id',
        user_cancelled_premium: false
    }

    beforeEach(() => {
        mockRequest = {
            cookies: {}
        }

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockNext = jest.fn();

        jest.clearAllMocks();
    });

    it('should return 400 if no refresh token is present', async () => {
        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "No refresh token found in cookies",
            code: "NO_REFRESH_TOKEN"
        }));
    });

    it('should return 400 if jwt is invalid', async () => {
        mockRequest.cookies = { refresh_token: 'invalid.token' };

        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
            callback(new Error('invalid token'), null);
        });

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Invalid refresh token",
            code: "INVALID_REFRESH_TOKEN"
        }));
    })


    it('should return 403 if decoded token has no refreshSessionId', async () => {
        mockRequest.cookies = { refresh_token: 'token' };

        (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });

        // Mock getUserByIdQuery to return a user with refresh_session_id
        (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid refresh token format' });
    })

    it('should return 404 if user not found', async () => {
        mockRequest.cookies = { refresh_token: 'token' };

        (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });
        (getUserByIdQuery as jest.Mock).mockResolvedValue(null);

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    })

    it('should return 403 if no session id in user', async () => {
        mockRequest.cookies = { refresh_token: 'token' };

        (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });
        (getUserByIdQuery as jest.Mock).mockResolvedValue({ ...mockUser, refresh_session_id: '' });

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No refresh session found' });
    })

    it('should return 403 if decoded token has no refreshSessionId', async () => {
        mockRequest.cookies = { refresh_token: 'token' };

        (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });
        (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid refresh token format' });
    });


    it('should return 403 if session id is invalid', async () => {
        mockRequest.cookies = { refresh_token: 'token' };

        (jwt.verify as jest.Mock).mockReturnValue({ id: '123', refreshSessionId: 'wrong-id' });
        (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid session' });
    })

    it('should return 200 and new access token if session is valid', async () => {
        mockRequest.cookies = { refresh_token: 'token' };
        const decoded = { id: '123', refreshSessionId: 'valid-session-id' };
        const newAccessToken = 'new-access-token';

        (jwt.verify as jest.Mock).mockReturnValue(decoded);
        (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (generateAccessToken as jest.Mock).mockReturnValue(newAccessToken);

        await refreshAccessToken(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Access token refreshed successfully',
            accessToken: newAccessToken,
            user: mockUser
        });
    })
});