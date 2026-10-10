import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, User, MapPin, Flag, FileText, ClipboardCheck,
  AlertCircle, CheckCircle, Loader2, Info, ShoppingCart,
} from 'lucide-react';
import { useEvent } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { EventCategory } from '@/types';

const STEPS = [
  { num: 1, label: 'Reg Code', icon: FileText },
  { num: 2, label: 'Personal Info', icon: User },
  { num: 3, label: 'Participation', icon: Flag },
  { num: 4, label: 'Additional Details', icon: ClipboardCheck },
  { num: 5, label: 'Summary & Pay', icon: ShoppingCart },
];

interface FormData {
  hasRegCode: 'yes' | 'no' | null;
  regCode: string;
  hasIIAMembership: 'yes' | 'no' | null;
  iiaMembershipNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  nationality: string;
  occupation: string;
  runningClubMember: 'yes' | 'no';
  medicalProfessional: 'yes' | 'no';
  onGround: 'yes' | 'no';
  onGroundCategory: string;
  virtual: 'yes' | 'no';
  virtualCategory: string;
  disabilityType: string;
  emergency1Name: string;
  emergency1Mobile: string;
  emergency1Relation: string;
  emergency2Name: string;
  emergency2Mobile: string;
  emergency2Relation: string;
  hearAbout: string;
  transportMode: string;
  consentMedical: boolean;
  consentWaiver: boolean;
  consentTrueInfo: boolean;
  consentEmergencyCare: boolean;
  consentWhatsapp: boolean;
}

const INITIAL_FORM: FormData = {
  hasRegCode: null, regCode: '', hasIIAMembership: null, iiaMembershipNumber: '',
  firstName: '', middleName: '', lastName: '', email: '', mobile: '',
  gender: '', dob: '', country: 'India', state: '', city: '', pincode: '', address: '',
  nationality: 'Indian', occupation: '', runningClubMember: 'no', medicalProfessional: 'no',
  onGround: 'no', onGroundCategory: '', virtual: 'no', virtualCategory: '',
  disabilityType: '',
  emergency1Name: '', emergency1Mobile: '', emergency1Relation: '',
  emergency2Name: '', emergency2Mobile: '', emergency2Relation: '',
  hearAbout: '', transportMode: '',
  consentMedical: false, consentWaiver: false, consentTrueInfo: false,
  consentEmergencyCare: false, consentWhatsapp: false,
};

