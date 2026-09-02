import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Key, Loader2 } from 'lucide-react';
import client from '../api/client';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({ firstName: 'Admin', lastName: 'User', email: '' });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await client.get('/auth/me');
        if (response.data && response.data.status === 'success') {
          // Keep existing profile names if no username available, or adapt
          setProfile(prev => ({
            ...prev,
            email: response.data.data.email,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await client.put('/auth/me', { 
        email: profile.email,
        first_name: profile.firstName,
        last_name: profile.lastName
      });
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await client.put('/auth/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: <User className="w-4 h-4 mr-2" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4 mr-2" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4 mr-2" /> },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-500" />
          Settings
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        <div className="flex-1 card p-6">
          {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Profile Information</h3>
                <p className="text-sm text-slate-500">Update your account's profile information and email address.</p>
              </div>
              <hr className="border-slate-100" />
              <form className="space-y-4 max-w-xl" onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      value={profile.firstName}
                      onChange={e => setProfile({...profile, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      value={profile.lastName}
                      onChange={e => setProfile({...profile, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={saving} className="btn-primary flex items-center">
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Notification Preferences</h3>
                <p className="text-sm text-slate-500">Decide which communications you'd like to receive.</p>
              </div>
              <hr className="border-slate-100" />
              <div className="space-y-4 max-w-xl">
                {['Email alerts for low attendance', 'SMS notifications for emergencies', 'Weekly digest of student performance', 'AI Intervention recommendations'].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id={`notif-${i}`} type="checkbox" defaultChecked={i % 2 === 0} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`notif-${i}`} className="font-medium text-slate-700">{item}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Security & Password</h3>
                <p className="text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <hr className="border-slate-100" />
              <form className="space-y-4 max-w-xl" onSubmit={handleUpdatePassword}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="submit" disabled={saving} className="btn-primary flex items-center">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
