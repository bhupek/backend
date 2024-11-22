import { Request, Response } from 'express';
import { sequelize } from '../db';
import { QueryTypes } from 'sequelize';

export const getAttendanceTrends = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, classId } = req.query;

    let whereClause = '';
    const queryParams: any = {};

    if (startDate) {
      whereClause += ' AND date >= :startDate';
      queryParams.startDate = startDate;
    }
    if (endDate) {
      whereClause += ' AND date <= :endDate';
      queryParams.endDate = endDate;
    }
    if (classId) {
      whereClause += ' AND class_id = :classId';
      queryParams.classId = classId;
    }

    const query = `
      SELECT 
        date::date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent
      FROM attendances
      WHERE 1=1 ${whereClause}
      GROUP BY date::date
      ORDER BY date::date
    `;

    const attendanceData = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: queryParams
    });

    res.json({
      success: true,
      data: attendanceData,
      message: 'Attendance trends retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching attendance trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance trends',
    });
  }
};

export const getClassworkTrends = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, classId } = req.query;

    let whereClause = '';
    const queryParams: any = {};

    if (startDate) {
      whereClause += ' AND a.due_date >= :startDate';
      queryParams.startDate = startDate;
    }
    if (endDate) {
      whereClause += ' AND a.due_date <= :endDate';
      queryParams.endDate = endDate;
    }
    if (classId) {
      whereClause += ' AND a.class_id = :classId';
      queryParams.classId = classId;
    }

    const query = `
      SELECT 
        a.id as assignment_id,
        a.title,
        a.due_date,
        COUNT(s.id) as total_submissions,
        COUNT(CASE WHEN s.submitted_at <= a.due_date THEN 1 END) as on_time_submissions,
        COUNT(CASE WHEN s.submitted_at > a.due_date THEN 1 END) as late_submissions
      FROM assignments a
      LEFT JOIN submissions s ON s.assignment_id = a.id
      WHERE 1=1 ${whereClause}
      GROUP BY a.id, a.title, a.due_date
      ORDER BY a.due_date
    `;

    const assignmentData = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: queryParams
    });

    res.json({
      success: true,
      data: assignmentData,
      message: 'Classwork trends retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching classwork trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classwork trends',
    });
  }
};

export const getFeePaymentStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = '';
    const queryParams: any = {};

    if (startDate) {
      whereClause += ' AND fp.paid_at >= :startDate';
      queryParams.startDate = startDate;
    }
    if (endDate) {
      whereClause += ' AND fp.paid_at <= :endDate';
      queryParams.endDate = endDate;
    }

    const query = `
      SELECT 
        COALESCE(SUM(fp.amount), 0) as total_amount,
        json_agg(json_build_object(
          'type', ft.name,
          'count', COUNT(*),
          'amount', SUM(fp.amount)
        )) as payments_by_type,
        json_agg(json_build_object(
          'month', TO_CHAR(fp.paid_at, 'YYYY-MM'),
          'count', COUNT(*),
          'amount', SUM(fp.amount)
        )) as payments_by_month
      FROM fee_payments fp
      JOIN fee_types ft ON ft.id = fp.fee_type_id
      WHERE 1=1 ${whereClause}
      GROUP BY ft.name, TO_CHAR(fp.paid_at, 'YYYY-MM')
    `;

    const stats = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: queryParams
    });

    res.json({
      success: true,
      data: stats[0],
      message: 'Fee payment statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching fee payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fee payment statistics',
    });
  }
};
