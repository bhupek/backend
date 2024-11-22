import Class from './Class';
import School from './School';
import Teacher from './Teacher';
import Student from './Student';
import Subject from './Subject';
import User from './User';

export const initAssociations = () => {
  // Initialize each model's associations first
  if (typeof Class.initClassAssociations === 'function') {
    Class.initClassAssociations();
  }
  if (typeof School.initSchoolAssociations === 'function') {
    School.initSchoolAssociations();
  }
  if (typeof Teacher.initTeacherAssociations === 'function') {
    Teacher.initTeacherAssociations();
  }
  if (typeof Student.initStudentAssociations === 'function') {
    Student.initStudentAssociations();
  }

  // Then set up cross-model associations
  Class.belongsTo(School, {
    foreignKey: 'school_id',
    as: 'school'
  });

  Class.belongsTo(Teacher, {
    foreignKey: 'class_teacher_id',
    as: 'classTeacher'
  });

  Class.belongsToMany(Student, {
    through: 'class_students',
    foreignKey: 'class_id',
    otherKey: 'student_id',
    as: 'students'
  });

  Class.belongsToMany(Subject, {
    through: 'class_subjects',
    foreignKey: 'class_id',
    otherKey: 'subject_id',
    as: 'subjects'
  });

  // School associations
  School.hasMany(Class, {
    foreignKey: 'school_id',
    as: 'classes'
  });

  // Teacher associations
  Teacher.hasMany(Class, {
    foreignKey: 'class_teacher_id',
    as: 'classes'
  });

  Teacher.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  User.hasOne(Teacher, {
    foreignKey: 'user_id',
    as: 'teacher'
  });

  // Student associations
  Student.belongsToMany(Class, {
    through: 'class_students',
    foreignKey: 'student_id',
    otherKey: 'class_id',
    as: 'classes'
  });

  // Subject associations
  Subject.belongsToMany(Class, {
    through: 'class_subjects',
    foreignKey: 'subject_id',
    otherKey: 'class_id',
    as: 'classes'
  });
};
