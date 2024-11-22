import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import Student from '../models/Student';
import Class from '../models/Class';
import School from '../models/School';
import Teacher from '../models/Teacher';
import Subject from '../models/Subject';
import Department from '../models/Department';
import Staff from '../models/Staff';
import { Role } from '../models/RolePermission';
import ClassAssignment from '../models/ClassAssignment';
import Test from '../models/Test';
import Attendance from '../models/Attendance';

async function createSampleData() {
  try {
    console.log('Starting to create sample data...');

    // Create school
    console.log('Creating school...');
    const school = await School.create({
      id: uuidv4(),
      name: 'Global International School',
      address: '123 Education Street, Knowledge City',
      contact_number: '+91 98765 43210',
      email: 'info@globalschool.edu',
      domain_name: 'globalschool.edu',
      settings: {
        academicYear: '2023-2024',
        termsPerYear: 2,
        classesPerDay: 8,
        schoolStartTime: '08:00',
        schoolEndTime: '15:30'
      },
      theme_colors: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF'
      },
      features: ['attendance', 'fees', 'library', 'transportation'],
      customization: {
        logo: 'https://example.com/school-logo.png',
        motto: 'Educating for Tomorrow'
      },
      role_config: {
        ADMIN: ['all'],
        TEACHER: ['attendance', 'grades', 'assignments'],
        STUDENT: ['view_grades', 'submit_assignments']
      }
    });
    console.log('School created successfully');

    // Create departments
    console.log('Creating departments...');
    const departments = await Promise.all([
      Department.create({
        id: uuidv4(),
        name: 'Science Department',
        description: 'Handles all science subjects including Physics, Chemistry, and Biology',
        school_id: school.id,
        head_id: null // Will update after creating teachers
      }),
      Department.create({
        id: uuidv4(),
        name: 'Mathematics Department',
        description: 'Handles all mathematics related subjects',
        school_id: school.id,
        head_id: null
      }),
      Department.create({
        id: uuidv4(),
        name: 'Languages Department',
        description: 'Handles English and other language subjects',
        school_id: school.id,
        head_id: null
      })
    ]);
    console.log('Departments created successfully');

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@school.com',
      password: hashedPassword,
      role: Role.ADMIN,
      school_id: school.id
    });
    console.log('Admin user created successfully');

    // Create teachers
    console.log('Creating teacher users...');
    const teacherNames = [
      'John Smith',
      'Sarah Johnson',
      'Michael Brown',
      'Emily Davis',
      'David Wilson'
    ];

    const teacherUsers = await Promise.all(
      teacherNames.map(async (name) => {
        const hashedPassword = await bcrypt.hash('teacher123', 10);
        return User.create({
          id: uuidv4(),
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@school.com`,
          password: hashedPassword,
          role: Role.TEACHER,
          school_id: school.id
        });
      })
    );
    console.log('Teacher users created successfully');

    // Create teacher profiles
    console.log('Creating teacher profiles...');
    const teachers = await Promise.all(
      teacherUsers.map((user, index) => {
        const [firstName, lastName] = user.name.split(' ');
        return Teacher.create({
          id: uuidv4(),
          user_id: user.id,
          school_id: school.id,
          department_id: departments[index % departments.length].id,
          first_name: firstName,
          last_name: lastName,
          qualification: 'M.Ed',
          specialization: ['Mathematics', 'Physics', 'Chemistry'][index % 3],
          experience_years: 5 + index,
          joining_date: new Date(2020, 0, 1),
          status: 'ACTIVE'
        });
      })
    );
    console.log('Teacher profiles created successfully');

    // Update department heads
    console.log('Updating department heads...');
    await Promise.all(
      departments.map((dept, index) =>
        dept.update({ head_id: teachers[index].id })
      )
    );
    console.log('Department heads updated successfully');

    // Create classes
    console.log('Creating classes...');
    const classNames = ['10A', '10B', '11A', '11B', '12A', '12B'];
    const classes = await Promise.all(
      classNames.map((className, index) => {
        return Class.create({
          id: uuidv4(),
          name: `Class ${className}`,
          grade: className.slice(0, -1),
          section: className.slice(-1),
          teacher_id: teachers[index % teachers.length].id,
          school_id: school.id,
          academic_year: '2023-2024',
          status: 'ACTIVE',
          capacity: 30,
          current_strength: 0
        });
      })
    );
    console.log('Classes created successfully');

    // Create subjects
    console.log('Creating subjects...');
    const subjectData = [
      { name: 'Physics', department: 'Science' },
      { name: 'Chemistry', department: 'Science' },
      { name: 'Biology', department: 'Science' },
      { name: 'Mathematics', department: 'Mathematics' },
      { name: 'English', department: 'Languages' }
    ];

    const subjects = await Promise.all(
      subjectData.map(async (subject) => {
        const dept = departments.find(d => d.name.startsWith(subject.department));
        return Subject.create({
          id: uuidv4(),
          name: subject.name,
          description: `${subject.name} for high school students`,
          department_id: dept!.id,
          school_id: school.id,
          grade_level: ['10', '11', '12']
        });
      })
    );
    console.log('Subjects created successfully');

    // Create students
    console.log('Creating student users...');
    const studentNames = [
      'Alice Johnson',
      'Bob Williams',
      'Charlie Brown',
      'Diana Miller',
      'Edward Davis',
      'Fiona Wilson',
      'George Martin',
      'Hannah Clark',
      'Ian Taylor',
      'Julia White'
    ];

    const studentUsers = await Promise.all(
      studentNames.map(async (name) => {
        const hashedPassword = await bcrypt.hash('student123', 10);
        return User.create({
          id: uuidv4(),
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@school.com`,
          password: hashedPassword,
          role: Role.STUDENT,
          school_id: school.id
        });
      })
    );
    console.log('Student users created successfully');

    // Create student profiles
    console.log('Creating student profiles...');
    const students = await Promise.all(
      studentUsers.map((user, index) => {
        const [firstName, lastName] = user.name.split(' ');
        const classIndex = Math.floor(index / 2); // Distribute students across classes
        return Student.create({
          id: uuidv4(),
          user_id: user.id,
          school_id: school.id,
          first_name: firstName,
          last_name: lastName,
          roll_number: `2023${(index + 1).toString().padStart(3, '0')}`,
          class_name: classes[classIndex % classes.length].name,
          blood_group: ['A+', 'B+', 'O+', 'AB+'][index % 4],
          medical_info: {
            allergies: [],
            medications: []
          },
          parents: {
            father: {
              name: `${firstName}'s Father`,
              phone: `+91 98765 4${index.toString().padStart(4, '0')}`,
              email: `father.${firstName.toLowerCase()}@example.com`
            },
            mother: {
              name: `${firstName}'s Mother`,
              phone: `+91 98765 5${index.toString().padStart(4, '0')}`,
              email: `mother.${firstName.toLowerCase()}@example.com`
            }
          },
          admission_number: `ADM2023${(index + 1).toString().padStart(3, '0')}`,
          status: 'ACTIVE'
        });
      })
    );
    console.log('Student profiles created successfully');

    // Create assignments
    console.log('Creating assignments...');
    const assignments = await Promise.all(
      classes.map((cls, index) => {
        return ClassAssignment.create({
          id: uuidv4(),
          title: `Assignment ${index + 1}`,
          description: 'Complete the exercises from chapter 1',
          class_id: cls.id,
          subject_id: subjects[index % subjects.length].id,
          teacher_id: teachers[index % teachers.length].id,
          due_date: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // Due in 7 days
          max_score: 100,
          status: 'ACTIVE'
        });
      })
    );
    console.log('Assignments created successfully');

    // Create tests
    console.log('Creating tests...');
    const tests = await Promise.all(
      classes.map((cls, index) => {
        return Test.create({
          id: uuidv4(),
          title: `Unit Test ${index + 1}`,
          description: 'First unit test of the semester',
          class_id: cls.id,
          subject_id: subjects[index % subjects.length].id,
          teacher_id: teachers[index % teachers.length].id,
          date: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)), // Scheduled in 14 days
          duration: 60, // 60 minutes
          max_score: 50,
          status: 'SCHEDULED'
        });
      })
    );
    console.log('Tests created successfully');

    // Create attendance records
    console.log('Creating attendance records...');
    const today = new Date();
    await Promise.all(
      students.map((student) => {
        return Attendance.create({
          id: uuidv4(),
          student_id: student.id,
          class_id: classes[0].id, // Using first class for example
          date: today,
          status: ['PRESENT', 'ABSENT', 'LATE'][Math.floor(Math.random() * 3)],
          remarks: '',
          marked_by: teachers[0].id
        });
      })
    );
    console.log('Attendance records created successfully');

    console.log('Sample data creation completed successfully!');
    return {
      school,
      admin,
      teachers,
      students,
      classes,
      subjects,
      assignments,
      tests
    };
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

export default createSampleData;
