import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { AppError } from '../utils/appError';
import FeeService from '../services/FeeService';

// Validation schemas
const bulkFeeTypeSchema = z.object({
  body: z.object({
    feeTypes: z.array(z.object({
      name: z.string().min(1, 'Fee type name is required'),
      description: z.string().optional(),
      amount: z.number().positive('Amount must be positive'),
      currency: z.string().length(3).default('INR'),
      frequency: z.enum(['MONTHLY', 'YEARLY', 'ONE_TIME']),
      schoolId: z.number(),
      isActive: z.boolean().default(true),
    })),
  }),
});

const bulkFeeUpdateSchema = z.object({
  body: z.object({
    updates: z.array(z.object({
      id: z.number(),
      amount: z.number().positive('Amount must be positive').optional(),
      isActive: z.boolean().optional(),
    })),
  }),
});

const feeReportSchema = z.object({
  query: z.object({
    schoolId: z.string().transform(Number),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    feeTypeId: z.string().transform(Number).optional(),
    classId: z.string().transform(Number).optional(),
  }),
});

class AdminController {
  // Bulk Operations
  bulkCreateFeeTypes = [
    validateRequest(bulkFeeTypeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { feeTypes } = req.body;
      const createdTypes = await FeeService.bulkCreateFeeTypes(feeTypes);
      
      res.status(201).json({
        status: 'success',
        data: createdTypes,
      });
    }),
  ];

  bulkUpdateFeeTypes = [
    validateRequest(bulkFeeUpdateSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { updates } = req.body;
      const updatedTypes = await FeeService.bulkUpdateFeeTypes(updates);
      
      res.json({
        status: 'success',
        data: updatedTypes,
      });
    }),
  ];

  // Reports and Analytics
  getFeeCollectionReport = [
    validateRequest(feeReportSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, startDate, endDate, feeTypeId, classId } = req.query;
      
      const report = await FeeService.generateFeeCollectionReport({
        schoolId: Number(schoolId),
        startDate: startDate ? new Date(startDate.toString()) : undefined,
        endDate: endDate ? new Date(endDate.toString()) : undefined,
        feeTypeId: feeTypeId ? Number(feeTypeId) : undefined,
        classId: classId ? Number(classId) : undefined,
      });
      
      res.json({
        status: 'success',
        data: report,
      });
    }),
  ];

  getDefaultersList = catchAsync(async (req: Request, res: Response) => {
    const { schoolId, month, year, classId } = req.query;
    
    const defaulters = await FeeService.getDefaultersList({
      schoolId: Number(schoolId),
      month: month ? Number(month) : undefined,
      year: Number(year) || new Date().getFullYear(),
      classId: classId ? Number(classId) : undefined,
    });
    
    res.json({
      status: 'success',
      data: defaulters,
    });
  });

  getDailyCollectionReport = catchAsync(async (req: Request, res: Response) => {
    const { schoolId, date } = req.query;
    
    const report = await FeeService.getDailyCollectionReport(
      Number(schoolId),
      date ? new Date(date.toString()) : new Date()
    );
    
    res.json({
      status: 'success',
      data: report,
    });
  });

  // Fee Type Management
  deactivateAllFeeTypes = catchAsync(async (req: Request, res: Response) => {
    const { schoolId } = req.params;
    
    await FeeService.deactivateAllFeeTypes(Number(schoolId));
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  activateAllFeeTypes = catchAsync(async (req: Request, res: Response) => {
    const { schoolId } = req.params;
    
    await FeeService.activateAllFeeTypes(Number(schoolId));
    
    res.status(200).json({
      status: 'success',
      message: 'All fee types activated successfully',
    });
  });

  // Fee Payment Management
  cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    await FeeService.cancelPayment(Number(paymentId), reason, req.user.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Payment cancelled successfully',
    });
  });

  refundPayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { reason, refundMethod } = req.body;
    
    await FeeService.refundPayment(Number(paymentId), {
      reason,
      refundMethod,
      refundedBy: req.user.id,
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Payment refunded successfully',
    });
  });

  // Analytics
  getRevenueAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { schoolId, startDate, endDate } = req.query;
    
    const analytics = await FeeService.getRevenueAnalytics({
      schoolId: Number(schoolId),
      startDate: startDate ? new Date(startDate.toString()) : undefined,
      endDate: endDate ? new Date(endDate.toString()) : undefined,
    });
    
    res.json({
      status: 'success',
      data: analytics,
    });
  });

  getPaymentMethodStats = catchAsync(async (req: Request, res: Response) => {
    const { schoolId, startDate, endDate } = req.query;
    
    const stats = await FeeService.getPaymentMethodStats({
      schoolId: Number(schoolId),
      startDate: startDate ? new Date(startDate.toString()) : undefined,
      endDate: endDate ? new Date(endDate.toString()) : undefined,
    });
    
    res.json({
      status: 'success',
      data: stats,
    });
  });
}

export default new AdminController();
