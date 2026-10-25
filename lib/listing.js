export const LISTING_SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'discount', label: 'Biggest discount' },
];

const SORT_VALUES = new Set(LISTING_SORTS.map((option) => option.value));
const MAX_PRICE_SHILLINGS = 10_000_000;

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function list(value) {
  const values = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [
    ...new Set(
      values
        .map((entry) => String(entry).trim())
        .filter((entry) => entry.length > 0 && entry.length <= 80),
    ),
  ].slice(0, 24);
}

function price(value) {
  if (value === null || value === undefined || value === '') return '';
  const parsed = Number(String(first(value)).replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return String(Math.min(MAX_PRICE_SHILLINGS, Math.round(parsed)));
}

export function parseListingParams(searchParams = {}, options = {}) {
  const params = searchParams || {};
  const defaultSort = options.defaultSort || 'popular';
  const sort = first(params.sort);
  const rating = first(params.rating);
  const page = Number.parseInt(first(params.page), 10);
  const view = first(params.view);
  const parsedRating = Number.parseInt(rating, 10);

  return {
    q: String(first(params.q) || '').trim().slice(0, 100),
    sort: SORT_VALUES.has(sort) ? sort : defaultSort,
    brands: list(params.brand),
    locations: list(params.location),
    min: price(params.min),
    max: price(params.max),
    rating: [2, 3, 4, 5].includes(parsedRating) ? parsedRating : '',
    page: Number.isFinite(page) ? Math.min(200, Math.max(1, page)) : 1,
    view: view === 'list' ? 'list' : 'grid',
  };
}

export function listingQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.brands?.length) params.set('brand', filters.brands.join(','));
  if (filters.locations?.length) {
    params.set('location', filters.locations.join(','));
  }
  if (filters.min) params.set('min', filters.min);
  if (filters.max) params.set('max', filters.max);
  if (filters.rating) params.set('rating', String(filters.rating));
  if (filters.view === 'list') params.set('view', 'list');
  if (filters.page && Number(filters.page) > 1) {
    params.set('page', String(filters.page));
  }
  return params.toString();
}

export function listingHref(basePath, filters = {}) {
  const query = listingQuery(filters);
  return query ? `${basePath}?${query}` : basePath;
}

export function activeFilterCount(filters = {}) {
  return (
    (filters.brands?.length || 0) +
    (filters.locations?.length || 0) +
    (filters.min ? 1 : 0) +
    (filters.max ? 1 : 0) +
    (filters.rating ? 1 : 0)
  );
}

export function listingPriceCents(filters = {}) {
  return {
    minPrice: filters.min ? Number(filters.min) * 100 : null,
    maxPrice: filters.max ? Number(filters.max) * 100 : null,
  };
}
