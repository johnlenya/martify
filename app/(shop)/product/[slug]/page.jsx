import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  MessageSquareQuote,
  RotateCcw,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel';
import ReviewPhotos from '@/components/product/ReviewPhotos';
import TrackProductView from '@/components/product/TrackProductView';
import ProductRail from '@/components/storefront/ProductRail';
import RatingStars from '@/components/ui/RatingStars';
import SmartImage from '@/components/ui/SmartImage';
import {
  deliveryOptions,
  getCategoryBySlug,
  getProductDetail,
  getSettings,
} from '@/lib/catalog';
import { formatDate, estimatedDelivery } from '@/lib/format';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { formatMoney } from '@/lib/money';

function truncate(value, length = 155) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) return { title: 'Product not found' };

  const { product, seller } = data;
  const description =
    truncate(product.description) ||
    `Buy ${product.title} from ${seller.name} on Martify.`;

  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.title} · Martify`,
      description,
      images: product.images.slice(0, 3).map((url) => ({ url })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} · Martify`,
      description,
      images: product.images.slice(0, 3),
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) notFound();

  const { product, variants, reviews, distribution, related, seller } = data;
  const [settings, locale, category] = await Promise.all([
    getSettings(),
    getLocale(),
    getCategoryBySlug(product.category.slug),
  ]);
  const dict = getDictionary(locale);

  const parentCategory = category?.parent ?? null;
  const delivery = deliveryOptions(settings);
  const descriptionParagraphs = String(product.description || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const sellerInitials = seller.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const writtenCount = reviews.length;
  const distributionTotal = Object.values(distribution).reduce(
    (sum, count) => sum + count,
    0,
  );

  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: truncate(product.description, 5000),
    sku: variants[0]?.sku || product.slug,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category.name,
    itemCondition: product.tags?.includes('Refurbished')
      ? 'https://schema.org/UsedCondition'
      : 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'KES',
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: seller.name,
      },
    },
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: product.ratingCount,
            ...(writtenCount ? { reviewCount: writtenCount } : {}),
          },
        }
      : {}),
  };

  const glanceRows = [
    ['Brand', product.brand],
    [
      'Category',
      <Link
        key="category"
        href={`/category/${product.category.slug}`}
        className="font-medium text-ink transition hover:text-brand-dark"
      >
        {product.category.name}
      </Link>,
    ],
    [
      'Sold by',
      <Link
        key="seller"
        href={`/stores/${seller.slug}`}
        className="font-medium text-ink transition hover:text-brand-dark"
      >
        {seller.name}
      </Link>,
    ],
    ['Ships from', product.location || seller.location || 'Kenya'],
    ['SKU', variants[0]?.sku],
    [
      'Availability',
      product.stock > 0 ? `${product.stock} in stock` : 'Out of stock',
    ],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="container-page py-4 sm:py-6">
      <TrackProductView productId={product.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-[9px] font-medium uppercase tracking-[0.1em] text-muted"
      >
        <Link href="/" className="transition hover:text-ink">
          Home
        </Link>
        <ChevronRight className="h-2.5 w-2.5 opacity-50" strokeWidth={2} />
        {parentCategory ? (
          <>
            <Link
              href={`/category/${parentCategory.slug}`}
              className="transition hover:text-ink"
            >
              {parentCategory.name}
            </Link>
            <ChevronRight className="h-2.5 w-2.5 opacity-50" strokeWidth={2} />
          </>
        ) : null}
        <Link
          href={`/category/${product.category.slug}`}
          className="transition hover:text-ink"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-2.5 w-2.5 opacity-50" strokeWidth={2} />
        <span className="line-clamp-1 max-w-[210px] text-ink/60 sm:max-w-[320px]">
          {product.title}
        </span>
      </nav>

      <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] xl:gap-7">
        <div>
          <ProductGallery
            images={product.images}
            title={product.title}
            discountPercent={product.discountPercent}
            flash={Boolean(product.flash)}
          />

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: ShieldCheck, label: 'Buyer protection' },
              { icon: Truck, label: 'Countrywide delivery' },
              { icon: RotateCcw, label: '14-day returns' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-line/70 bg-white/60 px-2 py-3 text-center"
              >
                <item.icon className="h-4 w-4 text-ink-soft/70" strokeWidth={1.7} />
                <span className="text-[9px] font-medium leading-tight text-ink-soft">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <ProductPurchasePanel
            product={product}
            variants={variants}
            settings={settings}
            deliveryEstimate={estimatedDelivery(3)}
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <p className="eyebrow">Delivery</p>
              <h2 className="mt-1 font-display text-[15px] font-bold tracking-[-0.03em]">
                How it gets to you
              </h2>
              <ul className="mt-3 space-y-2.5">
                {Object.entries(delivery).map(([key, option]) => (
                  <li
                    key={key}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="flex items-start gap-2">
                      <Truck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft/60"
                        strokeWidth={1.8}
                      />
                      <span>
                        <span className="block text-[10.5px] font-semibold text-ink">
                          {option.label}
                        </span>
                        <span className="block text-[9.5px] text-muted">
                          {option.eta}
                        </span>
                      </span>
                    </span>
                    <span className="price shrink-0 text-[10.5px] font-semibold text-ink-soft">
                      {formatMoney(option.feeCents)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-ink/[0.06] pt-2.5 text-[9.5px] font-medium leading-relaxed text-leaf">
                Free door delivery on orders over{' '}
                {formatMoney(settings.free_delivery_threshold_cents)}
              </p>
            </div>

            <div className="card flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="eyebrow">Sold by</p>
                  <h2 className="mt-1 font-display text-[15px] font-bold tracking-[-0.03em]">
                    {seller.name}
                  </h2>
                </div>
                {seller.verified ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-leaf-soft px-2 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-leaf">
                    <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.2} />
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-sand px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-muted">
                    New store
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex items-center gap-2.5">
                {seller.logoUrl ? (
                  <SmartImage
                    src={seller.logoUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-xl"
                    sizes="36px"
                  />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-night font-display text-[11px] font-bold text-white">
                    {sellerInitials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-[10px] text-muted">
                    <Star className="h-3 w-3 fill-gold text-gold" strokeWidth={0} />
                    <span className="font-semibold text-ink-soft">
                      {seller.avgRating > 0
                        ? seller.avgRating.toFixed(1)
                        : 'New'}
                    </span>
                    · {seller.productCount} products
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[9.5px] text-muted">
                    <MapPin className="h-2.5 w-2.5" strokeWidth={1.8} />
                    {seller.location || seller.county || 'Kenya'}
                  </p>
                </div>
              </div>

              {seller.tagline ? (
                <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-muted">
                  {seller.tagline}
                </p>
              ) : null}

              <Link
                href={`/stores/${seller.slug}`}
                className="btn btn-outline btn-sm mt-auto w-full pt-2"
              >
                <Store className="h-3.5 w-3.5" strokeWidth={1.8} />
                {dict['product.visitStore']}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)]">
        <div className="card p-5 sm:p-6">
          <p className="eyebrow">Product details</p>
          <h2 className="mt-1.5 font-display text-[1.35rem] font-extrabold tracking-[-0.04em] sm:text-[1.55rem]">
            Everything you need to know
          </h2>
          <div className="rich-text mt-3">
            {descriptionParagraphs.length ? (
              descriptionParagraphs.map((paragraph, index) => (
                <p key={`paragraph-${index}`}>{paragraph}</p>
              ))
            ) : (
              <p>
                {seller.name} has not added a longer description for this
                listing yet. Reach out through your order page if you need more
                details before buying.
              </p>
            )}
          </div>
          {product.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink/[0.06] pt-4">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="chip transition hover:border-ink/30 hover:text-ink"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="card p-5">
          <p className="eyebrow">At a glance</p>
          <h2 className="mt-1.5 font-display text-[1.2rem] font-extrabold tracking-[-0.04em]">
            Highlights
          </h2>
          <dl className="mt-3 divide-y divide-ink/[0.06]">
            {glanceRows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <dt className="text-[10px] font-medium text-muted">{label}</dt>
                <dd className="max-w-[62%] text-right text-[10.5px] font-medium text-ink-soft">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-cream p-2.5">
            <ShieldCheck
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf"
              strokeWidth={1.9}
            />
            <p className="text-[9.5px] leading-relaxed text-muted">
              Every order on Martify is covered by buyer protection. Pay only
              through the checkout and keep conversations inside the platform.
            </p>
          </div>
        </aside>
      </section>

      <section
        id="reviews"
        className="mt-9 scroll-mt-28 sm:mt-11"
        aria-labelledby="reviews-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">From the community</p>
            <h2 id="reviews-title" className="section-heading mt-1.5">
              Customer reviews
            </h2>
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-muted">
              Honest feedback from shoppers who bought from {seller.name}. Photo
              reviews are shared by customers as-is.
            </p>
          </div>
          {writtenCount ? (
            <span className="chip">
              {writtenCount} written {writtenCount === 1 ? 'review' : 'reviews'}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="card h-fit p-5 lg:sticky lg:top-[160px]">
            <p className="eyebrow">Rating snapshot</p>
            <div className="mt-2 flex items-end gap-2.5">
              <p className="font-display text-[2.8rem] font-extrabold leading-none tracking-[-0.06em] text-ink">
                {product.rating.toFixed(1)}
              </p>
              <div className="pb-1">
                <RatingStars
                  value={product.rating}
                  size={14}
                  showValue={false}
                />
                <p className="mt-1 text-[9.5px] text-muted">
                  from {product.ratingCount.toLocaleString()} ratings
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] ?? 0;
                const percent = distributionTotal
                  ? Math.round((count / distributionTotal) * 100)
                  : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-[9.5px] font-medium text-muted">
                      {star} ★
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right font-mono text-[9px] text-muted">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 border-t border-ink/[0.06] pt-3 text-[9.5px] leading-relaxed text-muted">
              {writtenCount
                ? `Showing the ${writtenCount} most recent written ${
                    writtenCount === 1 ? 'review' : 'reviews'
                  }.`
                : 'No written reviews yet — check back after the first orders arrive.'}
            </p>
          </div>

          <div className="space-y-2.5">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {review.authorAvatar ? (
                        <SmartImage
                          src={review.authorAvatar}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-full"
                          sizes="32px"
                        />
                      ) : (
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand font-display text-[11px] font-bold text-ink-soft">
                          {review.author.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-[11.5px] font-semibold text-ink">
                          {review.author}
                        </p>
                        <p className="text-[9.5px] text-muted">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <RatingStars value={review.rating} size={11} showValue={false} />
                  </div>

                  {review.title ? (
                    <h3 className="mt-3 font-display text-[13.5px] font-bold tracking-[-0.02em] text-ink">
                      {review.title}
                    </h3>
                  ) : null}
                  {review.body ? (
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                      {review.body}
                    </p>
                  ) : null}
                  {review.images?.length ? (
                    <ReviewPhotos
                      images={review.images}
                      alt={`${product.title} customer photo`}
                    />
                  ) : null}
                </article>
              ))
            ) : (
              <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand text-ink/40">
                  <MessageSquareQuote className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display text-[17px] font-bold tracking-[-0.03em]">
                  No written reviews yet
                </h3>
                <p className="mt-1.5 max-w-sm text-[11.5px] leading-relaxed text-muted">
                  {product.ratingCount > 0
                    ? `This product holds a ${product.rating.toFixed(1)} star rating from ${product.ratingCount.toLocaleString()} shoppers. Be the first to leave a written review.`
                    : 'Bought this item? Your review will appear here once orders are delivered.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ProductRail
        id="related-title"
        eyebrow="Keep exploring"
        title={dict['product.youMayLike']}
        subtitle="More finds from this category, chosen by shoppers like you."
        href={`/category/${product.category.slug}`}
        products={related}
      />
    </div>
  );
}
