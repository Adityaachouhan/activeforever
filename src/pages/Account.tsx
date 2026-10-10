import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Download, Ticket, Shield, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Registration } from '@/types';

export default function Account() {
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', dob: '', gender: '', city: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      dob: user.dob || '',
      gender: user.gender || '',
      city: user.city || '',
      address: user.address || '',
    });

    (async () => {
      const { data } = await api
        .from('registrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRegistrations(data as Registration[] || []);
      setLoadingRegs(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    await api
      .from('profiles')
      .update({
        name: profileForm.name,
        email: profileForm.email,
        dob: profileForm.dob || null,
        gender: profileForm.gender || null,
        city: profileForm.city,
        address: profileForm.address,
      })
      .eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  const downloadConfirmation = (reg: Registration) => {
    const content = `
ACTIVE FOREVER — REGISTRATION CONFIRMATION
===========================================

Registration ID: ${reg.registration_id}
BIB Number: ${reg.bib_number || 'TBD'}
Status: ${reg.status.toUpperCase()}
Payment: ${reg.payment_status === 'dev-bypassed' ? 'DEV MODE — Payment bypassed' : reg.payment_status.toUpperCase()}

EVENT: ${reg.event_name}
Category: ${reg.category_name}
Participation: ${reg.participation_type}

PARTICIPANT DETAILS
Name: ${reg.first_name} ${reg.middle_name} ${reg.last_name}
Email: ${reg.email}
Mobile: ${reg.mobile}
Gender: ${reg.gender}
Date of Birth: ${reg.dob}
City: ${reg.city}, ${reg.state}

Amount Paid: Rs. ${reg.amount_paid}

Registered on: ${new Date(reg.created_at).toLocaleString('en-IN')}

This is a computer-generated confirmation.
Active Forever — Jamshedpur, Jharkhand, India
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AF-Confirmation-${reg.registration_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-ink-950 py-12">
        <div className="container-max">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-ink-950 font-display font-extrabold text-2xl">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {user.name || 'Welcome'}
              </h1>
              <p className="text-ink-400 text-sm">+91 {user.mobile}</p>
            </div>
            {(user.role === 'admin' || user.role === 'staff') && (
              <Link to="/admin" className="ml-auto btn-secondary text-sm py-2">
                <Shield className="h-4 w-4" /> Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-max py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-ink-900">Profile</h2>
                {editing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary p-2"><Save className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-ghost p-2"><Edit2 className="h-4 w-4" /></button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div><label className="label-field">Name</label><input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" /></div>
                  <div><label className="label-field">Email</label><input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" /></div>
                  <div><label className="label-field">Date of Birth</label><input type="date" value={profileForm.dob} onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })} className="input-field" /></div>
                  <div><label className="label-field">Gender</label>
                    <select value={profileForm.gender} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })} className="input-field">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className="label-field">City</label><input value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="input-field" /></div>
                  <div><label className="label-field">Address</label><textarea value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="input-field" rows={3} /></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { icon: User, label: 'Name', value: user.name || 'Not set' },
                    { icon: Mail, label: 'Email', value: user.email || 'Not set' },
                    { icon: Phone, label: 'Mobile', value: `+91 ${user.mobile}` },
                    { icon: Calendar, label: 'DOB', value: user.dob || 'Not set' },
                    { icon: MapPin, label: 'City', value: user.city || 'Not set' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-400 shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs text-ink-400 font-medium">{item.label}</div>
                        <div className="text-sm text-ink-700 font-semibold">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => signOut()} className="btn-outline w-full mt-6 text-sm">
                Sign Out
              </button>
            </div>
          </div>

          {/* Registrations */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-display font-bold text-ink-900 mb-4">My Registrations</h2>

            {loadingRegs ? (
              <div className="card h-40 animate-pulse bg-ink-100" />
            ) : registrations.length === 0 ? (
              <div className="card p-12 text-center">
                <Ticket className="h-12 w-12 text-ink-300 mx-auto mb-4" />
                <h3 className="font-display font-bold text-ink-900 mb-2">No Registrations Yet</h3>
                <p className="text-ink-500 text-sm mb-6">Register for an event to see it here.</p>
                <Link to="/events" className="btn-primary">Browse Events</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-display font-bold text-ink-900">{reg.event_name}</h3>
                          <span className={`badge ${
                            reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>{reg.status}</span>
                        </div>
                        <p className="text-sm text-ink-500 mb-3">{reg.category_name} · {reg.participation_type}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-ink-500">
                          <span>Reg ID: <strong className="text-ink-700">{reg.registration_id}</strong></span>
                          <span>BIB: <strong className="text-ink-700">{reg.bib_number || 'TBD'}</strong></span>
                          {reg.payment_status === 'dev-bypassed' && (
                            <span className="text-amber-600 font-semibold">DEV MODE: Payment bypassed</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => downloadConfirmation(reg)}
                        className="btn-outline text-sm py-2 shrink-0"
                      >
                        <Download className="h-4 w-4" /> Confirmation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
