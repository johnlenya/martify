'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';
import { COUNTIES } from '@/lib/commerce';

const EMPTY_FORM = {
  label: 'Home',
  recipient: '',
  phone: '',
  county: 'Nairobi',
  town: '',
  addressLine: '',
  instructions: '',
  isDefault: false,
};

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="label">{label}</span>
      {children}
      {error ? <span className="text-[10px] text-[#a3301d]">{error}</span> : null}
    </label>
  );
}

export default function AddressBook({ addresses = [], userName = '' }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      recipient: userName,
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (address) => {
    setEditing(address);
    setForm({
      label: address.label || 'Home',
      recipient: address.recipient || '',
      phone: address.phone || '',
      county: address.county || 'Nairobi',
      town: address.town || '',
      addressLine: address.address_line || '',
      instructions: address.instructions || '',
      isDefault: Boolean(address.is_default),
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.recipient.trim()) next.recipient = 'Enter the recipient name.';
    if (!/^(\+?254|0)?[17]\d{8}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      next.phone = 'Enter a valid Kenyan phone number.';
    }
    if (!form.county) next.county = 'Choose a county.';
    if (!form.town.trim()) next.town = 'Enter your town or estate.';
    if (form.addressLine.trim().length < 4) {
      next.addressLine = 'Add a street, building or house detail.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const response = await fetch(
        editing
          ? `/api/account/addresses/${editing.id}`
          : '/api/account/addresses',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save this address.');
      setOpen(false);
      toast.success(editing ? 'Address updated.' : 'Address saved.');
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (address) => {
    setBusyId(address.id);
    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: address.label || 'Home',
          recipient: address.recipient,
          phone: address.phone,
          county: address.county,
          town: address.town,
          addressLine: address.address_line,
          instructions: address.instructions || '',
          isDefault: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not update this address.');
      toast.success('Default delivery address updated.');
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/account/addresses/${deleting.id}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not remove this address.');
      setDeleting(null);
      toast.success('Address removed.');
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] text-muted">
          {addresses.length} of 20 saved
        </p>
        <button type="button" onClick={openNew} className="btn btn-primary btn-sm">
          <Plus className="h-3.5 w-3.5" />
          Add address
        </button>
      </div>

      {addresses.length ? (
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className={`relative flex flex-col rounded-[1.2rem] border bg-[#fffdfa] p-4 ${
                address.is_default ? 'border-brand/45' : 'border-line/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${
                      address.is_default ? 'bg-brand-soft text-brand-dark' : 'bg-sand text-ink-soft'
                    }`}
                  >
                    {address.label?.toLowerCase().includes('office') ? (
                      <MapPin className="h-3.5 w-3.5" />
                    ) : (
                      <Home className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[11.5px] font-bold text-ink">
                        {address.label || 'Address'}
                      </p>
                      {address.is_default ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-soft px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] text-brand-dark">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[9.5px] text-muted">{address.recipient}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex-1 text-[10.5px] leading-relaxed text-ink-soft">
                <p>{address.address_line}</p>
                <p>
                  {address.town}, {address.county}
                </p>
                <p className="mt-1 font-mono text-[9.5px] text-muted">{address.phone}</p>
                {address.instructions ? (
                  <p className="mt-1.5 rounded-lg bg-sand/55 px-2 py-1.5 text-[9px] leading-relaxed text-muted">
                    {address.instructions}
                  </p>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-ink/[0.06] pt-2.5">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-semibold text-ink-soft transition hover:bg-sand hover:text-ink"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                {!address.is_default ? (
                  <button
                    type="button"
                    onClick={() => setDefault(address)}
                    disabled={busyId === address.id}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-semibold text-ink-soft transition hover:bg-sand hover:text-ink disabled:opacity-50"
                  >
                    {busyId === address.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3" />
                    )}
                    Make default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDeleting(address)}
                  className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-semibold text-[#a3301d]/75 transition hover:bg-[#fdf2ee] hover:text-[#a3301d]"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-[1.2rem] border border-dashed border-line bg-white/50 px-5 py-12 text-center">
          <MapPin className="mx-auto h-6 w-6 text-muted" strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-semibold">No saved addresses</p>
          <p className="mx-auto mt-1 max-w-xs text-[10.5px] leading-relaxed text-muted">
            Save a delivery spot and checkout will be quicker next time.
          </p>
          <button type="button" onClick={openNew} className="btn btn-primary btn-sm mt-4">
            Add your first address
          </button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title={editing ? 'Edit delivery address' : 'Add a delivery address'}
        description="We only use this to deliver your Martify orders."
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="address-form"
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Save address'}
            </button>
          </div>
        }
      >
        <form id="address-form" onSubmit={save} className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Label">
            <input
              className="input"
              value={form.label}
              onChange={(event) => update('label', event.target.value)}
              placeholder="Home, Office…"
              maxLength={40}
            />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <input
              className="input"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="+254 7xx xxx xxx"
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
          <Field label="Recipient" error={errors.recipient} className="sm:col-span-2">
            <input
              className="input"
              value={form.recipient}
              onChange={(event) => update('recipient', event.target.value)}
              placeholder="Who receives the parcel?"
              autoComplete="name"
            />
          </Field>
          <Field label="County" error={errors.county}>
            <select
              className="select"
              value={form.county}
              onChange={(event) => update('county', event.target.value)}
            >
              {COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Town / estate" error={errors.town}>
            <input
              className="input"
              value={form.town}
              onChange={(event) => update('town', event.target.value)}
              placeholder="e.g. Kilimani"
              autoComplete="address-level2"
            />
          </Field>
          <Field label="Street, building, house" error={errors.addressLine} className="sm:col-span-2">
            <input
              className="input"
              value={form.addressLine}
              onChange={(event) => update('addressLine', event.target.value)}
              placeholder="e.g. Riverside Drive, Apt 4B"
              autoComplete="street-address"
            />
          </Field>
          <Field label="Delivery notes (optional)" className="sm:col-span-2">
            <textarea
              className="textarea min-h-[76px]"
              value={form.instructions}
              onChange={(event) => update('instructions', event.target.value)}
              placeholder="Gate code, landmark, or a good time to deliver."
              maxLength={300}
            />
          </Field>
          <label className="flex cursor-pointer items-start gap-2.5 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault || editing?.is_default}
              disabled={editing?.is_default}
              onChange={(event) => update('isDefault', event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#ed5a22]"
            />
            <span>
              <span className="block text-[10.5px] font-semibold text-ink-soft">
                Use as my default delivery address
              </span>
              <span className="mt-0.5 block text-[9.5px] text-muted">
                It will be selected automatically at checkout.
              </span>
            </span>
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => !saving && setDeleting(null)}
        title="Remove this address?"
        description="You can always add it again later."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              disabled={saving}
              className="btn btn-ghost btn-sm"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? 'Removing…' : 'Remove address'}
            </button>
          </div>
        }
      >
        {deleting ? (
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              {deleting.label || 'Address'}
            </span>{' '}
            — {deleting.address_line}, {deleting.town}, {deleting.county}. Orders
            already placed are not affected.
          </p>
        ) : null}
      </Modal>
    </>
  );
}
