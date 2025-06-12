import { Request, Response, NextFunction } from 'express';
import { getUserProfile } from '../../src/controller/userController';
import { getUserByIdQuery } from '../../src/models/userModel';
import { User } from '../../src/schemas/types/userType';

// Mock the user model
jest.mock('../../src/models/userModel');

describe('User Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockUser: User;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    beforeEach(() => {
        mockUser = {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedpassword',
            created_at: new Date(),
            updated_at: new Date(),
            provider: '',
            is_premium: false,
            is_verified: false,
            premium_start_date: null,
            premium_end_date: null,
            premium_session_id: '',
            user_cancelled_premium: false
        };

        mockRequest = {
            user: { id: '1' }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserProfile', () => {
        it('should return user profile when user exists', async () => {
            // Mock the getUserByIdQuery to return a user
            (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);

            await getUserProfile(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'User fetched successfully',
                data: mockUser
            });
        });

        it('should return 404 when user not found', async () => {
            // Mock the getUserByIdQuery to return null
            (getUserByIdQuery as jest.Mock).mockResolvedValue(null);

            await getUserProfile(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'User not found',
                data: null
            });
        });

        it('should call next with error when query fails', async () => {
            const testError = new Error('Database error');
            (getUserByIdQuery as jest.Mock).mockRejectedValue(testError);

            await getUserProfile(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    });
});