import bcrypt from 'bcrypt';
import User from '../models/User';
import Student from '../models/Student';
import Class from '../models/Class';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin user created successfully');

    // Create some classes
    console.log('Creating classes...');
    const classes = await Class.bulkCreate([
      { name: 'Class 1A', grade: '1', section: 'A' },
      { name: 'Class 1B', grade: '1', section: 'B' },
      { name: 'Class 2A', grade: '2', section: 'A' },
    ]);
    console.log('Classes created successfully');

    // Create some students
    console.log('Creating student users...');
    const hashedStudentPassword = await bcrypt.hash('student123', 10);
    const students = await Promise.all([
      User.create({
        name: 'John Doe',
        email: 'john@school.com',
        password: hashedStudentPassword,
        role: 'student',
      }),
      User.create({
        name: 'Jane Smith',
        email: 'jane@school.com',
        password: hashedStudentPassword,
        role: 'student',
      }),
    ]);
    console.log('Student users created successfully');

    // Create student profiles
    console.log('Creating student profiles...');
    await Student.bulkCreate([
      {
        userId: students[0].id,
        rollNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        address: '123 Student St',
      },
      {
        userId: students[1].id,
        rollNumber: 'STU002',
        dateOfBirth: new Date('2010-02-15'),
        address: '456 Student Ave',
      },
    ]);
    console.log('Student profiles created successfully');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase;