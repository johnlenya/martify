'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

const TOPICS = [
  'An order',
  'Payments',
  'Delivery',
  'Returns or refunds',
  'My account',
  'Selling on Martify',
  'Something else',
];

export default function ContactForm({ supportEmail }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    orderNumber: '',
    topic: 'An order',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email.';
    if (form.message.trim().length < 15) next.message = 'Add a little more detail (15+ characters).';
    setErrors(next);
    if (Object.keys(next).length) return;

    const subject = `[Martify support] ${form.topic}${form.orderNumber ? ` — ${form.orderNumber}` : ''}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.orderNumber ? `Order: ${form.orderNumber}` : '',
      '',
      form.message,
    ]
      .filter(Boolean)
      .join('\n');
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.info(
      'Your email app should open with the message ready. This demo does not send it to a server.',
    );
  };

  return (
    <form onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
      <label className="field">
        <span className="label">Your name</span>
        <input
          className="input"
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          autoComplete="name"
          placeholder="Amina Hassan"
        />
        {errors.name ? <span className="text-[10px] text-[#a3301d]">{errors.name}</span> : null}
      </label>
      <label className="field">
        <span className="label">Email address</span>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
        {errors.email ? <span className="text-[10px] text-[#a3301d]">{errors.email}</span> : null}
      </label>
      <label className="field">
        <span className="label">Topic</span>
        <select
          className="select"
          value={form.topic}
          onChange={(event) => update('topic', event.target.value)}
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">Order number (optional)</span>
        <input
          className="input font-mono text-[11px]"
          value={form.orderNumber}
          onChange={(event) => update('orderNumber', event.target.value.toUpperCase())}
          placeholder="MFT-XXXXXX"
          maxLength={20}
        />
      </label>
      <label className="field sm:col-span-2">
        <span className="label">What can we help with?</span>
        <textarea
          className="textarea min-h-[120px]"
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          maxLength={1000}
          placeholder="Tell us what happened, and what would make it right."
        />
        <span className="flex justify-between text-[9px] text-muted">
          <span>{errors.message || 'Do not include passwords or card details.'}</span>
          <span>{form.message.length}/1000</span>
        </span>
      </label>
      <div className="sm:col-span-2 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-[9px] leading-relaxed text-muted">
          This form opens your email app. Messages are not stored or sent by this
          demo build.
        </p>
        <button type="submit" className="btn btn-primary">
          <Send className="h-3.5 w-3.5" />
          Compose message
        </button>
      </div>
    </form>
  );
}
