import { Application } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import config from '../../config';
import type { Config } from '../../config';
import User from '../../models/User';
import School from '../../models/School';
import Class from '../../models/Class';
import Student from '../../models/Student';
import type { UserAttributes } from '../../models/User';
import type { SchoolAttributes } from '../../models/School';
import type { ClassAttributes } from '../../models/Class';
import type { StudentAttributes } from '../../models/Student';

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export const getAuthToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  );
};

export const createTestUser = async (userData: Partial<UserAttributes> = {}): Promise<User> => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin',
  };

  return await User.create({ ...defaultUser, ...userData });
};

export const createTestSchool = async (schoolData: Partial<SchoolAttributes> = {}): Promise<School> => {
  const defaultSchool = {
    name: 'Test School',
    address: '123 Test St',
    contactNumber: '1234567890',
    email: 'school@test.com',
    status: 'active'
  };

  return await School.create({ ...defaultSchool, ...schoolData });
};

export const createTestClass = async (classData: Partial<ClassAttributes> = {}): Promise<Class> => {
  const defaultClass = {
    name: 'Test Class',
    grade: '1',
    section: 'A',
    capacity: 30,
    academicYear: new Date().getFullYear().toString(),
    status: 'active',
    schoolId: 1
  };

  return await Class.create({ ...defaultClass, ...classData });
};

export const createTestStudent = async (studentData: Partial<StudentAttributes> = {}): Promise<Student> => {
  const defaultStudent = {
    rollNumber: Math.random().toString(36).substring(7),
    dateOfBirth: new Date(),
    address: '123 Student St',
    userId: 1,
    status: 'active'
  };

  return await Student.create({ ...defaultStudent, ...studentData });
};

export const clearDatabase = async (): Promise<void> => {
  await Student.destroy({ where: {}, force: true });
  await Class.destroy({ where: {}, force: true });
  await School.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
};
