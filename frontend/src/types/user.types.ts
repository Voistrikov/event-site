export interface User {
  id: string;
  name: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
