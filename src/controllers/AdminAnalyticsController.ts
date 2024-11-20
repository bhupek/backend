import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import AnalyticsService from '../services/AnalyticsService';
import { prisma } from '../config/database';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

// Validation schemas
const dateRangeSchema = z.object({
  query: z.object({
    schoolId: z.string().transform(Number),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    classId: z.string().transform(Number).optional(),
    section: z.string().optional(),
    period: z.enum(['day', 'week', 'month']).optional(),
  }),
});

const specificDateSchema = z.object({
  query: z.object({
    schoolId: z.string().transform(Number),
    date: z.string(),
    classId: z.string().transform(Number).optional(),
    section: z.string().optional(),
  }),
});

class AdminAnalyticsController {
  // Get time period dates
  private getTimePeriodDates(period: string = 'day') {
    const now = new Date();
    switch (period) {
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
    }
  }

  // Attendance Analytics
  getAttendanceAnalytics = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, startDate, endDate, classId, section } = req.query;
      
      const analytics = await AnalyticsService.getAttendanceAnalytics({
        schoolId: Number(schoolId),
        startDate: startDate ? new Date(startDate.toString()) : undefined,
        endDate: endDate ? new Date(endDate.toString()) : undefined,
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: analytics,
      });
    }),
  ];

  getDailyAttendance = [
    validateRequest(specificDateSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, date, classId, section } = req.query;
      
      const report = await AnalyticsService.getDailyAttendanceReport({
        schoolId: Number(schoolId),
        date: new Date(date.toString()),
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: report,
      });
    }),
  ];

  getWeeklyAttendance = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, startDate, classId, section } = req.query;
      
      const report = await AnalyticsService.getWeeklyAttendanceReport({
        schoolId: Number(schoolId),
        weekStartDate: startDate ? new Date(startDate.toString()) : new Date(),
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: report,
      });
    }),
  ];

  getMonthlyAttendance = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, startDate, classId, section } = req.query;
      
      const report = await AnalyticsService.getMonthlyAttendanceReport({
        schoolId: Number(schoolId),
        month: startDate ? new Date(startDate.toString()).getMonth() + 1 : new Date().getMonth() + 1,
        year: startDate ? new Date(startDate.toString()).getFullYear() : new Date().getFullYear(),
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: report,
      });
    }),
  ];

  // Attendance Analytics Trends
  getAttendanceTrends = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, period, classId, section } = req.query;
      const { start, end } = this.getTimePeriodDates(period?.toString());

      const attendanceData = await prisma.attendance.groupBy({
        by: ['date'],
        where: {
          schoolId: Number(schoolId),
          date: {
            gte: start,
            lte: end,
          },
          ...(classId && { classId: Number(classId) }),
          ...(section && { section: section.toString() }),
        },
        _count: {
          id: true,
        },
        _avg: {
          isPresent: true,
        },
      });

      res.json({
        status: 'success',
        data: attendanceData.map(data => ({
          date: data.date,
          count: data._count.id,
          averageAttendance: Math.round((data._avg.isPresent || 0) * 100),
        })),
      });
    }),
  ];

  // Homework Analytics
  getHomeworkAnalytics = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, startDate, endDate, classId, section } = req.query;
      
      const analytics = await AnalyticsService.getHomeworkAnalytics({
        schoolId: Number(schoolId),
        startDate: startDate ? new Date(startDate.toString()) : undefined,
        endDate: endDate ? new Date(endDate.toString()) : undefined,
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: analytics,
      });
    }),
  ];

  getDailyHomeworkStatus = [
    validateRequest(specificDateSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, date, classId, section } = req.query;
      
      const report = await AnalyticsService.getDailyHomeworkReport({
        schoolId: Number(schoolId),
        date: new Date(date.toString()),
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: report,
      });
    }),
  ];

  // Homework Analytics Trends
  getHomeworkTrends = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, period, classId, section } = req.query;
      const { start, end } = this.getTimePeriodDates(period?.toString());

      const homeworkData = await prisma.homework.groupBy({
        by: ['createdAt'],
        where: {
          schoolId: Number(schoolId),
          createdAt: {
            gte: start,
            lte: end,
          },
          ...(classId && { classId: Number(classId) }),
          ...(section && { section: section.toString() }),
        },
        _count: {
          id: true,
        },
        _avg: {
          maxMarks: true,
        },
      });

      res.json({
        status: 'success',
        data: homeworkData.map(data => ({
          date: data.createdAt,
          count: data._count.id,
          averageMaxMarks: Math.round(data._avg.maxMarks || 0),
        })),
      });
    }),
  ];

  // Classwork Analytics
  getClassworkAnalytics = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, startDate, endDate, classId, section } = req.query;
      
      const analytics = await AnalyticsService.getClassworkAnalytics({
        schoolId: Number(schoolId),
        startDate: startDate ? new Date(startDate.toString()) : undefined,
        endDate: endDate ? new Date(endDate.toString()) : undefined,
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: analytics,
      });
    }),
  ];

  getDailyClassworkStatus = [
    validateRequest(specificDateSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, date, classId, section } = req.query;
      
      const report = await AnalyticsService.getDailyClassworkReport({
        schoolId: Number(schoolId),
        date: new Date(date.toString()),
        classId: classId ? Number(classId) : undefined,
        section: section?.toString(),
      });
      
      res.json({
        status: 'success',
        data: report,
      });
    }),
  ];

  // Classwork Analytics Trends
  getClassworkTrends = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, period, classId, section } = req.query;
      const { start, end } = this.getTimePeriodDates(period?.toString());

      const classworkData = await prisma.classwork.groupBy({
        by: ['createdAt'],
        where: {
          schoolId: Number(schoolId),
          createdAt: {
            gte: start,
            lte: end,
          },
          ...(classId && { classId: Number(classId) }),
          ...(section && { section: section.toString() }),
        },
        _count: {
          id: true,
        },
        _avg: {
          maxMarks: true,
        },
      });

      res.json({
        status: 'success',
        data: classworkData.map(data => ({
          date: data.createdAt,
          count: data._count.id,
          averageMaxMarks: Math.round(data._avg.maxMarks || 0),
        })),
      });
    }),
  ];

  // Payment Analytics
  getPaymentTrends = [
    validateRequest(dateRangeSchema),
    catchAsync(async (req: Request, res: Response) => {
      const { schoolId, period, classId, section } = req.query;
      const { start, end } = this.getTimePeriodDates(period?.toString());

      const paymentData = await prisma.payment.groupBy({
        by: ['createdAt'],
        where: {
          schoolId: Number(schoolId),
          createdAt: {
            gte: start,
            lte: end,
          },
          ...(classId && { classId: Number(classId) }),
          ...(section && { section: section.toString() }),
        },
        _count: {
          id: true,
        },
        _sum: {
          amount: true,
        },
      });

      res.json({
        status: 'success',
        data: paymentData.map(data => ({
          date: data.createdAt,
          count: data._count.id,
          totalAmount: data._sum.amount || 0,
        })),
      });
    }),
  ];

  getPaymentDefaulters = catchAsync(async (req: Request, res: Response) => {
    const { schoolId, month, year, classId } = req.query;
    
    const defaulters = await AnalyticsService.getPaymentDefaulters({
      schoolId: Number(schoolId),
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : new Date().getFullYear(),
      classId: classId ? Number(classId) : undefined,
    });
    
    res.json({
      status: 'success',
      data: defaulters,
    });
  });

  getPaymentSummary = catchAsync(async (req: Request, res: Response) => {
    const { schoolId, startDate, endDate } = req.query;
    
    const summary = await AnalyticsService.getPaymentSummary({
      schoolId: Number(schoolId),
      startDate: startDate ? new Date(startDate.toString()) : undefined,
      endDate: endDate ? new Date(endDate.toString()) : undefined,
    });
    
    res.json({
      status: 'success',
      data: summary,
    });
  });
}

export default new AdminAnalyticsController();
