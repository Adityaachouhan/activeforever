import { useEffect, useState, useCallback } from 'react';
import { Search, Download, Filter, Eye, X, Check, Clock, Ban } from 'lucide-react';
import { api } from '@/lib/api';
import type { Registration } from '@/types';

export default function AdminRegistrations() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [viewReg, setViewReg] = useState<Registration | null>(null);

  const load = useCallback(async () => {
    let query = api.from('registrations').select('*').order('created_at', { ascending: false });
    if (eventFilter !== 'all') query = query.eq('event_id', eventFilter);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    const { data } = await query;
    let filtered = data as Registration[] || [];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.first_name.toLowerCase().includes(s) ||
        r.last_name.toLowerCase().includes(s) ||
        r.mobile.includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.registration_id.toLowerCase().includes(s)
      );
    }

    setRegs(filtered);
    setLoading(false);
  }, [eventFilter, statusFilter, search]);

  useEffect(() => {
    api.from('events').select('id, name').order('name').then(({ data }) => setEvents(data || []));
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (reg: Registration, status: 'confirmed' | 'pending' | 'cancelled') => {
    await api.from('registrations').update({ status }).eq('id', reg.id);
    load();
    if (viewReg?.id === reg.id) setViewReg({ ...viewReg, status });
  };

  const exportCSV = () => {
    const headers = ['Reg ID', 'BIB', 'Name', 'Email', 'Mobile', 'Event', 'Category', 'Type', 'Status', 'Amount', 'IIA Member', 'IIA Membership No.', 'Date'];
    const rows = regs.map(r => [
      r.registration_id, r.bib_number || '', `${r.first_name} ${r.last_name}`, r.email, r.mobile,
      r.event_name, r.category_name, r.participation_type, r.status, r.amount_paid,
      r.iia_member === null ? '' : r.iia_member ? 'Yes' : 'No', r.iia_membership_number,
      new Date(r.created_at).toLocaleString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    // Generate an HTML table that Excel can open
    const headers = ['Reg ID', 'BIB', 'First Name', 'Last Name', 'Email', 'Mobile', 'Event', 'Category', 'Type', 'Status', 'Amount', 'Gender', 'DOB', 'City', 'State', 'Pincode', 'Address', 'ID Proof', 'ID Number', 'IIA Member', 'IIA Membership No.', 'Emergency Contact 1', 'Emergency Mobile 1', 'Emergency Relation 1', 'Date'];
    const rows = regs.map(r => [
      r.registration_id, r.bib_number || '', r.first_name, r.last_name, r.email, r.mobile,
      r.event_name, r.category_name, r.participation_type, r.status, r.amount_paid,
      r.gender, r.dob, r.city, r.state, r.pincode, r.address, r.id_proof_type, r.id_proof_number,
      r.iia_member === null ? '' : r.iia_member ? 'Yes' : 'No', r.iia_membership_number,
      r.emergency_contact_1_name, r.emergency_contact_1_mobile, r.emergency_contact_1_relation,
      new Date(r.created_at).toLocaleString('en-IN'),
    ]);
    const html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">Registrations</h1>
          <p className="text-ink-500 text-sm mt-1">{regs.length} registration{regs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline text-sm py-2.5"><Download className="h-4 w-4" /> CSV</button>
          <button onClick={exportExcel} className="btn-secondary text-sm py-2.5"><Download className="h-4 w-4" /> Excel</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, mobile, email, or reg ID..." className="input-field pl-12" />
          </div>
          <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="input-field sm:w-48">
            <option value="all">All Events</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-40">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : regs.length === 0 ? (
        <div className="card p-12 text-center">
          <Filter className="h-12 w-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">No registrations found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ink-900 text-white">
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4">Reg ID</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4">Name</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4 hidden md:table-cell">Event</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4 hidden lg:table-cell">Category</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-right text-xs font-bold uppercase tracking-wider py-3 px-4 hidden sm:table-cell">Amount</th>
                  <th className="text-center text-xs font-bold uppercase tracking-wider py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="py-3 px-4 text-sm font-mono text-ink-700">{r.registration_id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-ink-700">{r.first_name} {r.last_name}</td>
                    <td className="py-3 px-4 text-sm text-ink-600 hidden md:table-cell">{r.event_name}</td>
                    <td className="py-3 px-4 text-sm text-ink-600 hidden lg:table-cell">{r.category_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                        {r.payment_status === 'dev-bypassed' && <span className="text-xs text-amber-600" title="Payment bypassed">DEV</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-ink-900 text-right hidden sm:table-cell">Rs. {r.amount_paid}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewReg(r)} className="btn-ghost p-2"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => updateStatus(r, 'confirmed')} className="btn-ghost p-2 text-green-600" title="Confirm"><Check className="h-4 w-4" /></button>
                        <button onClick={() => updateStatus(r, 'pending')} className="btn-ghost p-2 text-amber-600" title="Set Pending"><Clock className="h-4 w-4" /></button>
                        <button onClick={() => updateStatus(r, 'cancelled')} className="btn-ghost p-2 text-red-600" title="Cancel"><Ban className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewReg && (
        <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={() => setViewReg(null)}>
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-ink-900">Registration Details</h2>
              <button onClick={() => setViewReg(null)} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-6">
              {/* IDs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-ink-50 p-4">
                  <div className="text-xs text-ink-400 font-semibold uppercase">Registration ID</div>
                  <div className="font-mono font-bold text-ink-900 mt-1">{viewReg.registration_id}</div>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <div className="text-xs text-amber-600 font-semibold uppercase">BIB Number</div>
                  <div className="font-mono font-bold text-amber-700 mt-1">{viewReg.bib_number || 'TBD'}</div>
                </div>
              </div>

              {/* Photo */}
              {viewReg.photo_url && (
                <div>
                  <h3 className="font-semibold text-ink-800 mb-2">Uploaded Photo</h3>
                  <img src={viewReg.photo_url} alt="Participant" className="h-24 w-24 rounded-xl object-cover border-2 border-ink-100" />
                </div>
              )}

              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-ink-800 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Name', `${viewReg.first_name} ${viewReg.middle_name} ${viewReg.last_name}`],
                    ['Email', viewReg.email],
                    ['Mobile', viewReg.mobile],
                    ['Gender', viewReg.gender],
                    ['DOB', viewReg.dob],
                    ['Nationality', viewReg.nationality],
                    ['Address', `${viewReg.address}, ${viewReg.city}, ${viewReg.state} ${viewReg.pincode}`],
                  ].map(([label, value], i) => (
                    <div key={i}>
                      <div className="text-xs text-ink-400 font-semibold">{label}</div>
                      <div className="text-ink-700 font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="font-semibold text-ink-800 mb-3">Event & Participation</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-xs text-ink-400 font-semibold">Event</div><div className="text-ink-700 font-medium">{viewReg.event_name}</div></div>
                  <div><div className="text-xs text-ink-400 font-semibold">Category</div><div className="text-ink-700 font-medium">{viewReg.category_name}</div></div>
                  <div><div className="text-xs text-ink-400 font-semibold">Participation</div><div className="text-ink-700 font-medium capitalize">{viewReg.participation_type.replace('-', ' ')}</div></div>
                  <div><div className="text-xs text-ink-400 font-semibold">Amount</div><div className="text-ink-700 font-bold">Rs. {viewReg.amount_paid}</div></div>
                </div>
              </div>

              {viewReg.iia_member !== null && (
                <div>
                  <h3 className="font-semibold text-ink-800 mb-3">IIA Membership</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-ink-400 font-semibold">IIA Member</div>
                      <div className="text-ink-700 font-medium">{viewReg.iia_member ? 'Yes' : 'No'}</div>
                    </div>
                    {viewReg.iia_member && (
                      <div>
                        <div className="text-xs text-ink-400 font-semibold">Membership No.</div>
                        <div className="text-ink-700 font-medium">{viewReg.iia_membership_number}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              <div>
                <h3 className="font-semibold text-ink-800 mb-3">Emergency Contacts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                    <span className="font-medium text-ink-700">{viewReg.emergency_contact_1_name}</span>
                    <span className="text-ink-600">{viewReg.emergency_contact_1_mobile} ({viewReg.emergency_contact_1_relation})</span>
                  </div>
                  {viewReg.emergency_contact_2_name && (
                    <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                      <span className="font-medium text-ink-700">{viewReg.emergency_contact_2_name}</span>
                      <span className="text-ink-600">{viewReg.emergency_contact_2_mobile} ({viewReg.emergency_contact_2_relation})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-ink-800 mb-3">Status Management</h3>
                <div className="flex gap-2">
                  <button onClick={() => { updateStatus(viewReg, 'confirmed'); setViewReg({ ...viewReg, status: 'confirmed' }); }} className={`btn text-sm py-2 flex-1 ${viewReg.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}><Check className="h-4 w-4" /> Confirm</button>
                  <button onClick={() => { updateStatus(viewReg, 'pending'); setViewReg({ ...viewReg, status: 'pending' }); }} className={`btn text-sm py-2 flex-1 ${viewReg.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}><Clock className="h-4 w-4" /> Pending</button>
                  <button onClick={() => { updateStatus(viewReg, 'cancelled'); setViewReg({ ...viewReg, status: 'cancelled' }); }} className={`btn text-sm py-2 flex-1 ${viewReg.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}><Ban className="h-4 w-4" /> Cancel</button>
                </div>
                {viewReg.payment_status === 'dev-bypassed' && (
                  <p className="text-xs text-amber-600 font-semibold mt-3">DEV MODE: Payment gateway not yet live. This registration was auto-confirmed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
