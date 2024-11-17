import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash('password123', 10);

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: hashedPassword,
    role: 'student'
  },
  // ... other users
]; 