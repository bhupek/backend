import request from 'supertest';
import { app } from '../server';
import { clearDatabase, createTestUser, createTestSchool, getAuthToken, createTestClass } from './utils/testUtils';

describe('School Management Tests', () => {
  let adminToken: string;
  let teacherToken: string;

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
  });

  describe('GET /api/schools', () => {
    it('should get all schools as admin', async () => {
      const school1 = await createTestSchool();
      const school2 = await createTestSchool({
        name: 'Another School',
        email: 'another@school.com'
      });

      const response = await request(app)
        .get('/api/schools')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', school1.name);
      expect(response.body[1]).toHaveProperty('name', school2.name);
    });

    it('should restrict access for non-admin users', async () => {
      await createTestSchool();

      const response = await request(app)
        .get('/api/schools')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/schools/:id', () => {
    it('should get school details by ID', async () => {
      const school = await createTestSchool();

      const response = await request(app)
        .get(`/api/schools/${school.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', school.id);
      expect(response.body).toHaveProperty('name', school.name);
    });

    it('should return 404 for non-existent school', async () => {
      const response = await request(app)
        .get('/api/schools/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/schools/:id/classes', () => {
    it('should get all classes for a school', async () => {
      const school = await createTestSchool();
      const class1 = await createTestClass({ schoolId: school.id });
      const class2 = await createTestClass({
        name: 'Another Class',
        schoolId: school.id
      });

      const response = await request(app)
        .get(`/api/schools/${school.id}/classes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', class1.name);
      expect(response.body[1]).toHaveProperty('name', class2.name);
    });
  });

  describe('GET /api/schools/:id/students', () => {
    it('should get all students in a school', async () => {
      const school = await createTestSchool();
      const class1 = await createTestClass({ schoolId: school.id });
      
      const student1 = await createTestStudent({
        classId: class1.id
      });
      const student2 = await createTestStudent({
        rollNumber: 'TEST002',
        classId: class1.id
      });

      const response = await request(app)
        .get(`/api/schools/${school.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('rollNumber', student1.rollNumber);
      expect(response.body[1]).toHaveProperty('rollNumber', student2.rollNumber);
    });
  });
});
