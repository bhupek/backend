import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import Student from '../models/Student';
import Class from '../models/Class';
import School from '../models/School';
import { Role } from '../models/RolePermission';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@school.com',
      password: hashedPassword,
      role: Role.ADMIN,
    });
    console.log('Admin user created successfully');

    // Create a school
    console.log('Creating school...');
    const school = await School.create({
      id: uuidv4(),
      name: 'Demo School',
      address: '123 School Street',
      contact_number: '1234567890',
      email: 'contact@demoschool.com',
      domain_name: 'www.demoschool.com',
      settings: {},
      theme_colors: {},
      features: [],
      customization: {},
      role_config: {},
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('School created successfully');

    // Create some classes
    console.log('Creating classes...');
    let classes;
    const currentYear = new Date().getFullYear().toString();
    try {
      classes = await Promise.all([
        Class.create({ 
          id: uuidv4(),
          name: 'Class 1A', 
          grade: '1', 
          section: 'A', 
          school_id: school.id,
          status: 'ACTIVE',
          capacity: 30,
          academic_year: currentYear,
          created_at: new Date(),
          updated_at: new Date()
        }),
        Class.create({ 
          id: uuidv4(),
          name: 'Class 1B', 
          grade: '1', 
          section: 'B', 
          school_id: school.id,
          status: 'ACTIVE',
          capacity: 30,
          academic_year: currentYear,
          created_at: new Date(),
          updated_at: new Date()
        }),
        Class.create({ 
          id: uuidv4(),
          name: 'Class 2A', 
          grade: '2', 
          section: 'A', 
          school_id: school.id,
          status: 'ACTIVE',
          capacity: 30,
          academic_year: currentYear,
          created_at: new Date(),
          updated_at: new Date()
        })
      ]);
      console.log('Classes created successfully');
    } catch (error) {
      console.error('Error creating classes:', error);
      throw error;
    }

    // Create some students
    console.log('Creating student users...');
    const hashedStudentPassword = await bcrypt.hash('student123', 10);
    const students = await Promise.all([
      User.create({
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@school.com',
        password: hashedStudentPassword,
        role: Role.STUDENT,
      }),
      User.create({
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane@school.com',
        password: hashedStudentPassword,
        role: Role.STUDENT,
      })
    ]);
    console.log('Student users created successfully');

    // Create student profiles
    console.log('Creating student profiles...');
    await Promise.all(
      students.map((user, index) => {
        const [firstName, lastName] = user.name.split(' ');
        return Student.create({
          id: uuidv4(),
          user_id: user.id,
          school_id: school.id,
          class_id: classes[index].id,
          first_name: firstName,
          last_name: lastName,
          roll_number: `2023${index + 1}`,
          class_name: classes[index].name,
          blood_group: 'O+',
          medical_info: {
            allergies: [],
            medications: []
          },
          parents: {
            father: {
              name: `${firstName}'s Father`,
              phone: '1234567890',
              email: `father.${firstName.toLowerCase()}@example.com`
            },
            mother: {
              name: `${firstName}'s Mother`,
              phone: '0987654321',
              email: `mother.${firstName.toLowerCase()}@example.com`
            }
          },
          admission_number: `ADM2023${index + 1}`,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date()
        });
      })
    );
    console.log('Student profiles created successfully');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase;