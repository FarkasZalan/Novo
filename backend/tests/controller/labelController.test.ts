import { Request, Response, NextFunction } from 'express';
import { Label } from '../../src/schemas/types/labelType';
import { createLabelQuery, deleteLabelQuery, getAllLabelForProjectQuery, getLabelQuery, updateLabelQuery } from '../../src/models/labelModel';
import { getProjectByIdQuery } from '../../src/models/projectModel';
import { Project } from '../../src/schemas/types/projectTyoe';
import { createLabel, deleteLabel, updateLabel } from '../../src/controller/labelController';

jest.mock("../../src/models/labelModel");
jest.mock('../../src/models/projectModel');

describe('Label Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockLabel: Label;
    let mockProject: Project;

    beforeEach(() => {
        mockLabel = {
            id: '1',
            name: 'Test Label',
            description: 'This is a test label',
            color: '#ff0000',
            project_id: '1',
            task_count: 0
        };

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

    describe('createLabel', () => {
        beforeEach(() => {
            mockRequest = {
                params: {
                    projectId: '1'
                },
                body: {
                    name: 'Test Label',
                    description: 'This is a test label',
                    color: '#ff0000',
                }
            };
            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        })

        it('should create a new label', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (getAllLabelForProjectQuery as jest.Mock).mockResolvedValue([]);
            (createLabelQuery as jest.Mock).mockResolvedValue(mockLabel);

            await createLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(getAllLabelForProjectQuery).toHaveBeenCalledWith('1');
            expect(createLabelQuery).toHaveBeenCalledWith('Test Label', 'This is a test label', '1', '#ff0000');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'Label created successfully',
                data: mockLabel
            });

        });

        it('should retun 404 if project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(null);

            await createLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            });
        });

        it('should return 400 if project is read-only', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue({
                ...mockProject,
                read_only: true
            });

            await createLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Project is read-only',
                data: null
            });
        });

        it('should return 400 if label name already exists', async () => {
            const existingLabels: Label = {
                id: '2',
                name: 'Test Label',
                description: 'This is a test label',
                color: '#ff0000',
                project_id: '1',
                task_count: 0
            };

            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (getAllLabelForProjectQuery as jest.Mock).mockResolvedValue([existingLabels]);

            await createLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(getAllLabelForProjectQuery).toHaveBeenCalledWith('1');
            expect(getAllLabelForProjectQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Label name already exists',
                data: null
            });
        });

        it('should call next with error when getProjectByIdQuery fails', async () => {
            const testError = new Error('Unexpected error');
            (getProjectByIdQuery as jest.Mock).mockRejectedValue(testError);

            await createLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    });

    describe('updateLabel', () => {
        beforeEach(() => {
            mockRequest = {
                params: {
                    projectId: '1',
                    labelId: '1'
                },
                body: {
                    name: 'new Test Label', // case sensitive check
                    description: 'This is a new test label',
                    color: '#ffff00',
                }
            };
            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        })

        it('should update a label', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (getLabelQuery as jest.Mock).mockResolvedValue(mockLabel);
            (updateLabelQuery as jest.Mock).mockResolvedValue({
                ...mockLabel,
                name: 'New Test Label',
                description: 'This is a new test label',
                color: '#ffff00',
            });

            await updateLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(getLabelQuery).toHaveBeenCalledWith('1');
            expect(updateLabelQuery).toHaveBeenCalledWith('New Test Label', 'This is a new test label', '#ffff00', '1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'Label updated successfully',
                data: {
                    ...mockLabel,
                    name: 'New Test Label',
                    description: 'This is a new test label',
                    color: '#ffff00',
                }
            });
        });

        it('should return 404 if project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(null);

            await updateLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            });
        });

        it('should return 400 if project is read-only', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue({
                ...mockProject,
                read_only: true
            });

            await updateLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Project is read-only',
                data: null
            });
        });

        it('should return 404 if label is not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (getLabelQuery as jest.Mock).mockResolvedValue(null);

            await updateLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(getLabelQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Label not found',
                data: null
            });
        });

        it('should return 400 if label name already exists', async () => {
            const existingLabels: Label = {
                id: '2',
                name: 'new Test Label',
                description: 'This is a test label',
                color: '#ff0000',
                project_id: '1',
                task_count: 0
            };

            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (getLabelQuery as jest.Mock).mockResolvedValue(mockLabel);
            (getAllLabelForProjectQuery as jest.Mock).mockResolvedValue([existingLabels]);

            await updateLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(getLabelQuery).toHaveBeenCalledWith('1');
            expect(getAllLabelForProjectQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Label name already exists',
                data: null
            });
        });

        it('should call next with error when getProjectByIdQuery fails', async () => {
            const testError = new Error('Unexpected error');
            (getProjectByIdQuery as jest.Mock).mockRejectedValue(testError);

            await updateLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    });

    describe('deleteLabel', () => {
        beforeEach(() => {
            mockRequest = {
                params: {
                    projectId: '1',
                    labelId: '1'
                }
            };
            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        })

        it('should delete label', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (deleteLabelQuery as jest.Mock).mockResolvedValue(mockLabel);

            await deleteLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(deleteLabelQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 200,
                message: 'Label deleted successfully',
                data: mockLabel
            });
        });

        it('should return 404 if project not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(null);

            await deleteLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Project not found',
                data: null
            });
        });

        it('should return 400 if project is read-only', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue({
                ...mockProject,
                read_only: true
            });

            await deleteLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 400,
                message: 'Project is read-only',
                data: null
            });
        });

        it('should return 404 if label is not found', async () => {
            (getProjectByIdQuery as jest.Mock).mockResolvedValue(mockProject);
            (deleteLabelQuery as jest.Mock).mockResolvedValue(null);

            await deleteLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(getProjectByIdQuery).toHaveBeenCalledWith('1');
            expect(deleteLabelQuery).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 404,
                message: 'Label not found',
                data: null
            });
        });

        it('should call next with error when getProjectByIdQuery fails', async () => {
            const testError = new Error('Unexpected error');
            (getProjectByIdQuery as jest.Mock).mockRejectedValue(testError);

            await deleteLabel(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(testError);
        });
    });
})