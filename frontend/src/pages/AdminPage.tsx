import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getPendingUsers, approveUser, rejectUser, exportUsersXml } from '../api/adminApi';
import type { User } from '../types/user.types';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);

  const load = () => getPendingUsers().then((res: AxiosResponse<User[]>) => setUsers(res.data));

  useEffect(() => { load(); }, []);

  const handleExportXml = async () => {
    const res = await exportUsersXml();
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <button onClick={handleExportXml}>Export XML</button>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
            <button onClick={() => approveUser(u.id).then(load)}>Approve</button>
            <button onClick={() => rejectUser(u.id).then(load)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
