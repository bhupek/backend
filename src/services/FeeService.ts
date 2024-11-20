import { Op } from 'sequelize';
import { FeeType, FeePayment } from '../models';
import { AppError } from '../utils/appError';

interface FeeTypeAttributes {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  schoolId: number;
  isActive?: boolean;
}

interface FeePaymentAttributes {
  studentId: number;
  feeTypeId: number;
  schoolId: number;
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'ONLINE' | 'CHEQUE';
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  month?: number;
  year: number;
  paidBy: string;
  transactionId?: string;
  remarks?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

class FeeService {
  // Fee Type Management
  async createFeeType(data: FeeTypeAttributes) {
    const existingFeeType = await FeeType.findOne({
      where: {
        name: data.name,
        schoolId: data.schoolId,
        isActive: true,
      },
    });

    if (existingFeeType) {
      throw new AppError('A fee type with this name already exists in this school', 400);
    }

    return FeeType.create(data);
  }

  async getAllFeeTypes(options: PaginationOptions) {
    const { page = 1, limit = 10, isActive } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const { count, rows } = await FeeType.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    return {
      feeTypes: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getFeeTypesBySchool(schoolId: number, isActive?: boolean) {
    const where: any = { schoolId };
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    return FeeType.findAll({
      where,
      order: [['name', 'ASC']],
    });
  }

  async getFeeTypeById(id: number) {
    const feeType = await FeeType.findByPk(id);
    if (!feeType) {
      throw new AppError('Fee type not found', 404);
    }
    return feeType;
  }

  async updateFeeType(id: number, data: Partial<FeeTypeAttributes>) {
    const feeType = await this.getFeeTypeById(id);

    if (data.name) {
      const existingFeeType = await FeeType.findOne({
        where: {
          name: data.name,
          schoolId: feeType.schoolId,
          isActive: true,
          id: { [Op.ne]: id },
        },
      });

      if (existingFeeType) {
        throw new AppError('A fee type with this name already exists in this school', 400);
      }
    }

    await feeType.update(data);
    return feeType;
  }

  async deleteFeeType(id: number) {
    const feeType = await this.getFeeTypeById(id);
    
    // Check if there are any payments associated with this fee type
    const hasPayments = await FeePayment.findOne({
      where: { feeTypeId: id },
    });

    if (hasPayments) {
      // Soft delete by marking as inactive
      await feeType.update({ isActive: false });
    } else {
      // Hard delete if no payments exist
      await feeType.destroy();
    }
  }

  // Fee Payment Management
  async createFeePayment(data: FeePaymentAttributes) {
    const feeType = await this.getFeeTypeById(data.feeTypeId);

    if (!feeType.isActive) {
      throw new AppError('Cannot create payment for inactive fee type', 400);
    }

    // For monthly fees, check if payment already exists
    if (feeType.frequency === 'MONTHLY' && data.month) {
      const existingPayment = await FeePayment.findOne({
        where: {
          studentId: data.studentId,
          feeTypeId: data.feeTypeId,
          month: data.month,
          year: data.year,
          status: 'PAID',
        },
      });

      if (existingPayment) {
        throw new AppError('Payment for this month already exists', 400);
      }
    }

    return FeePayment.create({
      ...data,
      amount: data.amount || feeType.amount,
      currency: data.currency || feeType.currency,
      status: 'PAID',
    });
  }

  async updateFeePayment(id: number, data: Partial<FeePaymentAttributes>) {
    const payment = await FeePayment.findByPk(id);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Don't allow changing critical fields if payment is already processed
    if (payment.status === 'PAID') {
      const protectedFields = ['studentId', 'feeTypeId', 'amount', 'currency', 'month', 'year'];
      const hasProtectedFields = protectedFields.some(field => data[field] !== undefined);
      
      if (hasProtectedFields) {
        throw new AppError('Cannot modify critical fields of a processed payment', 400);
      }
    }

    await payment.update(data);
    return payment;
  }

  async getFeePaymentsByStudent(studentId: number, schoolId: number) {
    return FeePayment.findAll({
      where: { studentId, schoolId },
      include: [{ model: FeeType, attributes: ['name', 'frequency'] }],
      order: [['paymentDate', 'DESC']],
    });
  }

  async getAllFeePayments(schoolId: number, options: any) {
    const { page = 1, limit = 10, status, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    const where: any = { schoolId };
    if (status) where.status = status;
    if (startDate && endDate) {
      where.paymentDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const { count, rows } = await FeePayment.findAndCountAll({
      where,
      include: [{ model: FeeType, attributes: ['name', 'frequency'] }],
      limit,
      offset,
      order: [['paymentDate', 'DESC']],
    });

    return {
      payments: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getPendingFeeStudents(
    schoolId: number,
    feeTypeId: number,
    month: number,
    year: number,
    classId?: number
  ) {
    // Implementation depends on your Student model and relationships
    // This is a placeholder for the actual implementation
    throw new AppError('Not implemented', 501);
  }

  async getStudentFeeStatus(studentId: number, schoolId: number, year: number) {
    const feeTypes = await this.getFeeTypesBySchool(schoolId, true);
    const payments = await this.getFeePaymentsByStudent(studentId, schoolId);

    return feeTypes.map(feeType => {
      const feePayments = payments.filter(p => p.feeTypeId === feeType.id);
      
      return {
        feeType: {
          id: feeType.id,
          name: feeType.name,
          amount: feeType.amount,
          frequency: feeType.frequency,
        },
        payments: feePayments,
        status: this.calculateFeeStatus(feeType, feePayments, year),
      };
    });
  }

  private calculateFeeStatus(feeType: any, payments: any[], year: number) {
    const currentMonth = new Date().getMonth() + 1;
    
    switch (feeType.frequency) {
      case 'MONTHLY':
        const monthlyPayments = payments.filter(p => p.year === year);
        const paidMonths = new Set(monthlyPayments.map(p => p.month));
        const pendingMonths = Array.from({ length: currentMonth }, (_, i) => i + 1)
          .filter(month => !paidMonths.has(month));
        
        return {
          paid: monthlyPayments.length,
          pending: pendingMonths.length,
          pendingMonths,
        };

      case 'YEARLY':
        const yearlyPayment = payments.find(p => p.year === year);
        return {
          paid: yearlyPayment ? 1 : 0,
          pending: yearlyPayment ? 0 : 1,
        };

      case 'ONE_TIME':
        const hasPayment = payments.length > 0;
        return {
          paid: hasPayment ? 1 : 0,
          pending: hasPayment ? 0 : 1,
        };

      default:
        return { paid: 0, pending: 0 };
    }
  }

  // Admin Operations
  async bulkCreateFeeTypes(feeTypes: FeeTypeAttributes[]) {
    return await FeeType.bulkCreate(feeTypes);
  }

  async bulkUpdateFeeTypes(updates: { id: number; amount?: number; isActive?: boolean }[]) {
    const results = [];
    for (const update of updates) {
      const feeType = await FeeType.findByPk(update.id);
      if (!feeType) {
        throw new AppError(`Fee type with id ${update.id} not found`, 404);
      }
      await feeType.update(update);
      results.push(feeType);
    }
    return results;
  }

  async generateFeeCollectionReport({
    schoolId,
    startDate,
    endDate,
    feeTypeId,
    classId,
  }: {
    schoolId: number;
    startDate?: Date;
    endDate?: Date;
    feeTypeId?: number;
    classId?: number;
  }) {
    const whereClause: any = {
      schoolId,
      status: 'PAID',
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (feeTypeId) {
      whereClause.feeTypeId = feeTypeId;
    }

    if (classId) {
      whereClause['$student.classId$'] = classId;
    }

    const payments = await FeePayment.findAll({
      where: whereClause,
      include: [
        {
          model: FeeType,
          attributes: ['name', 'frequency'],
        },
      ],
    });

    const report = {
      totalCollection: 0,
      paymentsByType: {},
      paymentsByMonth: {},
    };

    payments.forEach((payment) => {
      report.totalCollection += payment.amount;

      // Group by fee type
      const typeName = payment.feeType.name;
      if (!report.paymentsByType[typeName]) {
        report.paymentsByType[typeName] = 0;
      }
      report.paymentsByType[typeName] += payment.amount;

      // Group by month
      const month = payment.createdAt.toLocaleString('default', { month: 'long' });
      if (!report.paymentsByMonth[month]) {
        report.paymentsByMonth[month] = 0;
      }
      report.paymentsByMonth[month] += payment.amount;
    });

    return report;
  }

  async getDefaultersList({
    schoolId,
    month,
    year,
    classId,
  }: {
    schoolId: number;
    month?: number;
    year: number;
    classId?: number;
  }) {
    const whereClause: any = {
      schoolId,
      frequency: 'MONTHLY',
    };

    if (classId) {
      whereClause['$student.classId$'] = classId;
    }

    const feeTypes = await FeeType.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'amount'],
    });

    const defaulters = [];

    for (const feeType of feeTypes) {
      const payments = await FeePayment.findAll({
        where: {
          feeTypeId: feeType.id,
          schoolId,
          status: 'PAID',
          month: month || { [Op.ne]: null },
          year,
        },
        include: [
          {
            model: FeeType,
            attributes: ['name'],
          },
        ],
      });

      const defaulterStudents = await this.getPendingFeeStudents(
        schoolId,
        feeType.id,
        month || new Date().getMonth() + 1,
        year,
        classId
      );

      defaulters.push({
        feeType: feeType.name,
        defaulterCount: defaulterStudents.length,
        totalPendingAmount: defaulterStudents.length * feeType.amount,
        defaulters: defaulterStudents,
      });
    }

    return defaulters;
  }

  async getDailyCollectionReport(schoolId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await FeePayment.findAll({
      where: {
        schoolId,
        status: 'PAID',
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      include: [
        {
          model: FeeType,
          attributes: ['name'],
        },
      ],
    });

    const report = {
      date: date.toISOString().split('T')[0],
      totalCollection: 0,
      paymentsByMethod: {
        CASH: 0,
        ONLINE: 0,
        CHEQUE: 0,
      },
      paymentsByType: {},
    };

    payments.forEach((payment) => {
      report.totalCollection += payment.amount;
      report.paymentsByMethod[payment.paymentMethod] += payment.amount;

      const typeName = payment.feeType.name;
      if (!report.paymentsByType[typeName]) {
        report.paymentsByType[typeName] = 0;
      }
      report.paymentsByType[typeName] += payment.amount;
    });

    return report;
  }

  async deactivateAllFeeTypes(schoolId: number) {
    await FeeType.update(
      { isActive: false },
      {
        where: {
          schoolId,
          isActive: true,
        },
      }
    );
  }

  async activateAllFeeTypes(schoolId: number) {
    await FeeType.update(
      { isActive: true },
      {
        where: {
          schoolId,
          isActive: false,
        },
      }
    );
  }

  async cancelPayment(paymentId: number, reason: string, cancelledBy: number) {
    const payment = await FeePayment.findByPk(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'PAID') {
      throw new AppError('Only paid payments can be cancelled', 400);
    }

    await payment.update({
      status: 'CANCELLED',
      remarks: `Cancelled by admin (${cancelledBy}). Reason: ${reason}`,
    });

    return payment;
  }

  async refundPayment(
    paymentId: number,
    {
      reason,
      refundMethod,
      refundedBy,
    }: {
      reason: string;
      refundMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
      refundedBy: number;
    }
  ) {
    const payment = await FeePayment.findByPk(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'PAID') {
      throw new AppError('Only paid payments can be refunded', 400);
    }

    await payment.update({
      status: 'REFUNDED',
      remarks: `Refunded by admin (${refundedBy}). Method: ${refundMethod}. Reason: ${reason}`,
    });

    return payment;
  }

  async getRevenueAnalytics({
    schoolId,
    startDate,
    endDate,
  }: {
    schoolId: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const whereClause: any = {
      schoolId,
      status: 'PAID',
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const payments = await FeePayment.findAll({
      where: whereClause,
      include: [
        {
          model: FeeType,
          attributes: ['name', 'frequency'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const analytics = {
      totalRevenue: 0,
      revenueByFrequency: {
        MONTHLY: 0,
        YEARLY: 0,
        ONE_TIME: 0,
      },
      monthlyTrend: {},
    };

    payments.forEach((payment) => {
      analytics.totalRevenue += payment.amount;
      analytics.revenueByFrequency[payment.feeType.frequency] += payment.amount;

      const month = payment.createdAt.toLocaleString('default', { month: 'long' });
      if (!analytics.monthlyTrend[month]) {
        analytics.monthlyTrend[month] = 0;
      }
      analytics.monthlyTrend[month] += payment.amount;
    });

    return analytics;
  }

  async getPaymentMethodStats({
    schoolId,
    startDate,
    endDate,
  }: {
    schoolId: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const whereClause: any = {
      schoolId,
      status: 'PAID',
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const payments = await FeePayment.findAll({
      where: whereClause,
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      group: ['paymentMethod'],
    });

    const stats = {
      CASH: { count: 0, total: 0 },
      ONLINE: { count: 0, total: 0 },
      CHEQUE: { count: 0, total: 0 },
    };

    payments.forEach((payment) => {
      stats[payment.paymentMethod] = {
        count: parseInt(payment.getDataValue('count')),
        total: parseFloat(payment.getDataValue('total')),
      };
    });

    return stats;
  }
}

export default new FeeService();
