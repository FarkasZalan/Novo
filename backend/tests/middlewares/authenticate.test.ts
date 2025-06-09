import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middlewares/authenticate';
import pool from '../../src/config/db';

jest.mock('jsonwebtoken');
jest.mock('../../src/config/db');

describe('authenticateToken middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        mockRequest = {
            headers: {
                authorization: 'Bearer valid.token.here'
            },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
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