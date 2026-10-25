import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { getCategoryTree, getSettings } from '@/lib/catalog';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-[11.5px] text-white/60 transition hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SiteFooter() {
  const [categories, settings, locale] = await Promise.all([
    getCategoryTree(),
    getSettings(),
    getLocale(),
  ]);
  const dictionary = getDictionary(locale);
  const topCategories = categories.slice(0, 5);

  return (
    <footer className="mt-16 bg-night text-white">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Logo light />
            <p className="mt-4 max-w-[320px] text-[12px] leading-relaxed text-white/55">
              A marketplace built for Kenya. Discover trusted sellers, fair prices
              and a checkout that works the way you do — M-Pesa, card or cash.
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-[#3aa86b] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-white">
                M-Pesa
              </span>
              <span className="rounded-md bg-white px-2.5 py-1 text-[9px] font-bold uppercase italic tracking-[0.06em] text-[#1a1f71]">
                Visa
              </span>
              <span className="rounded-md bg-white px-2.5 py-1 text-[9px] font-bold tracking-[0.02em] text-[#171714]">
                mastercard
              </span>
              <span className="rounded-md border border-white/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-white/55">
                Cash on delivery
              </span>
            </div>

            <div className="mt-5 space-y-1.5 text-[11px] text-white/45">
              <a
                href={`mailto:${settings.support_email}`}
                className="flex items-center gap-2 transition hover:text-white/75"
              >
                <Mail className="h-3.5 w-3.5" /> {settings.support_email}
              </a>
              <a
                href={`tel:${settings.support_phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 transition hover:text-white/75"
              >
                <Phone className="h-3.5 w-3.5" /> {settings.support_phone}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Nairobi, Kenya
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterColumn
              title="Shop"
              links={[
                { href: '/deals', label: dictionary['nav.deals'] },
                { href: '/new', label: dictionary['nav.new'] },
                { href: '/stores', label: dictionary['nav.stores'] },
                { href: '/categories', label: dictionary['nav.all'] },
                ...topCategories.map((category) => ({
                  href: `/category/${category.slug}`,
                  label: category.name,
                })),
              ]}
            />
            <FooterColumn
              title="Sell on Martify"
              links={[
                { href: '/sell', label: 'Start selling' },
                { href: '/sell#plans', label: 'Seller plans' },
                { href: '/seller', label: 'Seller dashboard' },
                { href: '/sell#fees', label: 'Fees & commissions' },
                { href: '/sell#payouts', label: 'Getting paid' },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { href: '/help', label: 'Help centre' },
                { href: '/track', label: 'Track your order' },
                { href: '/returns', label: 'Returns & refunds' },
                { href: '/contact', label: 'Contact us' },
                { href: '/account', label: 'Your account' },
              ]}
            />
            <FooterColumn
              title="Martify"
              links={[
                { href: '/about', label: 'Our story' },
                { href: '/affiliate', label: 'Affiliate programme' },
                { href: '/terms', label: 'Terms of service' },
                { href: '/privacy', label: 'Privacy policy' },
                { href: '/admin', label: 'Admin console' },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10.5px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Martify Technologies Ltd. Made in Nairobi,
            for Kenya.
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            {dictionary['footer.demo']}
          </p>
        </div>
      </div>
    </footer>
  );
}
