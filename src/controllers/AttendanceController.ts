import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import AttendanceService from '../services/AttendanceService';
import { validateRequest } from '../middleware/validate';
import { ApiError } from '../utils/ApiError';
import { z } from 'zod';

const createAttendanceSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    classId: z.string().uuid(),
    schoolId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    remarks: z.string().optional(),
  }),
});

const bulkCreateSchema = z.object({
  body: z.object({
    studentIds: z.array(z.string().uuid()),
    classId: z.string().uuid(),
    schoolId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    remarks: z.string().optional(),
  }),
});

const updateAttendanceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['present', 'absent', 'late', 'excused']).optional(),
    remarks: z.string().optional(),
  }),
});

class AttendanceController {
  create = [
    validateRequest(createAttendanceSchema),
    catchAsync(async (req: Request, res: Response) => {
      const attendance = await AttendanceService.create({
        ...req.body,
        markedBy: req.user.id,
      });
      res.status(201).json(attendance);
    }),
  ];

  bulkCreate = [
    validateRequest(bulkCreateSchema),
    catchAsync(async (req: Request, res: Response) => {
      const attendanceRecords = await AttendanceService.bulkCreate({
        ...req.body,
        markedBy: req.user.id,
      });
      res.status(201).json(attendanceRecords);
    }),
  ];

  update = [
    validateRequest(updateAttendanceSchema),
    catchAsync(async (req: Request, res: Response) => {
      const attendance = await AttendanceService.update(req.params.id, req.body);
      res.json(attendance);
    }),
  ];

  getByStudent = catchAsync(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    const attendance = await AttendanceService.getByStudent(
      studentId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json(attendance);
  });

  getByClass = catchAsync(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new ApiError(400, 'Date is required');
    }

    const attendance = await AttendanceService.getByClass(
      classId,
      new Date(date as string)
    );
    
    res.json(attendance);
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    await AttendanceService.delete(req.params.id);
    res.status(204).send();
  });
}

export default new AttendanceController();
