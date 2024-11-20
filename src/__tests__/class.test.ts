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

describe('Class Management Tests', () => {
  let adminToken: string;
  let teacherToken: string;
  let school: any;

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

    // Create a school
    school = await createTestSchool();
  });

  describe('GET /api/classes', () => {
    it('should get all classes as admin', async () => {
      const class1 = await createTestClass({ schoolId: school.id });
      const class2 = await createTestClass({
        name: 'Class 2',
        schoolId: school.id
      });

      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', class1.name);
      expect(response.body[1]).toHaveProperty('name', class2.name);
    });

    it('should filter classes by school', async () => {
      const school2 = await createTestSchool({
        name: 'School 2',
        email: 'school2@test.com'
      });

      const class1 = await createTestClass({ schoolId: school.id });
      const class2 = await createTestClass({
        name: 'Class 2',
        schoolId: school2.id
      });

      const response = await request(app)
        .get(`/api/classes?schoolId=${school.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', class1.name);
    });
  });

  describe('GET /api/classes/:id', () => {
    it('should get class details by ID', async () => {
      const class1 = await createTestClass({ schoolId: school.id });

      const response = await request(app)
        .get(`/api/classes/${class1.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', class1.id);
      expect(response.body).toHaveProperty('name', class1.name);
    });

    it('should return 404 for non-existent class', async () => {
      const response = await request(app)
        .get('/api/classes/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/classes/:id/students', () => {
    it('should get all students in a class', async () => {
      const class1 = await createTestClass({ schoolId: school.id });
      const student1 = await createTestStudent({ classId: class1.id });
      const student2 = await createTestStudent({
        rollNumber: 'TEST002',
        classId: class1.id
      });

      const response = await request(app)
        .get(`/api/classes/${class1.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('rollNumber', student1.rollNumber);
      expect(response.body[1]).toHaveProperty('rollNumber', student2.rollNumber);
    });
  });

  describe('GET /api/classes/:id/attendance', () => {
    it('should get class attendance records', async () => {
      const class1 = await createTestClass({ schoolId: school.id });

      const response = await request(app)
        .get(`/api/classes/${class1.id}/attendance`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/classes/:id/assignments', () => {
    it('should get class assignments', async () => {
      const class1 = await createTestClass({ schoolId: school.id });

      const response = await request(app)
        .get(`/api/classes/${class1.id}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/classes/:id/schedule', () => {
    it('should get class schedule', async () => {
      const class1 = await createTestClass({ schoolId: school.id });

      const response = await request(app)
        .get(`/api/classes/${class1.id}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
