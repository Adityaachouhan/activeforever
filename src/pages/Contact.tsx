import { useState } from 'react';
import { MapPin, Phone, Mail, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', mobile: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-ink-950 py-16">
        <div className="container-max">
          <span className="eyebrow text-amber-400 mb-3"><MessageSquare className="h-4 w-4" /> Get in Touch</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">Contact Us</h1>
          <p className="mt-3 text-lg text-ink-400 max-w-2xl">
            Have a question about our events or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container-max py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {[
              { icon: MapPin, title: 'Address', value: 'Jamshedpur, Jharkhand, India' },
              { icon: Phone, title: 'Phone', value: '+91 98765 43210' },
              { icon: Mail, title: 'Email', value: 'info@activeforever.in' },
              { icon: Clock, title: 'Office Hours', value: 'Mon–Sat, 9:00 AM – 6:00 PM' },
            ].map((item, i) => (
              <div key={i} className="card p-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm">{item.title}</h3>
                  <p className="text-ink-500 text-sm mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-ink-900 mb-2">Message Sent!</h3>
                  <p className="text-ink-500 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-display font-bold text-ink-900 mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label-field">Full Name *</label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="input-field"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="label-field">Mobile Number</label>
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={e => setForm({ ...form, mobile: e.target.value })}
                          className="input-field"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label-field">Email *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="input-field"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="label-field">Subject</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={e => setForm({ ...form, subject: e.target.value })}
                          className="input-field"
                          placeholder="What's this about?"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-field">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Tell us more..."
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full sm:w-auto">
                      Send Message <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