export default function Register() {
  const { eventSlug } = useParams();
  const { event, loading } = useEvent(eventSlug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ regId: string; bib: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        mobile: user.mobile || '',
        city: user.city || '',
        dob: user.dob || '',
        gender: user.gender || '',
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event) return <Navigate to="/events" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (success) return <SuccessScreen regId={success.regId} bib={success.bib} eventName={event.name} />;

  const categories = event.categories || [];
  const isIIAEvent = event.slug === 'latitude-run-for-uia';
  const onGroundCategories = categories.filter(c => c.price_inr > 0 || event.event_type !== 'virtual');
  const virtualCategories = categories.filter(c => c.virtual_price_inr > 0);

  const selectedOnGroundCat = categories.find(c => c.id === form.onGroundCategory);
  const selectedVirtualCat = categories.find(c => c.id === form.virtualCategory);
  const totalAmount = (selectedOnGroundCat?.price_inr || 0) + (selectedVirtualCat?.virtual_price_inr || 0);

  const validateStep = (s: number): boolean => {
    setError('');
    if (s === 1 && isIIAEvent) {
      if (!form.hasIIAMembership) {
        setError('Please select whether you are a member of IIA');
        return false;
      }
      if (form.hasIIAMembership === 'yes' && !form.iiaMembershipNumber.trim()) {
        setError('Please enter your IIA membership number');
        return false;
      }
    }
    if (s === 2) {
      if (!form.firstName || !form.lastName || !form.email || !form.mobile || !form.gender || !form.dob ||
          !form.country || !form.state || !form.city || !form.pincode || !form.address || !form.nationality) {
        setError('Please fill all required fields marked with *');
        return false;
      }
    }
    if (s === 3) {
      if (form.onGround === 'no' && form.virtual === 'no') {
        setError('Please select at least one participation type');
        return false;
      }
      if (form.onGround === 'yes' && !form.onGroundCategory) {
        setError('Please select an on-ground race category');
        return false;
      }
      if (form.virtual === 'yes' && !form.virtualCategory) {
        setError('Please select a virtual race category');
        return false;
      }
    }
    if (s === 4) {
      if (selectedOnGroundCat?.slug === 'champions-disability' && !form.disabilityType) {
        setError('Please specify the type of disability');
        return false;
      }
      if (!form.emergency1Name || !form.emergency1Mobile || !form.emergency1Relation) {
        setError('Please fill the primary emergency contact details');
        return false;
      }
    }
    if (s === 5) {
      if (!form.consentMedical || !form.consentWaiver || !form.consentTrueInfo || !form.consentEmergencyCare) {
        setError('Please accept all mandatory consent checkboxes to proceed');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    setError('');

    try {
      const regId = `AF${Date.now().toString().slice(-8)}`;
      const bib = `B${Math.floor(1000 + Math.random() * 9000)}`;
      const primaryCat = selectedOnGroundCat || selectedVirtualCat!;
      const participationType = selectedOnGroundCat ? 'on-ground' : 'virtual';

      const { error: insertError } = await api.from('registrations').insert({
        registration_id: regId,
        user_id: user.id,
        event_id: event.id,
        event_name: event.name,
        category_id: primaryCat.id,
        category_name: primaryCat.name,
        participation_type: participationType,
        bib_number: bib,
        status: 'confirmed',
        payment_status: 'dev-bypassed',
        amount_paid: totalAmount,
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        email: form.email,
        mobile: form.mobile,
        gender: form.gender,
        dob: form.dob,
        country: form.country,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        address: form.address,
        nationality: form.nationality,
        occupation: form.occupation,
        running_club_member: form.runningClubMember === 'yes',
        medical_professional: form.medicalProfessional === 'yes',
        reg_code: form.regCode,
        iia_member: isIIAEvent ? form.hasIIAMembership === 'yes' : null,
        iia_membership_number: isIIAEvent && form.hasIIAMembership === 'yes'
          ? form.iiaMembershipNumber.trim()
          : '',
        id_proof_type: '',
        id_proof_number: '',
        photo_url: '',
        disability_type: form.disabilityType,
        emergency_contact_1_name: form.emergency1Name,
        emergency_contact_1_mobile: form.emergency1Mobile,
        emergency_contact_1_relation: form.emergency1Relation,
        emergency_contact_2_name: form.emergency2Name,
        emergency_contact_2_mobile: form.emergency2Mobile,
        emergency_contact_2_relation: form.emergency2Relation,
        hear_about: form.hearAbout,
        transport_mode: form.transportMode,
        consent_medical: form.consentMedical,
        consent_waiver: form.consentWaiver,
        consent_true_info: form.consentTrueInfo,
        consent_emergency_care: form.consentEmergencyCare,
        consent_whatsapp: form.consentWhatsapp,
      });

      if (insertError) throw insertError;
      setSuccess({ regId, bib });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-ink-950 py-8">
        <div className="container-max">
          <Link to={`/events/${event.slug}`} className="text-sm text-ink-400 hover:text-amber-400 mb-2 inline-block">
            ← {event.name}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Event Registration</h1>
        </div>
      </div>

      <div className="container-max py-10 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1 min-w-[80px]">
                <div className="flex flex-col items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 transition-all ${
                    step > s.num ? 'bg-green-500 text-white' :
                    step === s.num ? 'bg-amber-500 text-white scale-110' :
                    'bg-ink-100 text-ink-400'
                  }`}>
                    {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs font-medium text-center ${step >= s.num ? 'text-ink-700' : 'text-ink-400'}`}>
                    {s.num === 1 && isIIAEvent ? 'IIA Member' : s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.num ? 'bg-green-500' : 'bg-ink-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 mb-6 animate-slide-down">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="card p-6 sm:p-8">
          {/* Step 1: Registration Code or IIA Membership */}
          {step === 1 && (
            <div>
              {isIIAEvent ? (
                <>
                  <h2 className="text-xl font-display font-bold text-ink-900 mb-2">IIA Membership</h2>
                  <p className="text-sm text-ink-500 mb-6">Are you a member of IIA?</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(['yes', 'no'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setForm(f => ({ ...f, hasIIAMembership: opt }))}
                        className={`p-6 rounded-2xl border-2 text-center transition-all ${
                          form.hasIIAMembership === opt
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-ink-100 hover:border-ink-200 text-ink-600'
                        }`}
                      >
                        <span className="font-display font-bold text-lg">{opt === 'yes' ? 'Yes' : 'No'}</span>
                      </button>
                    ))}
                  </div>
                  {form.hasIIAMembership === 'yes' && (
                    <div className="animate-slide-down">
                      <label className="label-field" htmlFor="iia-membership-number">Enter your IIA Membership No.</label>
                      <input
                        id="iia-membership-number"
                        type="text"
                        value={form.iiaMembershipNumber}
                        onChange={e => setForm(f => ({ ...f, iiaMembershipNumber: e.target.value }))}
                        className="input-field"
                        required
                        placeholder="IIA Membership No."
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-display font-bold text-ink-900 mb-2">Registration Code</h2>
                  <p className="text-sm text-ink-500 mb-6">Do you have a company, group, or individual registration code?</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(['yes', 'no'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setForm(f => ({ ...f, hasRegCode: opt }))}
                        className={`p-6 rounded-2xl border-2 text-center transition-all ${
                          form.hasRegCode === opt
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-ink-100 hover:border-ink-200 text-ink-600'
                        }`}
                      >
                        <span className="font-display font-bold text-lg">{opt === 'yes' ? 'Yes' : 'No'}</span>
                      </button>
                    ))}
                  </div>
                  {form.hasRegCode === 'yes' && (
                    <div className="animate-slide-down">
                      <label className="label-field">Enter Registration Code</label>
                      <input
                        type="text"
                        value={form.regCode}
                        onChange={e => setForm(f => ({ ...f, regCode: e.target.value }))}
                        className="input-field"
                        placeholder="e.g. AF-CORP-2026"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label-field">First Name *</label><input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Middle Name</label><input value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Last Name *</label><input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Mobile No *</label><input type="tel" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} className="input-field" /></div>
                <div>
                  <label className="label-field">Gender *</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><label className="label-field">Date of Birth *</label><input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Country *</label><input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">State *</label><input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">City *</label><input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Pincode *</label><input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Nationality *</label><input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} className="input-field" /></div>
                <div className="sm:col-span-2"><label className="label-field">Full Address *</label><textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" rows={2} /></div>
                <div>
                  <label className="label-field">Occupation</label>
                  <select value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} className="input-field">
                    <option value="">Select</option>
                    <option>Student</option><option>Employed</option><option>Self-Employed</option>
                    <option>Business Owner</option><option>Retired</option><option>Homemaker</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Member of a running club?</label>
                  <select value={form.runningClubMember} onChange={e => setForm(f => ({ ...f, runningClubMember: e.target.value as 'yes'|'no' }))} className="input-field">
                    <option value="no">No</option><option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Qualified medical professional?</label>
                  <select value={form.medicalProfessional} onChange={e => setForm(f => ({ ...f, medicalProfessional: e.target.value as 'yes'|'no' }))} className="input-field">
                    <option value="no">No</option><option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Participation */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900 mb-6">Event Participation Type</h2>

              {/* On-Ground */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, onGround: f.onGround === 'yes' ? 'no' : 'yes' }))}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                      form.onGround === 'yes' ? 'bg-amber-500 border-amber-500 text-white' : 'border-ink-200'
                    }`}
                  >
                    {form.onGround === 'yes' && <Check className="h-4 w-4" />}
                  </button>
                  <label className="font-semibold text-ink-800">Do you want to participate in the on-ground event?</label>
                </div>
                {form.onGround === 'yes' && (
                  <div className="pl-9 animate-slide-down">
                    <label className="label-field">Race Category</label>
                    <select value={form.onGroundCategory} onChange={e => setForm(f => ({ ...f, onGroundCategory: e.target.value }))} className="input-field">
                      <option value="">Select a category</option>
                      {onGroundCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.distance_km} km) — Rs. {c.price_inr}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Virtual */}
              {virtualCategories.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => setForm(f => ({ ...f, virtual: f.virtual === 'yes' ? 'no' : 'yes' }))}
                      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                        form.virtual === 'yes' ? 'bg-amber-500 border-amber-500 text-white' : 'border-ink-200'
                      }`}
                    >
                      {form.virtual === 'yes' && <Check className="h-4 w-4" />}
                    </button>
                    <label className="font-semibold text-ink-800">Do you want to participate virtually?</label>
                  </div>
                  {form.virtual === 'yes' && (
                    <div className="pl-9 animate-slide-down">
                      <label className="label-field">Virtual Race Category</label>
                      <select value={form.virtualCategory} onChange={e => setForm(f => ({ ...f, virtualCategory: e.target.value }))} className="input-field">
                        <option value="">Select a virtual category</option>
                        {virtualCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.distance_km} km) — Rs. {c.virtual_price_inr}</option>
                        ))}
                      </select>
                      <div className="mt-4 flex items-start gap-3 rounded-xl bg-teal-50 border border-teal-200 p-4">
                        <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-teal-800">
                          Virtual participation: Run from anywhere within the event time window. Track your run with our app or any GPS tracking app and submit your time. Finisher medal and e-certificate provided.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Cart Total */}
              <div className="sticky bottom-0 bg-ink-50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 mt-8 border-t border-ink-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-ink-700">Cart Total</span>
                  </div>
                  <span className="text-2xl font-display font-extrabold text-ink-900">Rs. {totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900 mb-6">Additional Details</h2>
              <div className="space-y-5">
                {/* Disability */}
                {selectedOnGroundCat?.slug === 'champions-disability' && (
                  <div className="animate-slide-down">
                    <label className="label-field">Type of Disability *</label>
                    <input value={form.disabilityType} onChange={e => setForm(f => ({ ...f, disabilityType: e.target.value }))} className="input-field" placeholder="e.g. Visual, Mobility, etc." />
                  </div>
                )}

                {/* Emergency Contacts */}
                <div>
                  <h3 className="font-semibold text-ink-800 mb-3">Emergency Contact 1 (Required)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="label-field">Name *</label><input value={form.emergency1Name} onChange={e => setForm(f => ({ ...f, emergency1Name: e.target.value }))} className="input-field" /></div>
                    <div><label className="label-field">Mobile *</label><input type="tel" value={form.emergency1Mobile} onChange={e => setForm(f => ({ ...f, emergency1Mobile: e.target.value }))} className="input-field" /></div>
                    <div><label className="label-field">Relationship *</label>
                      <select value={form.emergency1Relation} onChange={e => setForm(f => ({ ...f, emergency1Relation: e.target.value }))} className="input-field">
                        <option value="">Select</option>
                        <option>Parent</option><option>Spouse</option><option>Sibling</option>
                        <option>Child</option><option>Friend</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-ink-800 mb-3">Emergency Contact 2 (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="label-field">Name</label><input value={form.emergency2Name} onChange={e => setForm(f => ({ ...f, emergency2Name: e.target.value }))} className="input-field" /></div>
                    <div><label className="label-field">Mobile</label><input type="tel" value={form.emergency2Mobile} onChange={e => setForm(f => ({ ...f, emergency2Mobile: e.target.value }))} className="input-field" /></div>
                    <div><label className="label-field">Relationship</label>
                      <select value={form.emergency2Relation} onChange={e => setForm(f => ({ ...f, emergency2Relation: e.target.value }))} className="input-field">
                        <option value="">Select</option>
                        <option>Parent</option><option>Spouse</option><option>Sibling</option>
                        <option>Child</option><option>Friend</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Where did you hear about our event?</label>
                    <select value={form.hearAbout} onChange={e => setForm(f => ({ ...f, hearAbout: e.target.value }))} className="input-field">
                      <option value="">Select</option>
                      <option>Social Media</option><option>Friend/Family</option><option>Newspaper</option>
                      <option>Previous Participant</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Mode of transport to reach venue (optional)</label>
                    <select value={form.transportMode} onChange={e => setForm(f => ({ ...f, transportMode: e.target.value }))} className="input-field">
                      <option value="">Select</option>
                      <option>Personal Vehicle</option><option>Public Transport</option>
                      <option>Cab/Taxi</option><option>Walking</option><option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Summary & Consent */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900 mb-6">Order Summary & Consent</h2>

              {/* Dev mode notice */}
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-bold">DEV MODE:</span> Payment gateway is not yet live. Clicking "Proceed to Pay" will confirm your registration directly without charging any amount.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-ink-100 overflow-hidden mb-6">
                <div className="bg-ink-900 text-white p-4">
                  <h3 className="font-display font-bold">{event.name}</h3>
                </div>
                <div className="divide-y divide-ink-100">
                  {selectedOnGroundCat && (
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <span className="font-semibold text-ink-800">{selectedOnGroundCat.name}</span>
                        <span className="text-xs text-ink-500 ml-2">(On-Ground, {selectedOnGroundCat.distance_km} km)</span>
                      </div>
                      <span className="font-bold text-ink-900">Rs. {selectedOnGroundCat.price_inr}</span>
                    </div>
                  )}
                  {selectedVirtualCat && (
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <span className="font-semibold text-ink-800">{selectedVirtualCat.name}</span>
                        <span className="text-xs text-ink-500 ml-2">(Virtual, {selectedVirtualCat.distance_km} km)</span>
                      </div>
                      <span className="font-bold text-ink-900">Rs. {selectedVirtualCat.virtual_price_inr}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 bg-ink-50">
                    <span className="font-display font-bold text-ink-900 text-lg">Total Amount</span>
                    <span className="font-display font-extrabold text-amber-600 text-xl">Rs. {totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Consents */}
              <div className="space-y-3 mb-6">
                {[
                  { key: 'consentMedical' as const, label: 'I confirm I am medically fit and have read the medical & safety guidelines.' },
                  { key: 'consentWaiver' as const, label: 'I agree to the waiver, entry rules & guidelines, and data processing consent.' },
                  { key: 'consentTrueInfo' as const, label: 'I confirm all information provided is true and correct.' },
                  { key: 'consentEmergencyCare' as const, label: 'I consent to emergency medical care administration if needed.' },
                  { key: 'consentWhatsapp' as const, label: '(Optional) I agree to receive event updates via WhatsApp.', optional: true },
                ].map((c) => (
                  <label key={c.key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-ink-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={form[c.key]}
                      onChange={e => setForm(f => ({ ...f, [c.key]: e.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-ink-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-sm text-ink-700">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink-100">
            {step > 1 ? (
              <button onClick={prevStep} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button onClick={nextStep} className="btn-primary">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <>Proceed to Pay <ArrowRight className="h-4 w-4" /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ regId, bib, eventName }: { regId: string; bib: string; eventName: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="card p-8 sm:p-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink-900 mb-2">
            Registration Confirmed!
          </h1>
          <p className="text-ink-500 mb-6">You have successfully registered for {eventName}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-ink-50 p-4">
              <div className="text-xs text-ink-400 font-semibold uppercase">Registration ID</div>
              <div className="font-display font-bold text-ink-900 mt-1">{regId}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="text-xs text-amber-600 font-semibold uppercase">BIB Number</div>
              <div className="font-display font-bold text-amber-700 mt-1">{bib}</div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-6 text-left">
            <p className="text-xs text-amber-800">
              <span className="font-bold">DEV MODE:</span> Payment was bypassed. Confirmation has been generated. Email/SMS/WhatsApp notifications will be sent once the payment gateway is live.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/account')} className="btn-primary flex-1">
              View My Registrations
            </button>
            <button onClick={() => navigate('/events')} className="btn-outline flex-1">
              Browse More Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
