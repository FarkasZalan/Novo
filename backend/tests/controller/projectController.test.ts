import { createProject, deleteProject, updateProject } from "../../src/controller/projectController";
import { createLabelQuery } from "../../src/models/labelModel";
import { createProjectQuery, deleteProjectQuery, getProjectByIdQuery, updateProjectQuery } from "../../src/models/projectModel";
import { Project } from "../../src/schemas/types/projectTyoe";
import { Request, Response, NextFunction } from 'express';
import { DEFAULT_COLORS } from "../../src/utils/default-colors";

jest.mock('../../src/models/projectModel');
jest.mock("../../src/models/labelModel");

describe('ProjectController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockProject: Project;

    beforeEach(() => {
        mockProject = {
            id: '1',
            name: 'Test Project',
            description: 'This is a test project',
            owner_id: '1',
            status: 'not-started',
            memberCount: 0,
            total_tasks: 0,
            completed_tasks: 0,
            progress: 0,
            attachments_count: 0,
            read_only: false
        };

        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        beforeEach(() => {
            mockRequest = {
                body: {
                    name: 'Test Project',
                    description: 'This is a test project',
                    ownerId: '1'
                }
            };
            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        })

        it('should create a new project', async () => {
            (createProjectQuery as jest.Mock).mockResolvedValue(mockProject);
            (createLabelQuery as jest.Mock).mockResolvedValue(undefined);

            await createProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(createProjectQuery).toHaveBeenCalledWith(
                'Test Project',
                'This is a test project',
                '1'
            );
            for (const label of DEFAULT_COLORS) {
                expect(createLabelQuery).toHaveBeenCalledWith(
                    label.name,
                    label.description,
                    mockProject.id,
                    label.color
                );
            }

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 201,
                message: 'Project created successfully',
                data: mockProject
            });
        });

        it('should call next with error when getUserByIdQuery fails', async () => {
            const testError = new Error('Database error');
            (createProjectQuery as jest.Mock).mockRejectedValue(testError);

            await createProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    });

    describe('updateProject', () => {
        beforeEach(() => {
            mockRequest = {
                params: {
                    projectId: '1'
                },
                body: {
                    name: 'New Project Name',
                    description: 'This is a new test project description',
                }
            };
            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        })

        it('should update a project', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (updateProjectQuery as jest.Mock).mockResolvedValue({
                ...mockProject,
                name: 'New Project Name',
                description: 'This is a new test project description',
            });

            await updateProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(updateProjectQuery).toHaveBeenCalledWith(
                'New Project Name',
                'This is a new test project description',
                '1'
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'Project updated successfully',
                data: {
                    ...mockProject,
                    name: 'New Project Name',
                    description: 'This is a new test project description',
                }
            });
        })

        it('should return 404 if project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(null);

            await updateProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            })
        });

        it('should return 200 if project is read-only', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue({
                ...mockProject,
                read_only: true
            });

            await updateProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Project is read-only',
                data: null
            });
        });

        it('should return 404 if updated project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (updateProjectQuery as jest.Mock).mockResolvedValue(null);

            await updateProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(updateProjectQuery).toHaveBeenCalledWith(
                'New Project Name',
                'This is a new test project description',
                '1'
            )
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            });
        });

        it('should call next with error when getUserByIdQuery fails', async () => {
            const testError = new Error('Unexpected error');
            (getProjectByIdQuery as jest.Mock).mockRejectedValue(testError);

            await updateProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    });

    describe('deleteProject', () => {
        beforeEach(() => {
            mockRequest = {
                params: {
                    projectId: '1'
                }
            };
            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        })

        it('should delete a project', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (deleteProjectQuery as jest.Mock).mockResolvedValue(mockProject);

            await deleteProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(deleteProjectQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'Project deleted successfully',
                data: mockProject
            });
        });

        it('should return 404 if project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(null);

            await deleteProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            });
        });

        it('should retun 400 if project is read-only', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue({
                ...mockProject,
                read_only: true
            });

            await deleteProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Project is read-only',
                data: null
            });
        });

        it('should return 404 if deleted project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (deleteProjectQuery as jest.Mock).mockResolvedValue(null);

            await deleteProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(deleteProjectQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            });
        });

        it('should call next with error when getUserByIdQuery fails', async () => {
            const testError = new Error('Unexpected error');
            (getProjectByIdQuery as jest.Mock).mockRejectedValue(testError);

            await deleteProject(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    })
});