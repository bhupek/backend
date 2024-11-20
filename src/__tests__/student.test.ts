import request from 'supertest';
import { app } from '../server';
import {
  clearDatabase,
  createTestUser,
  createTestSchool,
  createTestClass,
  createTestStudent,
  getAuthToken,
} from './utils/testUtils';

describe('Student Management Tests', () => {
  let adminToken: string;
  let teacherToken: string;
  let school: any;
  let class1: any;

  beforeEach(async () => {
    await clearDatabase();
    
    // Create admin and teacher users
    const admin = await createTestUser({ role: 'admin' });
    const teacher = await createTestUser({
      email: 'teacher@test.com',
      role: 'teacher'
    });

    adminToken = getAuthToken(admin);
    teacherToken = getAuthToken(teacher);

    // Create a school and class
    school = await createTestSchool();
    class1 = await createTestClass({ schoolId: school.id });
  });

  describe('GET /api/students', () => {
    it('should get all students as admin', async () => {
      const student1 = await createTestStudent({ classId: class1.id });
      const student2 = await createTestStudent({
        rollNumber: 'TEST002',
        classId: class1.id
      });

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('rollNumber', student1.rollNumber);
      expect(response.body[1]).toHaveProperty('rollNumber', student2.rollNumber);
    });

    it('should filter students by class', async () => {
      const class2 = await createTestClass({
        name: 'Class 2',
        schoolId: school.id
      });

      const student1 = await createTestStudent({ classId: class1.id });
      const student2 = await createTestStudent({
        rollNumber: 'TEST002',
        classId: class2.id
      });

      const response = await request(app)
        .get(`/api/students?classId=${class1.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('rollNumber', student1.rollNumber);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student details by ID', async () => {
      const student = await createTestStudent({ classId: class1.id });

      const response = await request(app)
        .get(`/api/students/${student.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', student.id);
      expect(response.body).toHaveProperty('rollNumber', student.rollNumber);
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/students/:id/attendance', () => {
    it('should get student attendance records', async () => {
      const student = await createTestStudent({ classId: class1.id });

      const response = await request(app)
        .get(`/api/students/${student.id}/attendance`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/students/:id/fees', () => {
    it('should get student fee records', async () => {
      const student = await createTestStudent({ classId: class1.id });

      const response = await request(app)
        .get(`/api/students/${student.id}/fees`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/students/:id/assignments', () => {
    it('should get student assignments', async () => {
      const student = await createTestStudent({ classId: class1.id });

      const response = await request(app)
        .get(`/api/students/${student.id}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
