import Link from 'next/link';
import { ShieldCheck, Store } from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import StoreCard from '@/components/shop/StoreCard';
import { listStores } from '@/lib/catalog';

export const metadata = {
  title: 'Stores',
  description:
    'Meet the verified Kenyan businesses selling on Martify — independent shops, makers and specialists with buyer protection on every order.',
  alternates: { canonical: '/stores' },
};

export default async function StoresPage() {
  const stores = await listStores();
  const featured = stores.find((store) => store.featured) || stores[0];
  const rest = stores.filter((store) => store.id !== featured?.id);

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Stores' }]}
        eyebrow="Shops worth knowing"
        title="Real businesses. Real people."
        description="Every store on Martify is reviewed by our team before it goes live. Meet the makers, curators and specialists behind the products."
        aside={
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-line/70 bg-white/70 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-soft text-leaf">
              <Store className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                On Martify
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-ink">
                {stores.length} approved stores
              </p>
            </div>
          </div>
        }
      />

      {featured ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StoreCard store={featured} featured />
          {rest.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="card mt-6 px-6 py-14 text-center">
          <h2 className="text-[18px] font-bold tracking-[-0.03em]">
            No stores yet
          </h2>
          <p className="mt-2 text-[12px] text-muted">
            We are onboarding our first sellers. Check back shortly.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: 'Reviewed before launch',
            body: 'Business details and product quality are checked by the Martify team.',
          },
          {
            icon: Store,
            title: 'Buy direct from the seller',
            body: 'Your order goes straight to the business that makes or curates it.',
          },
          {
            icon: ShieldCheck,
            title: 'Protected by Martify',
            body: 'Pay securely and get support if something is not as described.',
          },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-line/70 bg-white/60 p-4"
          >
            <Icon className="h-4 w-4 text-brand-dark" strokeWidth={1.8} />
            <p className="mt-2.5 text-[11.5px] font-semibold text-ink">
              {title}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-[#fff3e9] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow text-brand-dark">Your business next?</p>
          <h2 className="mt-1.5 text-[20px] font-bold tracking-[-0.04em]">
            Open a store on Martify.
          </h2>
          <p className="mt-1 max-w-md text-[11.5px] leading-relaxed text-muted">
            Reach shoppers across Kenya with M-Pesa payouts and tools to grow.
          </p>
        </div>
        <Link href="/sell" className="btn btn-dark shrink-0">
          Start selling
        </Link>
      </div>
    </div>
  );
}
