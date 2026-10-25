import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Radar,
  RotateCcw,
} from 'lucide-react';
import ContactForm from '@/components/support/ContactForm';
import PageIntro from '@/components/shop/PageIntro';
import { getSettings } from '@/lib/catalog';

export const metadata = {
  title: 'Contact us',
  description:
    'Reach Martify support about orders, delivery, payments, returns or selling.',
};

export default async function ContactPage() {
  const settings = await getSettings();
  const phoneHref = settings.support_phone.replace(/\s/g, '');

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact us' }]}
        eyebrow="Support"
        title="Let's sort it out."
        description="Tell us what happened and include your order number if you have one. Real humans, Kenyan hours, no endless bots."
        aside={
          <a href={`mailto:${settings.support_email}`} className="btn btn-primary w-full sm:w-auto">
            <Mail className="h-4 w-4" />
            Email support
          </a>
        }
      />

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[1.35rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
          <p className="eyebrow">Send a message</p>
          <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-[-0.035em]">
            A note with the right details.
          </h2>
          <p className="mt-1.5 max-w-lg text-[11px] leading-relaxed text-muted">
            Include your order number, the email or phone used at checkout, and a
            short description. Avoid sharing passwords or card details.
          </p>
          <div className="mt-5">
            <ContactForm supportEmail={settings.support_email} />
          </div>
        </section>

        <aside className="space-y-3">
          <section className="rounded-[1.3rem] border border-line/80 bg-white/60 p-4">
            <h2 className="text-[11.5px] font-bold">Direct channels</h2>
            <div className="mt-2.5 space-y-2">
              <a
                href={`mailto:${settings.support_email}`}
                className="flex items-start gap-2.5 rounded-xl border border-line/60 bg-[#fffdfa] p-3 transition hover:border-ink/20"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sand text-ink-soft">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-[10.5px] font-bold text-ink">Email us</span>
                  <span className="mt-0.5 block break-all text-[9.5px] text-muted">
                    {settings.support_email}
                  </span>
                </span>
              </a>
              <a
                href={`tel:${phoneHref}`}
                className="flex items-start gap-2.5 rounded-xl border border-line/60 bg-[#fffdfa] p-3 transition hover:border-ink/20"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sand text-ink-soft">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-[10.5px] font-bold text-ink">Call or WhatsApp</span>
                  <span className="mt-0.5 block text-[9.5px] text-muted">
                    {settings.support_phone}
                  </span>
                </span>
              </a>
            </div>
            <div className="mt-3 space-y-2 border-t border-ink/[0.06] pt-3 text-[9.5px] text-muted">
              <p className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Monday–Saturday, 8:00am–6:00pm EAT
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Riverside Drive, Nairobi, Kenya
              </p>
            </div>
          </section>

          <section className="rounded-[1.3rem] border border-line/80 bg-white/60 p-4">
            <h2 className="text-[11.5px] font-bold">Faster answers</h2>
            <div className="mt-2 grid gap-1">
              {[
                { href: '/track', label: 'Track your order', icon: Radar },
                { href: '/returns', label: 'Returns & refunds', icon: RotateCcw },
                { href: '/help', label: 'Help centre', icon: MessageCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-medium text-ink-soft transition hover:bg-sand/60 hover:text-ink"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                    <ArrowRight className="ml-auto h-3 w-3 text-muted" />
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="rounded-[1.3rem] border border-brand/20 bg-brand-soft/55 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-dark">
              Demo notice
            </p>
            <p className="mt-1.5 text-[9.5px] leading-relaxed text-ink-soft">
              Martify is a demonstration build. Contact form messages are composed
              in your email app, not transmitted to Martify servers. Never treat
              simulated balances or payments as real funds.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
