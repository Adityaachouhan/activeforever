import { useEffect, useState } from 'react';
import { Search, Users, Shield, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setUsers(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const updateRole = async (id: string, role: string) => {
    await api.from('profiles').update({ role }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-display font-extrabold text-ink-900 mb-2">User Management</h1>
      <p className="text-ink-500 text-sm mb-6">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, mobile, or email..." className="input-field pl-12" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ink-900 text-white">
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4">Name</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4 hidden sm:table-cell">Mobile</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4 hidden md:table-cell">Email</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4 hidden lg:table-cell">City</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold text-sm shrink-0">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-ink-700">{u.name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-ink-600 hidden sm:table-cell">+91 {u.mobile}</td>
                    <td className="py-3 px-4 text-sm text-ink-600 hidden md:table-cell">{u.email}</td>
                    <td className="py-3 px-4 text-sm text-ink-600 hidden lg:table-cell">{u.city || '—'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={e => updateRole(u.id, e.target.value)}
                        className="input-field text-sm py-1.5 w-32"
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
