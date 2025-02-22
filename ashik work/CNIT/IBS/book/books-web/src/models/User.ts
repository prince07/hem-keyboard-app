export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export const defaultAdmin: User = {
  id: '1',
  username: 'admin',
  password: 'admin', // In production, this should be hashed
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
};
