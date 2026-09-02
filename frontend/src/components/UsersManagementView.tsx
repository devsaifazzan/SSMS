import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, CheckCircle2, XCircle, Search, Loader2, X } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../AuthContext';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleId, setFormRoleId] = useState<number | ''>('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get('/users');
      if (response.data?.status === 'success') {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await client.get('/roles');
      if (response.data?.status === 'success') {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormRoleId(roles.length > 0 ? roles[0].id : '');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPassword('');
    const userRole = roles.find(r => r.name === user.role);
    setFormRoleId(userRole ? userRole.id : '');
    setFormIsActive(user.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRoleId === '') {
      alert("Please select a role");
      return;
    }
    
    try {
      if (editingUser) {
        // Edit mode
        const payload: any = {
          username: formUsername,
          email: formEmail,
          role_id: Number(formRoleId),
          is_active: formIsActive
        };
        if (formPassword) {
          payload.password = formPassword;
        }
        await client.put(`/users/${editingUser.id}`, payload);
      } else {
        // Create mode
        if (!formPassword) {
          alert("Password is required for new users");
          return;
        }
        await client.post('/users', {
          username: formUsername,
          email: formEmail,
          password: formPassword,
          role_id: Number(formRoleId),
          is_active: formIsActive
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to save user", err);
      alert("Failed to save user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await client.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user. Cannot delete yourself if you are an admin.");
    }
  };

  const { hasPermission } = useAuth();
  const canCreate = hasPermission('Users', 'can_create');
  const canUpdate = hasPermission('Users', 'can_update');
  const canDelete = hasPermission('Users', 'can_delete');

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-arabic">إدارة المستخدمين</h2>
          <p className="text-sm text-slate-500 font-arabic">إضافة، تعديل، أو إزالة حسابات النظام وتحديد الأدوار.</p>
        </div>
        {canCreate && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 font-arabic">
            <UserPlus className="w-5 h-5" />
            مستخدم جديد
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="card p-0 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن مستخدم..." 
              className="pr-9 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all font-arabic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                  <th className="px-6 py-4 font-arabic">المستخدم</th>
                  <th className="px-6 py-4 font-arabic">الدور (Role)</th>
                  <th className="px-6 py-4 font-arabic">تاريخ الإنشاء</th>
                  <th className="px-6 py-4 font-arabic">الحالة</th>
                  <th className="px-6 py-4 font-arabic text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{user.username}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-arabic
                        ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <div className="flex items-center gap-1 text-green-600 font-arabic text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> نشط
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 font-arabic text-xs font-bold">
                          <XCircle className="w-4 h-4" /> معطل
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button onClick={() => openEditModal(user)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="تعديل">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-arabic">
                      لا يوجد مستخدمين مطابقين للبحث.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-slate-800 font-arabic">{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-arabic text-right">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">اسم المستخدم</label>
                <input required type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  كلمة المرور
                  {editingUser && <span className="text-xs text-slate-400 font-normal mr-2">(اتركها فارغة للاحتفاظ بكلمة المرور الحالية)</span>}
                </label>
                <input required={!editingUser} type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الدور (Role)</label>
                <select value={formRoleId} onChange={e => setFormRoleId(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                  <option value="" disabled>اختر الدور</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              {editingUser && (
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="isActive" checked={formIsActive} onChange={e => setFormIsActive(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">الحساب نشط</label>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="submit" className="btn-primary w-full">{editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg w-full transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementView;
