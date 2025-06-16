import { Request, Response, NextFunction } from 'express';
import { deleteUser, getUserProfile, updateUser } from '../../src/controller/userController';
import { deleteUserQuery, getUserByIdQuery, updateUserQuery } from '../../src/models/userModel';
import { User } from '../../src/schemas/types/userType';
import bcrypt from 'bcryptjs';

// Mock the user model
jest.mock('../../src/models/userModel');
jest.mock('bcryptjs');

describe('User Controller', () => {
    // mock request and response for the endpoint tests
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    // mock data
    let mockUser: User;

    // initialize mock data before each test
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
            user_cancelled_premium: false,
            refresh_session_id: ''
        };

        // track how if and how it was called during the test
        mockNext = jest.fn();
    });

    // reset all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserProfile', () => {
        mockRequest = {
            user: { id: '1' }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

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

    describe('updateUser', () => {
        it('should update user profile when password is changed', async () => {
            mockRequest = {
                user: { id: '1' },
                body: {
                    email: 'new@example',
                    name: 'New User',
                    password: 'newpassword',
                    currentPassword: 'currentpassword'
                }
            };

            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
            (updateUserQuery as jest.Mock).mockResolvedValue({
                ...mockUser,
                email: 'new@example',
                name: 'New User',
                password: 'newhashedpassword'
            });

            await updateUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(bcrypt.compare).toHaveBeenCalledWith('currentpassword', 'hashedpassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(updateUserQuery).toHaveBeenCalledWith(
                '1',
                'new@example',
                'New User',
                'newhashedpassword'
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'User updated successfully (with password change)',
                data: {
                    ...mockUser,
                    email: 'new@example',
                    name: 'New User',
                    password: 'newhashedpassword'
                }
            });
        })

        it('should update user profile when password is not changed', async () => {
            mockRequest = {
                user: { id: '1' },
                body: {
                    email: 'new@example',
                    name: 'New User',
                    password: '',
                    currentPassword: ''
                }
            };

            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);
            (updateUserQuery as jest.Mock).mockResolvedValue({
                ...mockUser,
                email: 'new@example',
                name: 'New User',
                password: 'hashedpassword'
            });

            await updateUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(updateUserQuery).toHaveBeenCalledWith(
                '1',
                'new@example',
                'New User',
                'hashedpassword'
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'User updated successfully',
                data: {
                    ...mockUser,
                    email: 'new@example',
                    name: 'New User',
                    password: 'hashedpassword'
                }
            });
        })

        it('should return with 404 when user does not exist', async () => {
            mockRequest = {
                user: { id: '1' },
                body: {
                    email: 'new@example',
                    name: 'New User',
                    password: 'newpassword',
                    currentPassword: 'currentpassword'
                }
            };

            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            (getUserByIdQuery as jest.Mock).mockResolvedValue(null);

            await updateUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'User not found',
                data: null
            });
        })

        it('should return 400 when current password is empty when want to change password', async () => {
            mockRequest = {
                user: { id: '1' },
                body: {
                    email: 'new@example',
                    name: 'New User',
                    password: 'newpassword',
                    currentPassword: ''
                }
            };

            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);

            await updateUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Current password is required to change password',
                data: null
            })

        })

        it('should return 400 when current password is incorrect', async () => {
            mockRequest = {
                user: { id: '1' },
                body: {
                    email: 'new@example',
                    name: 'New User',
                    password: 'newpassword',
                    currentPassword: 'incorrectpassword'
                }
            };

            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            (getUserByIdQuery as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await updateUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getUserByIdQuery).toHaveBeenCalledWith('1');
            expect(bcrypt.compare).toHaveBeenCalledWith('incorrectpassword', 'hashedpassword');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Current password is incorrect',
                data: null
            });
        })

        it('should call next with error when getUserByIdQuery fails', async () => {
            const testError = new Error('Database error');
            (getUserByIdQuery as jest.Mock).mockRejectedValue(testError);

            await updateUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    })

    describe('deleteUser', () => {
        let clearCookiesMock: jest.Mock;

        beforeEach(() => {
            mockRequest = {
                user: { id: '1' }
            };

            // Initialize the clearCookie mock before assigning to mockResponse
            clearCookiesMock = jest.fn();

            mockResponse = {
                clearCookie: clearCookiesMock,
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            mockNext = jest.fn();
        });

        it('should delete user if user exists', async () => {
            (deleteUserQuery as jest.Mock).mockResolvedValue(mockUser);

            await deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(deleteUserQuery).toHaveBeenCalledWith('1');
            expect(clearCookiesMock).toHaveBeenCalledWith('refresh_token', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/'
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'User deleted successfully',
                data: mockUser
            });
        })

        it('should return 404 if user does not exist', async () => {
            (deleteUserQuery as jest.Mock).mockResolvedValue(null);

            await deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

            expect(deleteUserQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'User not found',
                data: null
            })
        })
    })
});