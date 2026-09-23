export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'slaughter_incharge' | 'user';
  avatar?: string;
}
