import School, { initSchoolAssociations } from './School';
import SchoolBranch, { initSchoolBranchAssociations } from './SchoolBranch';
import Student, { initStudentAssociations } from './Student';
import Class, { initClassAssociations } from './Class';
import Teacher, { initTeacherAssociations } from './Teacher';
import Attendance, { initAttendanceAssociations } from './Attendance';
import Address from './Address';
import RolePermission from './RolePermission';
import SubscriptionPlan from './SubscriptionPlan';

// Initialize all model associations
export const initializeAssociations = () => {
  // Initialize in order of dependency
  initSchoolAssociations();
  initSchoolBranchAssociations();
  initStudentAssociations();
  initTeacherAssociations();
  initClassAssociations();
  initAttendanceAssociations();
};

export {
  School,
  SchoolBranch,
  Student,
  Class,
  Teacher,
  Attendance,
  Address,
  RolePermission,
  SubscriptionPlan,
};
