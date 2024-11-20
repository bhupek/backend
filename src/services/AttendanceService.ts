import { Transaction } from 'sequelize';
import Attendance from '../models/Attendance';
import { ApiError } from '../utils/ApiError';
import sequelize from '../config/database';

interface CreateAttendanceData {
  studentId: string;
  classId: string;
  schoolId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy: string;
}

interface BulkAttendanceData extends Omit<CreateAttendanceData, 'studentId'> {
  studentIds: string[];
}

class AttendanceService {
  async create(data: CreateAttendanceData): Promise<Attendance> {
    // Check for existing attendance record
    const existingAttendance = await Attendance.findOne({
      where: {
        studentId: data.studentId,
        classId: data.classId,
        date: data.date,
      },
    });

    if (existingAttendance) {
      throw new ApiError(400, 'Attendance record already exists for this student on this date');
    }

    return Attendance.create(data);
  }

  async bulkCreate(data: BulkAttendanceData): Promise<Attendance[]> {
    const { studentIds, ...commonData } = data;
    
    const attendanceRecords = studentIds.map(studentId => ({
      ...commonData,
      studentId,
    }));

    const transaction = await sequelize.transaction();

    try {
      const createdRecords = await Attendance.bulkCreate(attendanceRecords, {
        transaction,
        validate: true,
      });

      await transaction.commit();
      return createdRecords;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<CreateAttendanceData>
  ): Promise<Attendance | null> {
    const attendance = await Attendance.findByPk(id);
    
    if (!attendance) {
      throw new ApiError(404, 'Attendance record not found');
    }

    return attendance.update(data);
  }

  async getByStudent(studentId: string, startDate?: Date, endDate?: Date) {
    const where: any = { studentId };
    
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    return Attendance.findAll({
      where,
      order: [['date', 'DESC']],
    });
  }

  async getByClass(classId: string, date: Date) {
    return Attendance.findAll({
      where: { classId, date },
      include: ['student'],
      order: [['student', 'firstName', 'ASC']],
    });
  }

  async delete(id: string, transaction?: Transaction): Promise<void> {
    const attendance = await Attendance.findByPk(id);
    
    if (!attendance) {
      throw new ApiError(404, 'Attendance record not found');
    }

    await attendance.destroy({ transaction });
  }
}

export default new AttendanceService();
