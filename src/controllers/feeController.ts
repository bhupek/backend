import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import FeeService from '../services/FeeService';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { AppError } from '../utils/appError';

const createFeeTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Fee type name is required'),
    description: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().length(3).default('INR'),
    frequency: z.enum(['MONTHLY', 'YEARLY', 'ONE_TIME']),
    schoolId: z.number(),
    isActive: z.boolean().default(true),
  }),
});

const updateFeeTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Fee type name is required').optional(),
    description: z.string().optional(),
    amount: z.number().positive('Amount must be positive').optional(),
    currency: z.string().length(3).optional(),
    frequency: z.enum(['MONTHLY', 'YEARLY', 'ONE_TIME']).optional(),
    isActive: z.boolean().optional(),
  }),
});

const createFeePaymentSchema = z.object({
  body: z.object({
    studentId: z.number(),
    feeTypeId: z.number(),
    schoolId: z.number(),
    paymentMethod: z.enum(['CASH', 'ONLINE', 'CHEQUE']),
    transactionId: z.string().optional(),
    month: z.number().min(1).max(12).optional(),
    year: z.number(),
    remarks: z.string().optional(),
  }),
});

const getFeePaymentsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

const getPendingFeesSchema = z.object({
  query: z.object({
    feeTypeId: z.string().transform(Number),
    month: z.string().transform(Number),
    year: z.string().transform(Number),
    classId: z.string().transform(Number).optional(),
  }),
});

class FeeController {
  // Fee Type Management
  createFeeType = [
    validateRequest(createFeeTypeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const feeType = await FeeService.createFeeType(req.body);
      res.status(201).json({
        status: 'success',
        data: feeType,
      });
    }),
  ];

  getAllFeeTypes = catchAsync(async (req: Request, res: Response) => {
    const { page = '1', limit = '10', isActive } = req.query;
    const options = {
      page: Number(page),
      limit: Number(limit),
      isActive: isActive === 'true',
    };
    
    const feeTypes = await FeeService.getAllFeeTypes(options);
    res.json({
      status: 'success',
      data: feeTypes,
    });
  });

  getFeeTypesBySchool = catchAsync(async (req: Request, res: Response) => {
    const { schoolId } = req.params;
    const { isActive } = req.query;
    
    const feeTypes = await FeeService.getFeeTypesBySchool(
      Number(schoolId),
      isActive === 'true'
    );
    
    res.json({
      status: 'success',
      data: feeTypes,
    });
  });

  getFeeTypeById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const feeType = await FeeService.getFeeTypeById(Number(id));
    
    if (!feeType) {
      throw new AppError('Fee type not found', 404);
    }
    
    res.json({
      status: 'success',
      data: feeType,
    });
  });

  updateFeeType = [
    validateRequest(updateFeeTypeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { id } = req.params;
      const feeType = await FeeService.updateFeeType(Number(id), req.body);
      
      if (!feeType) {
        throw new AppError('Fee type not found', 404);
      }
      
      res.json({
        status: 'success',
        data: feeType,
      });
    }),
  ];

  deleteFeeType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await FeeService.deleteFeeType(Number(id));
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  // Fee Payment Management
  createFeePayment = [
    validateRequest(createFeePaymentSchema),
    catchAsync(async (req: Request, res: Response) => {
      const payment = await FeeService.createFeePayment({
        ...req.body,
        paidBy: req.user.id,
      });
      res.status(201).json({
        status: 'success',
        data: payment,
      });
    }),
  ];

  updateFeePayment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payment = await FeeService.updateFeePayment(Number(id), req.body);
    res.json({
      status: 'success',
      data: payment,
    });
  });

  getFeePaymentsByStudent = catchAsync(async (req: Request, res: Response) => {
    const { studentId, schoolId } = req.params;
    const payments = await FeeService.getFeePaymentsByStudent(
      Number(studentId),
      Number(schoolId)
    );
    res.json({
      status: 'success',
      data: payments,
    });
  });

  getAllFeePayments = [
    validateRequest(getFeePaymentsSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId } = req.params;
      const { page, limit, status, startDate, endDate } = req.query;
      
      const payments = await FeeService.getAllFeePayments(Number(schoolId), {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status: status?.toString(),
        startDate: startDate ? new Date(startDate.toString()) : undefined,
        endDate: endDate ? new Date(endDate.toString()) : undefined,
      });
      
      res.json({
        status: 'success',
        data: payments,
      });
    }),
  ];

  getPendingFeeStudents = [
    validateRequest(getPendingFeesSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId } = req.params;
      const { feeTypeId, month, year, classId } = req.query;
      
      const students = await FeeService.getPendingFeeStudents(
        Number(schoolId),
        Number(feeTypeId),
        Number(month),
        Number(year),
        classId ? Number(classId) : undefined
      );
      
      res.json({
        status: 'success',
        data: students,
      });
    }),
  ];

  getStudentFeeStatus = catchAsync(async (req: Request, res: Response) => {
    const { studentId, schoolId } = req.params;
    const year = Number(req.query.year) || new Date().getFullYear();
    
    const status = await FeeService.getStudentFeeStatus(
      Number(studentId),
      Number(schoolId),
      year
    );
    
    res.json({
      status: 'success',
      data: status,
    });
  });
}

export default new FeeController();