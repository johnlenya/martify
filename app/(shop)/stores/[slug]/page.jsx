import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Package,
  ShieldCheck,
  Star,
} from 'lucide-react';
import CatalogView from '@/components/shop/CatalogView';
import SmartImage from '@/components/ui/SmartImage';
import {
  getSellerStore,
  listProducts,
} from '@/lib/catalog';
import {
  listingPriceCents,
  parseListingParams,
} from '@/lib/listing';

function formatJoined(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('en-KE', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = await getSellerStore(slug);
  if (!store) return { title: 'Store not found' };

  const description =
    store.tagline ||
    store.description?.slice(0, 155) ||
    `Shop ${store.storeName} on Martify.`;

  return {
    title: store.storeName,
    description,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: {
      title: `${store.storeName} · Martify`,
      description,
      images: store.bannerUrl ? [{ url: store.bannerUrl }] : undefined,
    },
  };
}

export default async function StorePage({ params, searchParams }) {
  const { slug } = await params;
  const store = await getSellerStore(slug);
  if (!store) notFound();

  const filters = parseListingParams(await searchParams);
  const price = listingPriceCents(filters);

  const data = await listProducts({
    sellerSlug: slug,
    brands: filters.brands,
    locations: filters.locations,
    minPrice: price.minPrice,
    maxPrice: price.maxPrice,
    rating: filters.rating || null,
    sort: filters.sort,
    page: filters.page,
    perPage: 24,
  });

  const initials = store.storeName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const joined = formatJoined(store.createdAt);
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.storeName,
    description: store.description || store.tagline,
    image: store.bannerUrl || undefined,
    url: `${baseUrl}/stores/${store.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: store.location || store.county || 'Nairobi',
      addressCountry: 'KE',
    },
    ...(store.avgRating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: store.avgRating,
            bestRating: 5,
            ratingCount: Math.max(1, store.totalSold),
          },
        }
      : {}),
  };

  return (
    <div className="container-page py-4 sm:py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden rounded-[1.9rem] border border-white/5 bg-night text-white">
        <SmartImage
          src={store.bannerUrl}
          alt={`${store.storeName} storefront`}
          className="absolute inset-0 h-full w-full"
          imageClassName="object-cover opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/20" />
        <div className="relative flex min-h-[260px] flex-col justify-between p-5 sm:min-h-[310px] sm:p-8 lg:p-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-[9px] font-medium uppercase tracking-[0.1em] text-white/35"
          >
            <Link href="/" className="transition hover:text-white/70">
              Home
            </Link>
            <ChevronRight className="h-2.5 w-2.5 opacity-50" strokeWidth={2} />
            <Link href="/stores" className="transition hover:text-white/70">
              Stores
            </Link>
            <ChevronRight className="h-2.5 w-2.5 opacity-50" strokeWidth={2} />
            <span className="text-white/60">{store.storeName}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end">
            {store.logoUrl ? (
              <SmartImage
                src={store.logoUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-2xl border border-white/20 sm:h-20 sm:w-20"
                sizes="80px"
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/15 bg-brand font-display text-[19px] font-extrabold tracking-[-0.05em] text-white sm:h-20 sm:w-20 sm:text-[22px]">
                {initials}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[2rem] font-extrabold leading-none tracking-[-0.055em] text-white sm:text-[2.6rem]">
                  {store.storeName}
                </h1>
                {store.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-leaf px-2 py-1 text-[8px] font-bold uppercase tracking-[0.07em] text-white">
                    <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.2} />
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full border border-white/20 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.07em] text-white/55">
                    New store
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-xl text-[12px] text-white/55">
                {store.tagline || `Shop ${store.storeName} on Martify.`}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" strokeWidth={1.8} />
                  {store.location || store.county || 'Kenya'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package className="h-3 w-3" strokeWidth={1.8} />
                  {store.productCount} products
                </span>
                {store.avgRating > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Star
                      className="h-3 w-3 fill-gold text-gold"
                      strokeWidth={0}
                    />
                    {store.avgRating.toFixed(1)} average rating
                  </span>
                ) : null}
                {joined ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" strokeWidth={1.8} />
                    Selling since {joined}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-sm sm:block">
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/35">
                Products sold
              </p>
              <p className="mt-1 font-mono text-[20px] font-semibold tracking-[-0.03em] text-white">
                {store.totalSold.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-line/70 bg-white/60 p-4 sm:p-5">
          <p className="eyebrow">About the store</p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
            {store.description ||
              `${store.storeName} sells on Martify with buyer protection on every order.`}
          </p>
        </div>
        <div className="rounded-2xl border border-line/70 bg-white/60 p-4 sm:p-5">
          <p className="eyebrow">Store policies</p>
          <ul className="mt-2.5 space-y-2 text-[10.5px] text-ink-soft">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" strokeWidth={1.9} />
              Buyer protection on every order
            </li>
            <li className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-ink-soft/60" strokeWidth={1.8} />
              Ships from {store.location || store.county || 'Kenya'}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-ink-soft/60" strokeWidth={1.8} />
              Countrywide delivery available
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">The collection</p>
          <h2 className="mt-1 font-display text-[1.4rem] font-extrabold tracking-[-0.045em] sm:text-[1.7rem]">
            Products from {store.storeName}
          </h2>
        </div>
      </div>

      <div className="mt-4">
        <CatalogView
          products={data.products}
          total={data.total}
          page={data.page}
          pages={data.pages}
          brands={data.brands}
          locations={data.locations}
          filters={filters}
          basePath={`/stores/${store.slug}`}
          emptyTitle="This store has no products yet"
          emptyDescription="Check back soon, or explore other verified stores on Martify."
          emptyActionLabel="Browse stores"
          emptyActionHref="/stores"
        />
      </div>
    </div>
  );
}
