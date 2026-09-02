import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Loader2, X, Check } from 'lucide-react';
import client from '../api/client';

import { useAuth } from '../AuthContext';

interface RolePermission {
  resource_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
}

const RESOURCES = [
  { id: 'Dashboard', label: 'Dashboard' },
  { id: 'Students', label: 'Students' },
  { id: 'Teachers', label: 'Teachers' },
  { id: 'Timetable', label: 'Timetable' },
  { id: 'Grades', label: 'Grades' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Reports', label: 'Reports' },
  { id: 'Academics', label: 'Academics' },
  { id: 'Users', label: 'Users' },
  { id: 'Roles', label: 'Roles' },
  { id: 'Attendance', label: 'Attendance' },
];

const RolesManagementView: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('Roles', 'can_create');
  const canUpdate = hasPermission('Roles', 'can_update');
  const canDelete = hasPermission('Roles', 'can_delete');

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<Record<string, RolePermission>>({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await client.get('/roles');
      if (response.data?.status === 'success') {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    } finally {
      setLoading(false);
    }
  };

  const initPermissions = (existingPermissions?: RolePermission[]) => {
    const perms: Record<string, RolePermission> = {};
    RESOURCES.forEach(res => {
      const existing = existingPermissions?.find(p => p.resource_name === res.id);
      perms[res.id] = existing ? { ...existing } : {
        resource_name: res.id,
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
      };
    });
    setFormPermissions(perms);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName('');
    setFormDescription('');
    initPermissions();
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDescription(role.description || '');
    initPermissions(role.permissions);
    setIsModalOpen(true);
  };

  const handlePermissionChange = (resource: string, action: keyof RolePermission, value: boolean) => {
    setFormPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const permissionsList = Object.values(formPermissions);
      const payload = {
        name: formName,
        description: formDescription,
        permissions: permissionsList
      };

      if (editingRole) {
        await client.put(`/roles/${editingRole.id}`, payload);
      } else {
        await client.post('/roles', payload);
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      console.error("Failed to save role", err);
      alert(err.response?.data?.detail || "Failed to save role");
    }
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (roleName === 'Admin') {
      alert("Cannot delete the primary Admin role");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await client.delete(`/roles/${roleId}`);
      fetchRoles();
    } catch (err: any) {
      console.error("Failed to delete role", err);
      alert(err.response?.data?.detail || "Failed to delete role");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Roles Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Create custom roles and manage access permissions for each module.</p>
        </div>
        {canCreate && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-5 h-5" />
            Add New Role
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{role.name}</h3>
                  <div className="flex items-center gap-1">
                    {canUpdate && (
                      <button onClick={() => openEditModal(role)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && role.name !== 'Admin' && (
                      <button onClick={() => handleDeleteRole(role.id, role.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-6 h-10 line-clamp-2">{role.description || 'No description'}</p>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Permissions</h4>
                  {role.permissions.filter(p => p.can_read || p.can_create || p.can_update || p.can_delete).slice(0, 4).map(p => {
                     const resLabel = RESOURCES.find(r => r.id === p.resource_name)?.label || p.resource_name;
                     return (
                       <div key={p.resource_name} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                         <Check className="w-4 h-4 text-green-500" />
                         <span>{resLabel}</span>
                       </div>
                     );
                  })}
                  {role.permissions.filter(p => p.can_read || p.can_create || p.can_update || p.can_delete).length > 4 && (
                    <div className="text-xs text-indigo-600 font-bold mt-2">
                      + {role.permissions.filter(p => p.can_read || p.can_create || p.can_update || p.can_delete).length - 4} more resources
                    </div>
                  )}
                  {role.permissions.filter(p => p.can_read || p.can_create || p.can_update || p.can_delete).length === 0 && (
                    <div className="text-sm text-slate-400">No permissions</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingRole ? 'Edit Role' : 'Add New Role'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Role Name</label>
                    <input required type="text" value={formName} disabled={editingRole?.name === 'Admin'} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                    <input type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">Access Permissions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-sm text-slate-600">
                          <th className="p-3 border-b">Resource</th>
                          <th className="p-3 border-b text-center">Read</th>
                          <th className="p-3 border-b text-center">Create</th>
                          <th className="p-3 border-b text-center">Update</th>
                          <th className="p-3 border-b text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RESOURCES.map(res => {
                          const p = formPermissions[res.id];
                          if (!p) return null;
                          return (
                            <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-700">{res.label}</td>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={p.can_read} onChange={e => handlePermissionChange(res.id, 'can_read', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
                              </td>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={p.can_create} onChange={e => handlePermissionChange(res.id, 'can_create', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
                              </td>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={p.can_update} onChange={e => handlePermissionChange(res.id, 'can_update', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
                              </td>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={p.can_delete} onChange={e => handlePermissionChange(res.id, 'can_delete', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-200">{editingRole ? 'Save Changes' : 'Add Role'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManagementView;
