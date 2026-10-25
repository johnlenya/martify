import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  AFFILIATE_COMMISSION_BPS,
  commissionBpsFor,
  couponDiscountFor,
  deliveryFeeFor,
} from '../commerce.js';

const DAY = 86_400_000;
const daysAgo = (days) => new Date(Date.now() - days * DAY);
const inDays = (days) => new Date(Date.now() + days * DAY);
const img = (id, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;

const PASSWORD_CUSTOMER = 'Demo1234!';
const PASSWORD_SELLER = 'Seller123!';
const PASSWORD_ADMIN = 'Admin123!';

const userSeeds = [
  {
    key: 'demo',
    name: 'Aisha Mwangi',
    email: 'demo@martify.co.ke',
    phone: '+254712345678',
    role: 'customer',
    password: PASSWORD_CUSTOMER,
    referralCode: 'MARTY-DEMO10',
    daysAgo: 42,
  },
  {
    key: 'grace',
    name: 'Grace Wanjiru',
    email: 'grace.wanjiru@example.com',
    phone: '+254722111222',
    role: 'customer',
    password: PASSWORD_CUSTOMER,
    daysAgo: 80,
  },
  {
    key: 'peter',
    name: 'Peter Otieno',
    email: 'peter.otieno@example.com',
    phone: '+254733444555',
    role: 'customer',
    password: PASSWORD_CUSTOMER,
    daysAgo: 75,
  },
  {
    key: 'achieng',
    name: 'Achieng Odhiambo',
    email: 'achieng.odhiambo@example.com',
    phone: '+254744555666',
    role: 'customer',
    password: PASSWORD_CUSTOMER,
    daysAgo: 61,
  },
  {
    key: 'brianC',
    name: 'Brian Kimani',
    email: 'brian.kimani@example.com',
    phone: '+254755666777',
    role: 'customer',
    password: PASSWORD_CUSTOMER,
    referredBy: 'MARTY-DEMO10',
    daysAgo: 30,
  },
  {
    key: 'amina',
    name: 'Amina Hassan',
    email: 'amina@sokoyard.co.ke',
    phone: '+254711000111',
    role: 'seller',
    password: PASSWORD_SELLER,
    daysAgo: 120,
  },
  {
    key: 'brianS',
    name: 'Brian Mwangi',
    email: 'brian@technest.co.ke',
    phone: '+254722000222',
    role: 'seller',
    password: PASSWORD_SELLER,
    daysAgo: 115,
  },
  {
    key: 'wanjiku',
    name: 'Wanjiku Kariuki',
    email: 'wanjiku@zawadihome.co.ke',
    phone: '+254733000333',
    role: 'seller',
    password: PASSWORD_SELLER,
    daysAgo: 100,
  },
  {
    key: 'kamau',
    name: 'Kamau Njoroge',
    email: 'kamau@mavunogrocers.co.ke',
    phone: '+254744000444',
    role: 'seller',
    password: PASSWORD_SELLER,
    daysAgo: 95,
  },
  {
    key: 'faith',
    name: 'Faith Njeri',
    email: 'faith@glowbeauty.co.ke',
    phone: '+254755000555',
    role: 'seller',
    password: PASSWORD_SELLER,
    daysAgo: 88,
  },
  {
    key: 'moses',
    name: 'Moses Kiptoo',
    email: 'moses@kilimanibikes.co.ke',
    phone: '+254766000666',
    role: 'seller',
    password: PASSWORD_SELLER,
    daysAgo: 3,
  },
  {
    key: 'admin',
    name: 'Martify Admin',
    email: 'admin@martify.co.ke',
    phone: '+254700000000',
    role: 'admin',
    password: PASSWORD_ADMIN,
    daysAgo: 150,
  },
];

const sellerSeeds = [
  {
    key: 'soko',
    user: 'amina',
    storeName: 'Soko Yard',
    slug: 'soko-yard',
    tagline: 'Easy style, made in Kenya',
    description:
      'A Nairobi design studio for easy, well-made everyday pieces. We work with local tailors and artisans, and every order is packed by our small team in Kilimani.',
    location: 'Kilimani, Nairobi',
    county: 'Nairobi',
    status: 'approved',
    verified: true,
    featured: true,
    tier: 'pro',
    tierStartedDaysAgo: 12,
    tierEndsInDays: 20,
    logoUrl: null,
    bannerUrl: img('photo-1441986300917-64674bd600d8', 1600),
    payoutMethod: 'mpesa',
    payoutDestination: '+254 711 000 111',
    businessName: 'Soko Yard Trading Ltd',
    registrationNumber: 'PVT-2019-88213',
    taxPin: 'P051234567X',
  },
  {
    key: 'technest',
    user: 'brianS',
    storeName: 'TechNest KE',
    slug: 'technest-ke',
    tagline: 'Genuine tech, honest prices',
    description:
      'Authentic phones, audio and computing gear with local warranties. We test every unit, seal every box and ship across Kenya from our Nairobi warehouse.',
    location: 'Ngara, Nairobi',
    county: 'Nairobi',
    status: 'approved',
    verified: true,
    featured: false,
    tier: 'premium',
    tierStartedDaysAgo: 5,
    tierEndsInDays: 25,
    bannerUrl: img('photo-1498049794561-7780e7231661', 1600),
    payoutMethod: 'bank',
    payoutDestination: 'KCB •••• 4821',
    businessName: 'TechNest Kenya Limited',
    registrationNumber: 'PVT-2018-41002',
    taxPin: 'P051998877Y',
  },
  {
    key: 'zawadi',
    user: 'wanjiku',
    storeName: 'Zawadi Home',
    slug: 'zawadi-home',
    tagline: 'Small comforts, beautifully made',
    description:
      'Furniture, textiles and handmade decor for Kenyan homes. We combine workshop pieces with artisan-made accents and deliver carefully across the country.',
    location: 'Karen, Nairobi',
    county: 'Nairobi',
    status: 'approved',
    verified: true,
    featured: false,
    tier: 'pro',
    tierStartedDaysAgo: 8,
    tierEndsInDays: 22,
    bannerUrl: img('photo-1616486338812-3dadae4b4ace', 1600),
    payoutMethod: 'bank',
    payoutDestination: 'Equity •••• 1130',
    businessName: 'Zawadi Interiors Ltd',
    registrationNumber: 'PVT-2020-66120',
    taxPin: 'P051112233Z',
  },
  {
    key: 'mavuno',
    user: 'kamau',
    storeName: 'Mavuno Grocers',
    slug: 'mavuno-grocers',
    tagline: 'Fresh from the farm, fairly priced',
    description:
      'Everyday groceries and fresh produce sourced from Kenyan farms and packed the same day. Simple food, no fuss, delivered with care.',
    location: 'Wakulima, Nairobi',
    county: 'Nairobi',
    status: 'approved',
    verified: false,
    featured: false,
    tier: 'free',
    bannerUrl: img('photo-1542838132-92c53300491e', 1600),
    payoutMethod: 'mpesa',
    payoutDestination: '+254 744 000 444',
    businessName: 'Mavuno Grocers',
    registrationNumber: 'BN-2021-44312',
    taxPin: 'P051331212A',
  },
  {
    key: 'glow',
    user: 'faith',
    storeName: 'Glow Beauty KE',
    slug: 'glow-beauty-ke',
    tagline: 'Skincare that works on our skin',
    description:
      'Dermatologist-informed skincare and fragrance, chosen for warm climates and melanin-rich skin. Authentic products, with ingredient lists you can actually read.',
    location: 'Westlands, Nairobi',
    county: 'Nairobi',
    status: 'approved',
    verified: true,
    featured: false,
    tier: 'pro',
    tierStartedDaysAgo: 4,
    tierEndsInDays: 26,
    bannerUrl: img('photo-1596462502278-27bfdc403348', 1600),
    payoutMethod: 'mpesa',
    payoutDestination: '+254 755 000 555',
    businessName: 'Glow Beauty Limited',
    registrationNumber: 'PVT-2022-10771',
    taxPin: 'P051556677B',
  },
  {
    key: 'kilimani',
    user: 'moses',
    storeName: 'Kilimani Bikes',
    slug: 'kilimani-bikes',
    tagline: 'Ride more, worry less',
    description:
      'Bikes, helmets and trail gear, assembled by mechanics who actually ride. New store awaiting Martify verification.',
    location: 'Kilimani, Nairobi',
    county: 'Nairobi',
    status: 'pending',
    verified: false,
    featured: false,
    tier: 'free',
    bannerUrl: img('photo-1485965120184-e220f721d03e', 1600),
    businessName: 'Kilimani Bikes Ltd',
    registrationNumber: 'PVT-2026-01018',
    taxPin: 'P051778899C',
    payoutMethod: 'mpesa',
    payoutDestination: '+254 766 000 666',
  },
];

const categoryTree = [
  {
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    icon: 'smartphone',
    commission: 900,
    children: [
      { name: 'Smartphones', slug: 'smartphones', commission: 900, icon: 'smartphone' },
      { name: 'Tablets', slug: 'tablets', commission: 900, icon: 'tablet' },
      { name: 'Phone Accessories', slug: 'phone-accessories', commission: 1200, icon: 'battery-charging' },
    ],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'laptop',
    commission: 1000,
    children: [
      { name: 'Audio', slug: 'audio', commission: 1000, icon: 'headphones' },
      { name: 'TVs & Displays', slug: 'tvs-displays', commission: 1000, icon: 'tv' },
      { name: 'Laptops & Computing', slug: 'laptops', commission: 900, icon: 'laptop' },
      { name: 'Cameras', slug: 'cameras', commission: 1000, icon: 'camera' },
      { name: 'Gaming', slug: 'gaming', commission: 1100, icon: 'gamepad-2' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: 'shirt',
    commission: 1200,
    children: [
      { name: "Women's Fashion", slug: 'womens-fashion', commission: 1200, icon: 'shirt' },
      { name: "Men's Fashion", slug: 'mens-fashion', commission: 1200, icon: 'shirt' },
      { name: 'Shoes', slug: 'shoes', commission: 1200, icon: 'footprints' },
      { name: 'Bags', slug: 'bags', commission: 1300, icon: 'briefcase' },
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'sofa',
    commission: 1100,
    children: [
      { name: 'Furniture', slug: 'furniture', commission: 1000, icon: 'sofa' },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining', commission: 1100, icon: 'utensils' },
      { name: 'Decor', slug: 'decor', commission: 1200, icon: 'lamp' },
      { name: 'Bedding', slug: 'bedding', commission: 1100, icon: 'bed-double' },
    ],
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    icon: 'sparkles',
    commission: 1500,
    children: [
      { name: 'Skincare', slug: 'skincare', commission: 1500, icon: 'droplets' },
      { name: 'Makeup', slug: 'makeup', commission: 1500, icon: 'brush' },
      { name: 'Fragrance', slug: 'fragrance', commission: 1400, icon: 'spray-can' },
      { name: 'Personal Care', slug: 'personal-care', commission: 1300, icon: 'heart-pulse' },
    ],
  },
  {
    name: 'Groceries',
    slug: 'groceries',
    icon: 'shopping-basket',
    commission: 800,
    children: [
      { name: 'Pantry', slug: 'pantry', commission: 800, icon: 'package' },
      { name: 'Beverages', slug: 'beverages', commission: 900, icon: 'coffee' },
      { name: 'Fresh Produce', slug: 'fresh-produce', commission: 800, icon: 'apple' },
      { name: 'Snacks', slug: 'snacks', commission: 900, icon: 'cookie' },
    ],
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: 'dumbbell',
    commission: 1000,
    children: [
      { name: 'Fitness', slug: 'fitness', commission: 1000, icon: 'dumbbell' },
      { name: 'Outdoor', slug: 'outdoor', commission: 1000, icon: 'mountain' },
      { name: 'Sportswear', slug: 'sportswear', commission: 1100, icon: 'shirt' },
    ],
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    icon: 'baby',
    commission: 1100,
    children: [
      { name: 'Baby Gear', slug: 'baby-gear', commission: 1100, icon: 'baby' },
      { name: "Kids' Fashion", slug: 'kids-fashion', commission: 1200, icon: 'shirt' },
      { name: 'Toys', slug: 'toys', commission: 1100, icon: 'blocks' },
    ],
  },
  {
    name: 'Appliances',
    slug: 'appliances',
    icon: 'plug',
    commission: 900,
    children: [
      { name: 'Small Appliances', slug: 'small-appliances', commission: 900, icon: 'microwave' },
      { name: 'Large Appliances', slug: 'large-appliances', commission: 900, icon: 'refrigerator' },
    ],
  },
];

const products = [
  {
    slug: 'samsung-galaxy-a55-5g-256gb',
    seller: 'technest',
    category: 'smartphones',
    brand: 'Samsung',
    title: 'Samsung Galaxy A55 5G — 256GB',
    price: 4299900,
    compareAt: 4999900,
    stock: 24,
    rating: 4.7,
    ratingCount: 186,
    sold: 320,
    featured: true,
    sponsoredDays: 18,
    addedDaysAgo: 22,
    description:
      "A 6.6-inch Super AMOLED screen, a 50MP OIS camera and a 5,000mAh battery that comfortably lasts a full day. The Galaxy A55 5G is a dependable daily driver for work, content and everything in between.\n\nSealed local unit with a 12-month Samsung Kenya warranty. Colour subject to stock.",
    images: [
      img('photo-1511707171634-5f897ff02aa9'),
      img('photo-1592750475338-74b7b21085ab'),
      img('photo-1580910051074-3eb694886505'),
    ],
    variants: ['Awesome Navy', 'Awesome Iceblue', 'Awesome Lilac'],
    tags: ['5G', 'Samsung', 'Dual SIM'],
  },
  {
    slug: 'iphone-13-128gb-refurbished',
    seller: 'technest',
    category: 'smartphones',
    brand: 'Apple',
    title: 'iPhone 13 128GB (Certified Refurbished)',
    price: 6250000,
    compareAt: 7400000,
    stock: 8,
    rating: 4.5,
    ratingCount: 94,
    sold: 148,
    sponsoredDays: 6,
    addedDaysAgo: 14,
    description:
      'Certified refurbished iPhone 13 with at least 89% battery health, 128GB storage and a 12-month seller warranty. Each unit passes a 42-point inspection, is cleaned, and ships with a new cable.\n\nA18 chip performance, a bright 6.1-inch OLED display and a dual 12MP camera system at a friendlier price.',
    images: [
      img('photo-1592750475338-74b7b21085ab'),
      img('photo-1511707171634-5f897ff02aa9'),
    ],
    variants: ['Midnight', 'Starlight', 'Blue'],
    tags: ['Refurbished', 'iOS', '128GB'],
  },
  {
    slug: 'oraimo-freepods-4-anc',
    seller: 'technest',
    category: 'audio',
    brand: 'Oraimo',
    title: 'Oraimo FreePods 4 ANC Earbuds',
    price: 349900,
    compareAt: 499900,
    stock: 60,
    rating: 4.4,
    ratingCount: 240,
    sold: 512,
    addedDaysAgo: 48,
    description:
      'Adaptive noise cancellation, four-mic calls and up to 35.5 hours of playback with the charging case. IPX5 sweat resistance makes these a reliable pick for commutes and workouts.\n\nIncludes USB-C cable and three ear-tip sizes.',
    images: [
      img('photo-1590658268037-6bf12165a8df'),
      img('photo-1606220945770-b5b6c2c55bf1'),
    ],
    tags: ['ANC', 'Bluetooth 5.3', 'Water resistant'],
  },
  {
    slug: 'sony-wh-ch720n-headphones',
    seller: 'technest',
    category: 'audio',
    brand: 'Sony',
    title: 'Sony WH-CH720N Noise Cancelling Headphones',
    price: 1299900,
    compareAt: 1599900,
    stock: 18,
    rating: 4.6,
    ratingCount: 118,
    sold: 201,
    addedDaysAgo: 30,
    description:
      'Lightweight over-ear noise cancellation with up to 50 hours of battery and multipoint pairing. Tune the EQ in the Sony Headphones app and take clear calls with beamforming microphones.\n\nFoldable design, USB-C charging and a 3.5mm cable included.',
    images: [
      img('photo-1505740420928-5e560c06d30e'),
      img('photo-1583394838336-acd977736f90'),
    ],
    tags: ['Noise cancelling', '50h battery'],
  },
  {
    slug: 'hp-pavilion-14-core-i5',
    seller: 'technest',
    category: 'laptops',
    brand: 'HP',
    title: 'HP Pavilion 14 — Core i5, 8GB, 512GB SSD',
    price: 7499900,
    compareAt: 8200000,
    stock: 6,
    rating: 4.5,
    ratingCount: 62,
    sold: 88,
    addedDaysAgo: 38,
    description:
      'A 14-inch FHD IPS laptop with a 13th-gen Intel Core i5, 8GB RAM and a 512GB NVMe SSD. The backlit keyboard, fingerprint reader and 1.4kg chassis make it a comfortable daily commuter.\n\nWindows 11 Home pre-installed, with a 12-month HP warranty.',
    images: [
      img('photo-1496181133206-80ce9b88a853'),
      img('photo-1517336714731-489689fd1ca8'),
    ],
    tags: ['Laptop', 'Windows 11', 'SSD'],
  },
  {
    slug: 'ps5-dualsense-controller',
    seller: 'technest',
    category: 'gaming',
    brand: 'Sony',
    title: 'PS5 DualSense Wireless Controller',
    price: 899900,
    stock: 15,
    rating: 4.7,
    ratingCount: 144,
    sold: 267,
    addedDaysAgo: 55,
    description:
      'Haptic feedback, adaptive triggers and a built-in microphone in an official Sony controller. Works with PlayStation 5 and PC, with USB-C charging and up to 12 hours of play.',
    images: [img('photo-1606144042614-b2417e99c4e3'), img('photo-1606813907291-d86efa9b94db')],
    tags: ['PS5', 'Official'],
  },
  {
    slug: 'jbl-flip-6-speaker',
    seller: 'technest',
    category: 'audio',
    brand: 'JBL',
    title: 'JBL Flip 6 Portable Speaker',
    price: 1450000,
    compareAt: 1700000,
    stock: 22,
    rating: 4.6,
    ratingCount: 203,
    sold: 332,
    addedDaysAgo: 70,
    description:
      'Bold JBL Pro Sound in a bottle-sized body. IP67 waterproof, 12 hours of playtime and PartyBoost pairing for bigger sound wherever you are.\n\nIncludes USB-C cable and a woven carry strap.',
    images: [img('photo-1545454675-3531b543be5d'), img('photo-1608043152269-423dbba4e7e1')],
    tags: ['Waterproof', 'Bluetooth'],
  },
  {
    slug: 'vitron-43-inch-smart-tv',
    seller: 'technest',
    category: 'tvs-displays',
    brand: 'Vitron',
    title: 'Vitron 43" Full HD Smart TV',
    price: 2499900,
    compareAt: 2999900,
    stock: 12,
    rating: 4.3,
    ratingCount: 83,
    sold: 154,
    addedDaysAgo: 45,
    description:
      'A 43-inch Full HD smart display with Android TV, built-in Wi-Fi and two HDMI ports. The frameless design and 2-year local warranty make it a solid family TV.\n\nNetflix and YouTube ready; wall bracket sold separately.',
    images: [img('photo-1593359677879-a4bb92f829d1'), img('photo-1461151304267-38535e780c79')],
    tags: ['Smart TV', 'Android TV'],
  },
  {
    slug: 'anker-powercore-20000',
    seller: 'technest',
    category: 'phone-accessories',
    brand: 'Anker',
    title: 'Anker PowerCore 20,000mAh Power Bank',
    price: 499900,
    compareAt: 649900,
    stock: 40,
    rating: 4.7,
    ratingCount: 320,
    sold: 610,
    addedDaysAgo: 90,
    description:
      'A 20,000mAh battery with 22.5W fast charging and PowerIQ. Charges most phones up to four times and includes a USB-C cable.\n\nAirline safe and backed by Anker’s 18-month warranty.',
    images: [img('photo-1609091839311-d5365f9ff1c5'), img('photo-1583863788434-e58a36330cf0')],
    tags: ['20,000mAh', 'Fast charge'],
  },
  {
    slug: 'xiaomi-redmi-pad-se',
    seller: 'technest',
    category: 'tablets',
    brand: 'Xiaomi',
    title: 'Xiaomi Redmi Pad SE — 128GB',
    price: 3199900,
    stock: 14,
    rating: 4.4,
    ratingCount: 57,
    sold: 76,
    addedDaysAgo: 17,
    description:
      'An 11-inch 90Hz display, Snapdragon 680 and an 8,000mAh battery. Light enough for reading, big enough for series and class notes.\n\nIncludes charger and a one-year Xiaomi Kenya warranty.',
    images: [img('photo-1544244015-0df4b3ffc6b0'), img('photo-1585790050230-5dd28404ccb9')],
    tags: ['Tablet', '90Hz'],
  },
  {
    slug: 'philips-airfryer-4l',
    seller: 'technest',
    category: 'small-appliances',
    brand: 'Philips',
    title: 'Philips 4.1L Air Fryer',
    price: 1399900,
    compareAt: 1599900,
    stock: 9,
    rating: 4.5,
    ratingCount: 71,
    sold: 102,
    addedDaysAgo: 52,
    description:
      'Rapid Air basket, 13-in-1 presets and dishwasher-safe parts. Crisp chips and golden chicken with up to 90% less oil.\n\n1,400W, 4.1L capacity — comfortably feeds a family of four.',
    images: [img('photo-1585515320310-259814833e62'), img('photo-1556911220-bff31c812dba')],
    tags: ['Kitchen', 'Air fryer'],
  },
  {
    slug: 'mika-20l-microwave',
    seller: 'technest',
    category: 'small-appliances',
    brand: 'Mika',
    title: 'Mika 20L Solo Microwave',
    price: 1049900,
    stock: 10,
    rating: 4.2,
    ratingCount: 38,
    sold: 61,
    addedDaysAgo: 64,
    description:
      'A compact 20L solo microwave with five power levels, a 35-minute timer and a child lock. Fits neatly on a kitchen counter.\n\nLocal two-pin plug and a one-year warranty.',
    images: [img('photo-1585659722983-3a675dabf23d'), img('photo-1574269909862-7e1d70bb8078')],
    tags: ['Microwave', 'Kitchen'],
  },
  {
    slug: 'everyday-linen-shirt',
    seller: 'soko',
    category: 'mens-fashion',
    brand: 'Soko Yard',
    title: 'Everyday Linen Camp Shirt',
    price: 289900,
    compareAt: 380000,
    stock: 45,
    rating: 4.4,
    ratingCount: 76,
    sold: 184,
    addedDaysAgo: 12,
    description:
      'Breathable 100% linen with a relaxed camp collar and mother-of-pearl buttons. Cut for easy weekends in Nairobi heat and pre-washed for softness.\n\nMade in Nairobi in small batches. Model is 183cm, wearing size M.',
    images: [
      img('photo-1596755094514-f87e34085b2c'),
      img('photo-1602810318383-e386cc2a3ccf'),
    ],
    variants: ['S', 'M', 'L', 'XL'],
    tags: ['Linen', 'Made in Kenya'],
  },
  {
    slug: 'ankara-wrap-midi-dress',
    seller: 'soko',
    category: 'womens-fashion',
    brand: 'Soko Yard',
    title: 'Ankara Wrap Midi Dress',
    price: 450000,
    compareAt: 520000,
    stock: 28,
    rating: 4.8,
    ratingCount: 132,
    sold: 246,
    featured: true,
    addedDaysAgo: 8,
    description:
      'A hand-tailored wrap midi in vivid African wax print, with a self-tie waist and deep pockets. Made in Nairobi in small batches, each dress has a slightly different print placement.\n\nCut for a relaxed fit; true to size.',
    images: [
      img('photo-1595777457583-95e059d581b8'),
      img('photo-1496747611176-843222e1e57c'),
    ],
    variants: ['S', 'M', 'L', 'XL'],
    tags: ['Ankara', 'Handmade', 'Pockets'],
  },
  {
    slug: 'leather-tote-bag',
    seller: 'soko',
    category: 'bags',
    brand: 'Soko Yard',
    title: 'Full-Grain Leather Tote',
    price: 699900,
    compareAt: 850000,
    stock: 17,
    rating: 4.6,
    ratingCount: 48,
    sold: 73,
    addedDaysAgo: 34,
    description:
      'A full-grain leather tote with a suede-lined interior, padded laptop sleeve and magnetic closure. Fits a 14-inch laptop, a water bottle and the rest of your day.\n\nVegetable-tanned locally; the leather deepens in colour with use.',
    images: [img('photo-1548036328-c9fa89d128fa'), img('photo-1590874103328-eac38a683ce7')],
    tags: ['Leather', 'Laptop bag'],
  },
  {
    slug: 'cloudstep-running-sneakers',
    seller: 'soko',
    category: 'shoes',
    brand: 'Cloudstep',
    title: 'Cloudstep Everyday Running Sneakers',
    price: 549900,
    compareAt: 720000,
    stock: 32,
    rating: 4.5,
    ratingCount: 158,
    sold: 298,
    addedDaysAgo: 6,
    description:
      'A knit upper, cushioned EVA midsole and grippy outsole for daily runs and long walks. Unisex fit, true to size.\n\nWe recommend sizing up half a size if you have wide feet.',
    images: [img('photo-1542291026-7eec264c27ff'), img('photo-1560343090-f0409e92791a')],
    variants: ['39', '40', '41', '42', '43', '44'],
    tags: ['Running', 'Unisex'],
  },
  {
    slug: 'oversized-denim-jacket',
    seller: 'soko',
    category: 'womens-fashion',
    brand: 'Soko Yard',
    title: 'Oversized Washed Denim Jacket',
    price: 420000,
    stock: 21,
    rating: 4.3,
    ratingCount: 41,
    sold: 86,
    addedDaysAgo: 26,
    description:
      'Washed rigid denim with a boxy cut, dropped shoulders and two chest pockets. An easy layer over tees and dresses.\n\nUnisex fit. Machine wash cold, inside out.',
    images: [img('photo-1551537482-f2075a1d41f2'), img('photo-1543076447-215ad9ba6923')],
    variants: ['S', 'M', 'L', 'XL'],
    tags: ['Denim', 'Unisex'],
  },
  {
    slug: 'maasai-beaded-sandals',
    seller: 'soko',
    category: 'shoes',
    brand: 'Soko Yard',
    title: 'Maasai Beaded Leather Sandals',
    price: 230000,
    stock: 36,
    rating: 4.7,
    ratingCount: 89,
    sold: 167,
    addedDaysAgo: 40,
    description:
      'Hand-beaded leather sandals made by artisans in Kajiado, with a cushioned footbed and an adjustable ankle strap. Each pair takes about a day to bead.\n\nNatural leather may soften and darken with wear.',
    images: [img('photo-1603487742131-4160ec999306'), img('photo-1562183241-b937e95585b6')],
    variants: ['37', '38', '39', '40', '41', '42'],
    tags: ['Handmade', 'Leather'],
  },
  {
    slug: 'ceramic-pour-over-set',
    seller: 'soko',
    category: 'kitchen-dining',
    brand: 'Soko Yard',
    title: 'Stoneware Pour-Over Coffee Set',
    price: 385000,
    stock: 12,
    rating: 4.6,
    ratingCount: 33,
    sold: 54,
    addedDaysAgo: 29,
    description:
      'A stoneware dripper, 600ml server and two cups with a matte glaze. Brews two generous cups at a time and is dishwasher safe.\n\nSmall variations in glaze make each set unique.',
    images: [img('photo-1610701596007-11502861dcfa'), img('photo-1495474472287-4d71bcdd2085')],
    tags: ['Coffee', 'Stoneware'],
  },
  {
    slug: 'yoga-mat-block-set',
    seller: 'soko',
    category: 'fitness',
    brand: 'Soko Yard',
    title: 'Yoga Mat & Cork Block Set',
    price: 270000,
    compareAt: 320000,
    stock: 40,
    rating: 4.5,
    ratingCount: 52,
    sold: 97,
    addedDaysAgo: 19,
    description:
      'A 6mm non-slip TPE mat with alignment lines, two cork blocks and a cotton carry strap. Wipe clean after practice.\n\nMat measures 183 x 61cm and weighs 900g.',
    images: [img('photo-1544367567-0f2fcb009e0b'), img('photo-1518611012118-696072aa579a')],
    tags: ['Yoga', 'Non-slip'],
  },
  {
    slug: 'harlequins-rugby-jersey',
    seller: 'soko',
    category: 'sportswear',
    brand: 'Soko Yard',
    title: 'Kenya Harlequins Supporter Jersey',
    price: 350000,
    stock: 25,
    rating: 4.4,
    ratingCount: 28,
    sold: 64,
    addedDaysAgo: 57,
    description:
      'An official Kenya Harlequins supporter jersey in breathable performance fabric. Relaxed fit with contrast trim and an embroidered crest.\n\nMade for match days and everything after.',
    images: [img('photo-1576566588028-4147f3842f27'), img('photo-1518091043644-c1d4457512c6')],
    variants: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['Rugby', 'Official'],
  },
  {
    slug: 'organic-baby-onesie-3pack',
    seller: 'soko',
    category: 'baby-gear',
    brand: 'Soko Yard',
    title: 'Organic Cotton Baby Onesie — 3 Pack',
    price: 265000,
    stock: 30,
    rating: 4.7,
    ratingCount: 64,
    sold: 119,
    addedDaysAgo: 16,
    description:
      'Three GOTS-certified organic cotton bodysuits with snap closures and mitten cuffs. Gentle on newborn skin and softens with every wash.\n\nSizes run true; machine wash at 30°C.',
    images: [img('photo-1522771930-78848d9293e8'), img('photo-1519689680058-324335c77eba')],
    variants: ['0–3m', '3–6m', '6–9m', '9–12m'],
    tags: ['Organic', 'Baby'],
  },
  {
    slug: 'wooden-stacking-blocks',
    seller: 'soko',
    category: 'toys',
    brand: 'Soko Yard',
    title: 'Wooden Stacking Blocks Set',
    price: 190000,
    stock: 26,
    rating: 4.5,
    ratingCount: 36,
    sold: 72,
    addedDaysAgo: 23,
    description:
      'Twelve smooth-sanded wooden blocks in a cotton bag, painted with non-toxic water-based colours. Builds motor skills through open-ended play.\n\nRecommended for ages 12 months and up.',
    images: [img('photo-1596461404969-9ae70f2830c1'), img('photo-1558877385-81a1c7e67d72')],
    tags: ['Wooden', 'Toddler'],
  },
  {
    slug: 'linen-sofa-3-seater',
    seller: 'zawadi',
    category: 'furniture',
    brand: 'Zawadi',
    title: 'Linen Blend 3-Seater Sofa',
    price: 8600000,
    compareAt: 9900000,
    stock: 4,
    rating: 4.6,
    ratingCount: 27,
    sold: 41,
    featured: true,
    addedDaysAgo: 41,
    description:
      'A deep three-seater in a stain-resistant linen blend with feather-wrapped cushions and a solid hardwood frame. Assembled in Nairobi and delivered within the city.\n\nChoose from sand or olive. Delivery to other counties is quoted separately.',
    images: [img('photo-1555041469-a586c61ea9bc'), img('photo-1493663284031-b7e3aefcae8e')],
    variants: ['Sand', 'Olive'],
    tags: ['Handmade', 'Living room'],
  },
  {
    slug: 'handwoven-sisal-basket',
    seller: 'zawadi',
    category: 'decor',
    brand: 'Zawadi',
    title: 'Handwoven Sisal Storage Basket',
    price: 240000,
    stock: 18,
    rating: 4.8,
    ratingCount: 45,
    sold: 81,
    addedDaysAgo: 11,
    description:
      'A handwoven sisal basket with leather handles, made by weavers in Machakos. Use it for laundry, plants or a very stylish toy bin.\n\nApproximately 40cm wide and 35cm tall; each basket varies slightly.',
    images: [img('photo-1587300003388-59208cc962cb'), img('photo-1616486338812-3dadae4b4ace')],
    tags: ['Handmade', 'Storage'],
  },
  {
    slug: 'brass-table-lamp',
    seller: 'zawadi',
    category: 'decor',
    brand: 'Zawadi',
    title: 'Brass Table Lamp with Linen Shade',
    price: 590000,
    stock: 11,
    rating: 4.5,
    ratingCount: 19,
    sold: 37,
    addedDaysAgo: 35,
    description:
      'A brushed brass table lamp with a linen shade and an inline dimmer. Warm, diffused light for reading corners and bedside tables.\n\nIncludes an E27 LED bulb; wipe with a dry cloth.',
    images: [img('photo-1507473885765-e6ed057f782c'), img('photo-1540932239986-30128078f3c5')],
    tags: ['Lighting', 'Brass'],
  },
  {
    slug: 'cotton-percale-bedsheet-set',
    seller: 'zawadi',
    category: 'bedding',
    brand: 'Zawadi',
    title: '400-Thread-Count Cotton Bedsheet Set',
    price: 475000,
    compareAt: 560000,
    stock: 20,
    rating: 4.7,
    ratingCount: 58,
    sold: 112,
    addedDaysAgo: 9,
    description:
      'Crisp cotton percale in a sateen finish. The set includes a flat sheet, a fitted sheet and two pillowcases, all stitched and packed in Nairobi.\n\nSoftens with every wash; fits mattresses up to 30cm deep.',
    images: [img('photo-1522771739844-6a9f6d5f14af'), img('photo-1616627561950-9f746e330187')],
    variants: ['Queen', 'King'],
    tags: ['Cotton', 'Sateen'],
  },
  {
    slug: 'acacia-serving-board',
    seller: 'zawadi',
    category: 'kitchen-dining',
    brand: 'Zawadi',
    title: 'Acacia Wood Serving Board',
    price: 185000,
    stock: 24,
    rating: 4.4,
    ratingCount: 22,
    sold: 49,
    addedDaysAgo: 50,
    description:
      'A solid acacia serving board with a food-safe oil finish. Doubles as a bread board or a styling piece for the kitchen counter.\n\nHand wash and re-oil occasionally to keep it looking its best.',
    images: [img('photo-1607305387299-a3d9611cd469'), img('photo-1556911220-bff31c812dba')],
    tags: ['Wood', 'Kitchen'],
  },
  {
    slug: 'terracotta-planter-trio',
    seller: 'zawadi',
    category: 'decor',
    brand: 'Zawadi',
    title: 'Terracotta Planter Trio',
    price: 320000,
    stock: 15,
    rating: 4.6,
    ratingCount: 31,
    sold: 58,
    addedDaysAgo: 5,
    description:
      'A set of three unglazed terracotta planters with drainage trays. Each has subtle colour variations from the kiln.\n\nSizes: 12cm, 16cm and 20cm diameter. Plants not included.',
    images: [img('photo-1485955900006-10f4d324d411'), img('photo-1459156212016-c812468e2115')],
    tags: ['Plants', 'Terracotta'],
  },
  {
    slug: 'beaded-wall-mirror',
    seller: 'zawadi',
    category: 'decor',
    brand: 'Zawadi',
    title: 'Hand-Beaded Round Wall Mirror',
    price: 410000,
    stock: 9,
    rating: 4.7,
    ratingCount: 16,
    sold: 29,
    addedDaysAgo: 27,
    description:
      'A hand-beaded wall mirror with a warm brass frame. Comes ready to hang and wipes clean with a soft cloth.\n\n50cm diameter, with a subtle handmade texture around the rim.',
    images: [img('photo-1618221195710-dd6b41faaea6'), img('photo-1616486338812-3dadae4b4ace')],
    tags: ['Mirror', 'Handmade'],
  },
  {
    slug: 'jogoo-maize-flour-2kg',
    seller: 'mavuno',
    category: 'pantry',
    brand: 'Jogoo',
    title: 'Jogoo Maize Flour 2kg',
    price: 21500,
    stock: 120,
    rating: 4.6,
    ratingCount: 412,
    sold: 1240,
    addedDaysAgo: 76,
    description:
      'Premium sifted maize flour, 2kg. Makes smooth, dependable ugali every time.\n\nSealed pack; store in a cool, dry place.',
    images: [img('photo-1586201375761-83865001e31c'), img('photo-1542838132-92c53300491e')],
    tags: ['Ugali', 'Staples'],
  },
  {
    slug: 'fresh-avocados-1kg',
    seller: 'mavuno',
    category: 'fresh-produce',
    brand: 'Mavuno Farms',
    title: 'Fresh Hass Avocados — 1kg',
    price: 18000,
    stock: 50,
    rating: 4.5,
    ratingCount: 88,
    sold: 320,
    addedDaysAgo: 4,
    description:
      'Creamy Hass avocados from Murang’a, hand-picked this week. Sold as a 1kg pack — about four to five fruits.\n\nRipen at room temperature and refrigerate once soft.',
    images: [img('photo-1523049673857-eb18f1d7b578'), img('photo-1610832958506-aa56368176cf')],
    tags: ['Fresh', 'Hass'],
  },
  {
    slug: 'kenyan-aa-coffee-500g',
    seller: 'mavuno',
    category: 'beverages',
    brand: 'Mavuno Roasters',
    title: 'Kenyan AA Coffee Beans — 500g',
    price: 125000,
    compareAt: 145000,
    stock: 40,
    rating: 4.8,
    ratingCount: 96,
    sold: 214,
    featured: true,
    addedDaysAgo: 20,
    description:
      'Single-origin Kenyan AA from Nyeri, medium roast. Notes of blackcurrant, citrus and cane sugar, roasted in small batches in Nairobi.\n\n500g whole bean. Grind fresh; we recommend a medium grind for pour-over.',
    images: [img('photo-1447933601403-0c6688de566e'), img('photo-1495474472287-4d71bcdd2085')],
    tags: ['Single origin', 'Nyeri'],
  },
  {
    slug: 'pure-sunflower-oil-5l',
    seller: 'mavuno',
    category: 'pantry',
    brand: 'Fresh Fry',
    title: 'Pure Sunflower Oil — 5L',
    price: 145000,
    stock: 35,
    rating: 4.4,
    ratingCount: 74,
    sold: 198,
    addedDaysAgo: 62,
    description:
      'Cold-pressed sunflower oil in a 5L jerrycan. Light taste with a high smoke point, suitable for everyday cooking and frying.\n\nStore away from direct sunlight.',
    images: [img('photo-1474979266404-7eaacbcd87c5'), img('photo-1542838132-92c53300491e')],
    tags: ['Cooking oil', '5L'],
  },
  {
    slug: 'mixed-fruit-basket',
    seller: 'mavuno',
    category: 'fresh-produce',
    brand: 'Mavuno Farms',
    title: 'Seasonal Mixed Fruit Basket',
    price: 220000,
    stock: 15,
    rating: 4.6,
    ratingCount: 44,
    sold: 93,
    addedDaysAgo: 7,
    description:
      'A hand-packed basket with pineapple, mango, banana, oranges and passion fruit. Contents change with what is best at the market that week.\n\nA thoughtful gift for a new home, a host or a very good week.',
    images: [img('photo-1610832958506-aa56368176cf'), img('photo-1542838132-92c53300491e')],
    tags: ['Fruit', 'Gift'],
  },
  {
    slug: 'omena-dried-fish-500g',
    seller: 'mavuno',
    category: 'pantry',
    brand: 'Mavuno',
    title: 'Omena Dried Silver Fish — 500g',
    price: 65000,
    stock: 28,
    rating: 4.3,
    ratingCount: 27,
    sold: 61,
    addedDaysAgo: 44,
    description:
      'Sun-dried silver fish from Lake Victoria, cleaned and packed in 500g portions. Rich in protein and full of flavour.\n\nRinse before cooking; store sealed in a cool place.',
    images: [img('photo-1534043464124-3be32fe000c9'), img('photo-1544943910-4c1dc44aab44')],
    tags: ['Omena', 'Protein'],
  },
  {
    slug: 'niacinamide-glow-serum',
    seller: 'glow',
    category: 'skincare',
    brand: 'Glow Lab',
    title: 'Niacinamide 10% Glow Serum',
    price: 185000,
    compareAt: 210000,
    stock: 44,
    rating: 4.7,
    ratingCount: 204,
    sold: 356,
    featured: true,
    sponsoredDays: 9,
    addedDaysAgo: 13,
    description:
      '10% niacinamide with zinc PCA to refine pores and even tone. Lightweight, fragrance-free and suitable for oily or combination skin.\n\nUse morning and evening before moisturiser. Patch test first; use sunscreen during the day.',
    images: [img('photo-1620916566398-39f1143ab7be'), img('photo-1556228720-195a672e8a03')],
    tags: ['Niacinamide', 'Fragrance-free'],
  },
  {
    slug: 'shea-butter-body-cream',
    seller: 'glow',
    category: 'personal-care',
    brand: 'Glow Lab',
    title: 'Whipped Shea Butter Body Cream',
    price: 145000,
    stock: 52,
    rating: 4.6,
    ratingCount: 67,
    sold: 143,
    addedDaysAgo: 33,
    description:
      'Whipped shea butter with vitamin E and cocoa butter. Deep hydration for dry skin, elbows and heels, without a heavy feel.\n\nMade in small batches in Nairobi. 250ml jar.',
    images: [img('photo-1608571423902-eed4a5ad8108'), img('photo-1556228578-8c89e6adf883')],
    tags: ['Shea', 'Dry skin'],
  },
  {
    slug: 'matte-lipstick-set',
    seller: 'glow',
    category: 'makeup',
    brand: 'Glow Lab',
    title: 'Matte Lipstick Set — 4 Shades',
    price: 220000,
    stock: 23,
    rating: 4.5,
    ratingCount: 79,
    sold: 156,
    addedDaysAgo: 24,
    description:
      'Four creamy matte shades that wear comfortably through the day, enriched with jojoba oil. Cruelty-free and suited to warm, deep skin tones.\n\nSet includes Rosewood, Brick, Cocoa and Cranberry.',
    images: [img('photo-1586495777744-4413f21062fa'), img('photo-1596462502278-27bfdc403348')],
    tags: ['Matte', 'Cruelty-free'],
  },
  {
    slug: 'cedar-amber-perfume-50ml',
    seller: 'glow',
    category: 'fragrance',
    brand: 'Glow Lab',
    title: 'Cedar & Amber Eau de Parfum — 50ml',
    price: 490000,
    stock: 16,
    rating: 4.7,
    ratingCount: 39,
    sold: 68,
    addedDaysAgo: 46,
    description:
      'Cedar, amber and a whisper of cardamom. A warm unisex scent with eight-plus hours of wear, blended in Nairobi.\n\n50ml eau de parfum in a refillable glass bottle.',
    images: [img('photo-1541643600914-78b084683601'), img('photo-1585386959984-a4155224a1ad')],
    tags: ['Unisex', 'Amber'],
  },
  {
    slug: 'aloe-mint-face-wash',
    seller: 'glow',
    category: 'skincare',
    brand: 'Glow Lab',
    title: 'Aloe & Mint Gel Face Wash',
    price: 95000,
    stock: 60,
    rating: 4.4,
    ratingCount: 113,
    sold: 287,
    addedDaysAgo: 37,
    description:
      'A gentle gel cleanser with aloe and mint that removes sunscreen and city dust without stripping. pH balanced for daily use.\n\n150ml. Follow with moisturiser and SPF.',
    images: [img('photo-1556228578-8c89e6adf883'), img('photo-1571781926291-c477ebfd024b')],
    tags: ['Gentle', 'Daily'],
  },
  {
    slug: 'spf50-sunscreen-gel',
    seller: 'glow',
    category: 'skincare',
    brand: 'Glow Lab',
    title: 'Invisible SPF 50 Sunscreen Gel',
    price: 170000,
    stock: 48,
    rating: 4.6,
    ratingCount: 91,
    sold: 192,
    addedDaysAgo: 15,
    description:
      'A broad-spectrum SPF 50 gel that dries down clear on melanin-rich skin. No white cast, no sticky finish.\n\n50ml. Reapply every two hours when outdoors.',
    images: [img('photo-1556228720-195a672e8a03'), img('photo-1570194065650-d99fb4bedf0a')],
    tags: ['SPF 50', 'No white cast'],
  },
  {
    slug: 'adventure-mountain-bike-275',
    seller: 'kilimani',
    category: 'outdoor',
    brand: 'Kilimani Bikes',
    title: 'Adventure Mountain Bike 27.5"',
    price: 3850000,
    stock: 5,
    rating: 0,
    ratingCount: 0,
    sold: 0,
    status: 'pending',
    addedDaysAgo: 2,
    description:
      'A 27.5-inch adventure hardtail with a 21-speed drivetrain, hydraulic disc brakes and a light alloy frame. Assembly and first service included in Nairobi.\n\nNew seller listing awaiting Martify review.',
    images: [img('photo-1485965120184-e220f721d03e'), img('photo-1571068316344-75bc76f77890')],
    tags: ['Bike', '27.5"'],
  },
  {
    slug: 'bike-helmet-light-set',
    seller: 'kilimani',
    category: 'outdoor',
    brand: 'Kilimani Bikes',
    title: 'Cycling Helmet & USB Light Set',
    price: 390000,
    stock: 12,
    rating: 0,
    ratingCount: 0,
    sold: 0,
    status: 'pending',
    addedDaysAgo: 2,
    description:
      'An adult cycling helmet with 18 vents and an adjustable dial fit, plus USB-rechargeable front and rear lights. New listing awaiting Martify review.',
    images: [img('photo-1557689553-7b9d8ad3d9c1'), img('photo-1485965120184-e220f721d03e')],
    tags: ['Safety', 'Cycling'],
  },
  {
    slug: 'hand-beaded-leather-cuff',
    seller: 'soko',
    category: 'womens-fashion',
    brand: 'Soko Yard',
    title: 'Hand-Beaded Leather Cuff',
    price: 120000,
    stock: 20,
    rating: 0,
    ratingCount: 0,
    sold: 0,
    status: 'pending',
    addedDaysAgo: 1,
    description:
      'A hand-beaded leather cuff in Maasai colourways with an adjustable brass clasp. Made by our partner workshop in Kajiado. Awaiting review.',
    images: [img('photo-1611652022419-a9419f74343d'), img('photo-1535632066927-ab7c9ab60908')],
    tags: ['Handmade', 'Accessories'],
  },
];

const reviewSeeds = [
  ['samsung-galaxy-a55-5g-256gb', 'grace', 5, 'Battery genuinely lasts two days', 'Upgraded from an A32 and the difference is huge. Screen is bright outdoors and the camera handles evening photos well. Sealed box, delivered in two days.', 10, true],
  ['sony-wh-ch720n-headphones', 'peter', 5, 'Quiet commute, finally', 'The noise cancelling handles the Thika Road matatu noise surprisingly well. Battery is still on 60% after a week of use.', 8, false],
  ['oraimo-freepods-4-anc', 'brianC', 4, 'Very good for the price', 'Sound is clean and calls are clear. The case scratches easily, but at this price I am not complaining.', 12, false],
  ['iphone-13-128gb-refurbished', 'achieng', 4, 'Looks new, battery at 91%', 'Arrived well packed with a new cable. Took a day to set up but it has been flawless since. Honest refurb description.', 6, false],
  ['cloudstep-running-sneakers', 'grace', 5, 'My new daily trainers', 'Cushioning is great for 5Ks on pavement and they look good with jeans. True to size for me.', 4, true],
  ['ankara-wrap-midi-dress', 'achieng', 5, 'The pockets!', 'Beautiful print and the wrap fit is flattering. Wore it to a wedding and got so many compliments. Local tailoring is excellent.', 3, true],
  ['linen-sofa-3-seater', 'peter', 4, 'Worth the wait', 'Delivery guys assembled it and took away the packaging. Colour is slightly warmer than the photos, but we love it.', 11, false],
  ['niacinamide-glow-serum', 'grace', 5, 'Calmed my breakouts', 'Three weeks in and my forehead is noticeably clearer. No irritation, and it layers well under sunscreen.', 5, true],
  ['cedar-amber-perfume-50ml', 'demo', 5, 'Warm, not overpowering', 'This has become my signature. It smells expensive and lasts through a full workday. The refillable bottle is a nice touch.', 9, false],
  ['kenyan-aa-coffee-500g', 'demo', 5, 'Fresh and bright', 'Roast date was a week before delivery. Blackcurrant notes really come through in a pour-over. Reordering today.', 7, false],
  ['philips-airfryer-4l', 'achieng', 4, 'Weeknight dinners sorted', 'Chips come out crisp and the basket is easy to clean. It is bigger than I pictured, but worth the counter space.', 14, false],
  ['cotton-percale-bedsheet-set', 'demo', 5, 'Crisp and cool', 'Washed them twice and they are already softer. Fits our deep mattress properly, which is rare.', 2, false],
  ['leather-tote-bag', 'grace', 5, 'Beautiful leather', 'Carries my 14-inch laptop and everything else. The suede lining is a lovely detail. It smells like proper leather.', 13, false],
  ['vitron-43-inch-smart-tv', 'peter', 4, 'Good value smart TV', 'Setup took ten minutes and the picture is solid for the price. Sound is average, so I added a soundbar.', 16, false],
  ['jbl-flip-6-speaker', 'brianC', 5, 'Loud and tough', 'Took it to the beach, got splashed, still works perfectly. Bass is impressive for the size.', 6, false],
  ['aloe-mint-face-wash', 'achieng', 4, 'Gentle but effective', 'Does not leave my face tight after washing, and it removes sunscreen well. The mint smell is subtle.', 5, false],
  ['organic-baby-onesie-3pack', 'grace', 5, 'Softest baby clothes', 'Bought these for my niece. The cotton is genuinely soft and the snap closures are sturdy.', 3, false],
  ['anker-powercore-20000', 'peter', 5, 'Charges everything', 'Took it on a three-day trip and never worried about a socket. Fast charges my phone and earbuds.', 12, false],
];

const orderSeeds = [
  {
    number: 'MFT-100041',
    user: 'demo',
    name: 'Aisha Mwangi',
    email: 'demo@martify.co.ke',
    phone: '+254712345678',
    daysAgo: 18,
    status: 'delivered',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    delivery: 'door',
    coupon: 'WELCOME10',
    items: [
      ['samsung-galaxy-a55-5g-256gb', 1],
      ['anker-powercore-20000', 2],
    ],
  },
  {
    number: 'MFT-100042',
    user: 'demo',
    name: 'Aisha Mwangi',
    email: 'demo@martify.co.ke',
    phone: '+254712345678',
    daysAgo: 5,
    status: 'shipped',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    delivery: 'express',
    items: [
      ['everyday-linen-shirt', 2],
      ['cloudstep-running-sneakers', 1],
    ],
  },
  {
    number: 'MFT-100043',
    user: 'grace',
    name: 'Grace Wanjiru',
    email: 'grace.wanjiru@example.com',
    phone: '+254722111222',
    daysAgo: 12,
    status: 'delivered',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    delivery: 'door',
    items: [['linen-sofa-3-seater', 1]],
  },
  {
    number: 'MFT-100044',
    user: 'demo',
    name: 'Aisha Mwangi',
    email: 'demo@martify.co.ke',
    phone: '+254712345678',
    daysAgo: 2,
    status: 'confirmed',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    delivery: 'pickup',
    coupon: 'GLOW15',
    items: [
      ['niacinamide-glow-serum', 2],
      ['aloe-mint-face-wash', 1],
    ],
  },
  {
    number: 'MFT-100045',
    user: 'peter',
    name: 'Peter Otieno',
    email: 'peter.otieno@example.com',
    phone: '+254733444555',
    daysAgo: 8,
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    delivery: 'door',
    coupon: 'FREEDEL',
    items: [
      ['jogoo-maize-flour-2kg', 4],
      ['pure-sunflower-oil-5l', 1],
      ['fresh-avocados-1kg', 2],
      ['kenyan-aa-coffee-500g', 1],
    ],
  },
  {
    number: 'MFT-100046',
    user: 'demo',
    name: 'Aisha Mwangi',
    email: 'demo@martify.co.ke',
    phone: '+254712345678',
    daysAgo: 0,
    status: 'placed',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    delivery: 'express',
    items: [
      ['cotton-percale-bedsheet-set', 1],
      ['brass-table-lamp', 1],
    ],
  },
  {
    number: 'MFT-100047',
    userName: null,
    name: 'Njeri Mwangi',
    email: 'njeri.mwangi@example.com',
    phone: '+254701222333',
    daysAgo: 20,
    status: 'delivered',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    delivery: 'door',
    coupon: 'TECH500',
    items: [['vitron-43-inch-smart-tv', 1]],
  },
  {
    number: 'MFT-100048',
    user: 'brianC',
    name: 'Brian Kimani',
    email: 'brian.kimani@example.com',
    phone: '+254755666777',
    daysAgo: 1,
    status: 'confirmed',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    delivery: 'door',
    affiliateCode: 'MARTY-DEMO10',
    items: [
      ['ankara-wrap-midi-dress', 1],
      ['leather-tote-bag', 1],
    ],
  },
  {
    number: 'MFT-100049',
    user: 'demo',
    name: 'Aisha Mwangi',
    email: 'demo@martify.co.ke',
    phone: '+254712345678',
    daysAgo: 3,
    status: 'delivered',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    delivery: 'door',
    items: [
      ['kenyan-aa-coffee-500g', 1],
      ['fresh-avocados-1kg', 2],
    ],
  },
  {
    number: 'MFT-100050',
    user: 'peter',
    name: 'Peter Otieno',
    email: 'peter.otieno@example.com',
    phone: '+254733444555',
    daysAgo: 6,
    status: 'out_for_delivery',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    delivery: 'express',
    items: [['sony-wh-ch720n-headphones', 1]],
  },
];

const addressSeeds = [
  {
    user: 'demo',
    label: 'Home',
    recipient: 'Aisha Mwangi',
    phone: '+254712345678',
    county: 'Nairobi',
    town: 'Kilimani',
    line: 'Riverside Drive, Apt 4B',
    instructions: 'Call when you reach the gate.',
    isDefault: true,
  },
  {
    user: 'demo',
    label: 'Office',
    recipient: 'Aisha Mwangi',
    phone: '+254712345678',
    county: 'Nairobi',
    town: 'Westlands',
    line: 'Ring Road, 3rd floor, Suite 12',
    instructions: 'Reception will receive the parcel.',
    isDefault: false,
  },
  {
    user: 'grace',
    label: 'Home',
    recipient: 'Grace Wanjiru',
    phone: '+254722111222',
    county: 'Nairobi',
    town: 'Lavington',
    line: 'James Gichuru Road, House 14',
    instructions: '',
    isDefault: true,
  },
];

export async function seedDatabase(database) {
  const hashed = {
    customer: await bcrypt.hash(PASSWORD_CUSTOMER, 10),
    seller: await bcrypt.hash(PASSWORD_SELLER, 10),
    admin: await bcrypt.hash(PASSWORD_ADMIN, 10),
  };

  await database.tx(async (tx) => {
    const userIds = {};
    const sellerIds = {};
    const categoryIds = {};
    const productIds = {};

    await tx.query(
      `INSERT INTO platform_settings (key, value) VALUES ($1, $2::jsonb)`,
      [
        'platform',
        JSON.stringify({
          delivery_door_cents: 20000,
          delivery_pickup_cents: 10000,
          delivery_express_cents: 35000,
          free_delivery_threshold_cents: 500000,
          affiliate_commission_bps: AFFILIATE_COMMISSION_BPS,
          subscription_pro_cents: 250000,
          subscription_premium_cents: 600000,
          boost_7d_cents: 50000,
          boost_30d_cents: 150000,
          verification_cents: 500000,
          featured_store_cents: 1000000,
          support_email: 'hello@martify.co.ke',
          support_phone: '+254 700 000 000',
          announcement: 'Free door delivery on orders over KSh 5,000',
          demo_mode: true,
        }),
      ],
    );

    for (const user of userSeeds) {
      const id = randomUUID();
      userIds[user.key] = id;
      await tx.query(
        `INSERT INTO users
          (id, name, email, phone, password_hash, role, locale, referral_code, referred_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          user.name,
          user.email.toLowerCase(),
          user.phone,
          hashed[user.role === 'admin' ? 'admin' : user.role === 'seller' ? 'seller' : 'customer'],
          user.role,
          'en',
          user.referralCode ?? null,
          user.referredBy ?? null,
          daysAgo(user.daysAgo ?? 30),
        ],
      );
    }

    for (const seller of sellerSeeds) {
      const id = randomUUID();
      sellerIds[seller.key] = id;
      await tx.query(
        `INSERT INTO sellers
          (id, user_id, store_name, slug, tagline, description, logo_url, banner_url,
           location, county, status, verified, featured, subscription_tier,
           subscription_expires_at, payout_method, payout_destination, business_name,
           registration_number, tax_pin, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [
          id,
          userIds[seller.user],
          seller.storeName,
          seller.slug,
          seller.tagline,
          seller.description,
          seller.logoUrl ?? null,
          seller.bannerUrl ?? null,
          seller.location,
          seller.county,
          seller.status,
          seller.verified,
          seller.featured,
          seller.tier,
          seller.tierEndsInDays ? inDays(seller.tierEndsInDays) : null,
          seller.payoutMethod ?? null,
          seller.payoutDestination ?? null,
          seller.businessName,
          seller.registrationNumber,
          seller.taxPin,
          daysAgo(seller.tierStartedDaysAgo ?? 60),
        ],
      );
    }

    for (const parent of categoryTree) {
      const parentId = randomUUID();
      categoryIds[parent.slug] = parentId;
      await tx.query(
        `INSERT INTO categories (id, name, slug, icon, commission_bps, sort)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [parentId, parent.name, parent.slug, parent.icon, parent.commission, categoryTree.indexOf(parent)],
      );
      for (const child of parent.children) {
        const childId = randomUUID();
        categoryIds[child.slug] = childId;
        await tx.query(
          `INSERT INTO categories (id, parent_id, name, slug, icon, commission_bps, sort)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [childId, parentId, child.name, child.slug, child.icon, child.commission, parent.children.indexOf(child)],
        );
      }
    }

    for (const product of products) {
      const id = randomUUID();
      productIds[product.slug] = id;
      const categoryId = categoryIds[product.category];
      const sellerId = sellerIds[product.seller];
      await tx.query(
        `INSERT INTO products
          (id, seller_id, category_id, brand, title, slug, description, images,
           base_price_cents, compare_at_cents, stock, rating, rating_count, sold_count,
           status, sponsored_until, featured, location, tags, rejection_reason, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20,$21,$22)`,
        [
          id,
          sellerId,
          categoryId,
          product.brand,
          product.title,
          product.slug,
          product.description,
          JSON.stringify(product.images),
          product.price,
          product.compareAt ?? null,
          product.stock,
          product.rating,
          product.ratingCount,
          product.sold,
          product.status ?? 'active',
          product.sponsoredDays ? inDays(product.sponsoredDays) : null,
          Boolean(product.featured),
          sellerSeeds.find((item) => item.key === product.seller).location,
          JSON.stringify(product.tags ?? []),
          product.status === 'rejected' ? 'Listing did not meet our photo requirements.' : null,
          daysAgo(product.addedDaysAgo ?? 20),
          daysAgo(product.addedDaysAgo ?? 20),
        ],
      );

      const variants = product.variants ?? [];
      for (let index = 0; index < variants.length; index += 1) {
        await tx.query(
          `INSERT INTO product_variants (id, product_id, name, price_cents, stock, sku, sort)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            randomUUID(),
            id,
            variants[index],
            null,
            Math.max(1, Math.floor(product.stock / variants.length)),
            `${product.slug.slice(0, 8).replace(/-$/, '').toUpperCase()}-${index + 1}`,
            index,
          ],
        );
      }
    }

    for (const review of reviewSeeds) {
      const [productSlug, userKey, rating, title, body, days, withPhoto] = review;
      await tx.query(
        `INSERT INTO reviews
          (id, product_id, user_id, rating, title, body, images, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
        [
          randomUUID(),
          productIds[productSlug],
          userIds[userKey],
          rating,
          title,
          body,
          JSON.stringify(withPhoto ? [products.find((p) => p.slug === productSlug).images[0]] : []),
          daysAgo(days),
        ],
      );
    }

    for (const productSlug of [
      'iphone-13-128gb-refurbished',
      'linen-sofa-3-seater',
      'niacinamide-glow-serum',
    ]) {
      await tx.query(
        `INSERT INTO wishlist_items (user_id, product_id, created_at)
         VALUES ($1, $2, $3)`,
        [userIds.demo, productIds[productSlug], daysAgo(4)],
      );
    }

    for (const address of addressSeeds) {
      await tx.query(
        `INSERT INTO addresses
          (id, user_id, label, recipient, phone, county, town, address_line, instructions, is_default, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          randomUUID(),
          userIds[address.user],
          address.label,
          address.recipient,
          address.phone,
          address.county,
          address.town,
          address.line,
          address.instructions,
          address.isDefault,
          daysAgo(25),
        ],
      );
    }

    const couponSeeds = [
      {
        code: 'WELCOME10',
        description: '10% off your first order, up to KSh 500',
        type: 'percent',
        value: 1000,
        minSpend: 200000,
        maxDiscount: 50000,
        usageLimit: 500,
        usedCount: 63,
        seller: null,
        category: null,
      },
      {
        code: 'FREEDEL',
        description: 'Free delivery on orders from KSh 3,000',
        type: 'free_delivery',
        value: 0,
        minSpend: 300000,
        maxDiscount: null,
        usageLimit: 300,
        usedCount: 48,
        seller: null,
        category: null,
      },
      {
        code: 'TECH500',
        description: 'KSh 500 off electronics from KSh 2,000',
        type: 'fixed',
        value: 50000,
        minSpend: 200000,
        maxDiscount: null,
        usageLimit: 200,
        usedCount: 27,
        seller: null,
        category: 'electronics',
      },
      {
        code: 'GLOW15',
        description: '15% off Glow Beauty KE, up to KSh 1,000',
        type: 'percent',
        value: 1500,
        minSpend: 150000,
        maxDiscount: 100000,
        usageLimit: 150,
        usedCount: 19,
        seller: 'glow',
        category: null,
      },
    ];

    for (const coupon of couponSeeds) {
      await tx.query(
        `INSERT INTO coupons
          (id, code, description, type, value, min_spend_cents, max_discount_cents,
           usage_limit, used_count, starts_at, ends_at, active, seller_id, category_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          randomUUID(),
          coupon.code,
          coupon.description,
          coupon.type,
          coupon.value,
          coupon.minSpend,
          coupon.maxDiscount,
          coupon.usageLimit,
          coupon.usedCount,
          daysAgo(30),
          inDays(30),
          true,
          coupon.seller ? sellerIds[coupon.seller] : null,
          coupon.category ? categoryIds[coupon.category] : null,
        ],
      );
    }

    const flashSaleId = randomUUID();
    await tx.query(
      `INSERT INTO flash_sales (id, title, subtitle, starts_at, ends_at, active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        flashSaleId,
        'Kazi ya Leo — today’s flash deals',
        'Deep cuts on customer favourites. Limited stock, gone when the timer ends.',
        daysAgo(1),
        inDays(2),
        true,
      ],
    );
    const flashItems = [
      ['samsung-galaxy-a55-5g-256gb', 1800, 20],
      ['sony-wh-ch720n-headphones', 2200, 15],
      ['jbl-flip-6-speaker', 2000, 25],
      ['cloudstep-running-sneakers', 2500, 30],
      ['niacinamide-glow-serum', 1500, 40],
      ['leather-tote-bag', 1800, 10],
      ['philips-airfryer-4l', 2000, 12],
      ['cotton-percale-bedsheet-set', 1600, 18],
      ['kenyan-aa-coffee-500g', 1200, 30],
      ['fresh-avocados-1kg', 1500, 40],
    ];
    for (const [slug, discount, limit] of flashItems) {
      await tx.query(
        `INSERT INTO flash_sale_items (sale_id, product_id, discount_bps, stock_limit, sold_count)
         VALUES ($1, $2, $3, $4, $5)`,
        [flashSaleId, productIds[slug], discount, limit, Math.floor(limit * 0.4)],
      );
    }

    const bannerSeeds = [
      {
        title: 'Sound that moves you.',
        eyebrow: 'AUDIO WEEK',
        subtitle: 'Up to 30% off headphones, earbuds and speakers from sellers you can trust.',
        href: '/category/audio',
        cta: 'Shop audio',
        image: img('photo-1505740420928-5e560c06d30e', 1800),
        placement: 'hero',
        sort: 1,
      },
      {
        title: 'Home, but make it yours.',
        eyebrow: 'ZAWADI HOME',
        subtitle: 'Handmade pieces and everyday comforts for the spaces you love.',
        href: '/stores/zawadi-home',
        cta: 'Explore the store',
        image: img('photo-1616486338812-3dadae4b4ace', 1800),
        placement: 'hero',
        sort: 2,
      },
      {
        title: 'Everyday style, elevated.',
        eyebrow: 'NEW IN FASHION',
        subtitle: 'Fresh drops from Nairobi designers, ready to wear now.',
        href: '/category/fashion',
        cta: 'Shop new arrivals',
        image: img('photo-1483985988355-763728e1935b', 1800),
        placement: 'hero',
        sort: 3,
      },
      {
        title: 'Free delivery, no code.',
        eyebrow: 'MARTIFY PERK',
        subtitle: 'On door deliveries over KSh 5,000, anywhere in Kenya.',
        href: '/deals',
        cta: 'Shop the deals',
        image: null,
        placement: 'side',
        sort: 1,
      },
      {
        title: 'Your shop belongs here.',
        eyebrow: 'SELL ON MARTIFY',
        subtitle: 'Reach thousands of shoppers and get paid straight to M-Pesa.',
        href: '/sell',
        cta: 'Start selling',
        image: null,
        placement: 'side',
        sort: 2,
      },
    ];
    for (const banner of bannerSeeds) {
      await tx.query(
        `INSERT INTO banners
          (id, title, subtitle, eyebrow, image_url, href, cta, placement, active, sort, starts_at, ends_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          randomUUID(),
          banner.title,
          banner.subtitle,
          banner.eyebrow,
          banner.image,
          banner.href,
          banner.cta,
          banner.placement,
          true,
          banner.sort,
          daysAgo(5),
          inDays(60),
        ],
      );
    }

    const subscriptionSeeds = [
      ['technest', 'premium', 600000, 5, 25],
      ['soko', 'pro', 250000, 12, 20],
      ['zawadi', 'pro', 250000, 8, 22],
      ['glow', 'pro', 250000, 4, 26],
    ];
    for (const [sellerKey, tier, price, started, ends] of subscriptionSeeds) {
      await tx.query(
        `INSERT INTO subscriptions
          (id, seller_id, tier, price_cents, starts_at, ends_at, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,'active',$7)`,
        [
          randomUUID(),
          sellerIds[sellerKey],
          tier,
          price,
          daysAgo(started),
          inDays(ends),
          daysAgo(started),
        ],
      );
      await tx.query(
        `INSERT INTO ledger_entries (id, kind, seller_id, user_id, amount_cents, description, created_at)
         VALUES ($1, 'subscription', NULL, $2, $3, $4, $5)`,
        [
          randomUUID(),
          userIds[sellerSeeds.find((s) => s.key === sellerKey).user],
          price,
          `Martify ${tier} subscription — ${sellerSeeds.find((s) => s.key === sellerKey).storeName}`,
          daysAgo(started),
        ],
      );
    }

    const promotionSeeds = [
      ['technest', 'samsung-galaxy-a55-5g-256gb', 'sponsored', 150000, 12, 18],
      ['technest', 'iphone-13-128gb-refurbished', 'sponsored', 50000, 1, 6],
      ['glow', 'niacinamide-glow-serum', 'sponsored', 50000, 2, 9],
      ['glow', null, 'verification', 500000, 30, null],
      ['soko', null, 'featured', 1000000, 20, null],
    ];
    for (const [sellerKey, productSlug, kind, amount, started, ends] of promotionSeeds) {
      await tx.query(
        `INSERT INTO promotions
          (id, seller_id, product_id, kind, amount_cents, starts_at, ends_at, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8)`,
        [
          randomUUID(),
          sellerIds[sellerKey],
          productSlug ? productIds[productSlug] : null,
          kind,
          amount,
          daysAgo(started),
          ends ? inDays(ends) : null,
          daysAgo(started),
        ],
      );
      await tx.query(
        `INSERT INTO ledger_entries (id, kind, seller_id, user_id, amount_cents, description, created_at)
         VALUES ($1, 'sponsored', NULL, NULL, $2, $3, $4)`,
        [
          randomUUID(),
          amount,
          `Marketplace promotion — ${sellerSeeds.find((s) => s.key === sellerKey).storeName} (${kind})`,
          daysAgo(started),
        ],
      );
    }

    const sellersByKey = Object.fromEntries(
      sellerSeeds.map((seller) => [seller.key, seller]),
    );

    for (const order of orderSeeds) {
      const orderId = randomUUID();
      const createdAt = daysAgo(order.daysAgo);
      const paidAt = order.paymentStatus === 'paid'
        ? new Date(createdAt.getTime() + 4 * 60 * 1000)
        : null;

      const lines = order.items.map(([slug, quantity]) => {
        const product = products.find((item) => item.slug === slug);
        const seller = sellersByKey[product.seller];
        const categorySlug = product.category;
        const leaf = categoryTree
          .flatMap((parent) => parent.children)
          .find((item) => item.slug === categorySlug);
        const categoryBps = leaf?.commission ?? 1000;
        const bps = commissionBpsFor({
          categoryBps,
          tier: seller.tier,
        });
        const lineTotal = product.price * quantity;
        const commission = Math.round((lineTotal * bps) / 10000);
        return {
          product,
          seller,
          sellerKey: product.seller,
          quantity,
          bps,
          lineTotal,
          commission,
          sellerAmount: lineTotal - commission,
        };
      });

      const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      const coupon = order.coupon
        ? couponSeeds.find((item) => item.code === order.coupon)
        : null;
      const baseFee = deliveryFeeFor(order.delivery, subtotal, false);
      const couponResult = coupon
        ? couponDiscountFor(
            {
              type: coupon.type,
              value: coupon.value,
              min_spend_cents: coupon.minSpend,
              max_discount_cents: coupon.maxDiscount,
            },
            subtotal,
            baseFee,
          )
        : { discountCents: 0, freeDelivery: false, error: null };
      const deliveryFee = couponResult.freeDelivery
        ? 0
        : deliveryFeeFor(order.delivery, subtotal, false);
      const discount = couponResult.discountCents;
      const total = subtotal + deliveryFee - discount;
      const commissionTotal = lines.reduce((sum, line) => sum + line.commission, 0);
      const affiliateCommission = order.affiliateCode
        ? Math.round((subtotal * AFFILIATE_COMMISSION_BPS) / 10000)
        : 0;

      const address = {
        label: order.delivery === 'pickup' ? 'Pickup station' : 'Home',
        recipient: order.name,
        phone: order.phone,
        county: order.delivery === 'pickup' ? 'Nairobi' : 'Nairobi',
        town: order.delivery === 'pickup' ? 'Westlands pickup point' : 'Kilimani',
        address_line:
          order.delivery === 'pickup'
            ? 'Martify Pickup — Westlands Square, Shop 4'
            : 'Riverside Drive, House 12',
        instructions: order.delivery === 'pickup' ? 'Bring your order number.' : 'Call on arrival.',
      };

      await tx.query(
        `INSERT INTO orders
          (id, order_number, access_token, user_id, customer_name, email, phone,
           delivery_method, shipping_address, county, town, notes, coupon_code,
           subtotal_cents, discount_cents, delivery_fee_cents, total_cents,
           commission_cents, payment_method, payment_status, status, payment_ref,
           paid_at, affiliate_code, affiliate_commission_cents, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
        [
          orderId,
          order.number,
          randomBytes(18).toString('hex'),
          order.user ? userIds[order.user] : null,
          order.name,
          order.email,
          order.phone,
          order.delivery,
          JSON.stringify(address),
          address.county,
          address.town,
          order.delivery === 'express' ? 'Please call before arriving.' : null,
          order.coupon ?? null,
          subtotal,
          discount,
          deliveryFee,
          total,
          commissionTotal,
          order.paymentMethod,
          order.paymentStatus,
          order.status,
          order.paymentStatus === 'paid'
            ? `${order.paymentMethod === 'card' ? 'CARD' : 'MPESA'}-${order.number.slice(-6)}`
            : null,
          paidAt,
          order.affiliateCode ?? null,
          affiliateCommission,
          createdAt,
          paidAt ?? createdAt,
        ],
      );

      const itemStatus =
        order.status === 'delivered'
          ? 'delivered'
          : order.status === 'cancelled'
            ? 'cancelled'
            : order.status === 'placed'
              ? 'placed'
              : order.status === 'confirmed'
                ? 'confirmed'
                : 'shipped';

      for (const line of lines) {
        await tx.query(
          `INSERT INTO order_items
            (id, order_id, seller_id, product_id, variant_id, title, variant_name,
             image_url, unit_price_cents, quantity, line_total_cents, commission_bps,
             commission_cents, seller_amount_cents, fulfillment_status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [
            randomUUID(),
            orderId,
            sellerIds[line.sellerKey],
            productIds[line.product.slug],
            null,
            line.product.title,
            line.product.variants?.[0] ?? null,
            line.product.images[0],
            line.product.price,
            line.quantity,
            line.lineTotal,
            line.bps,
            line.commission,
            line.sellerAmount,
            itemStatus,
          ],
        );
        if (order.paymentStatus === 'paid') {
          await tx.query(
            `UPDATE products SET sold_count = sold_count + $1 WHERE id = $2`,
            [line.quantity, productIds[line.product.slug]],
          );
        }
      }

      await tx.query(
        `INSERT INTO payments
          (id, order_id, provider, amount_cents, status, reference, phone, created_at, paid_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          randomUUID(),
          orderId,
          order.paymentMethod,
          total,
          order.paymentStatus === 'paid' ? 'success' : 'pending',
          order.paymentStatus === 'paid'
            ? `SEED-${order.number.slice(-6)}`
            : null,
          order.phone,
          createdAt,
          paidAt,
        ],
      );

      if (order.paymentStatus === 'paid') {
        const entries = [
          ['sale', subtotal, `Sale — ${order.number}`],
          ['delivery_fee', deliveryFee, `Delivery fee — ${order.number}`],
        ];
        if (discount > 0) {
          entries.push(['discount', -discount, `Coupon ${order.coupon} — ${order.number}`]);
        }
        entries.push(['commission', commissionTotal, `Platform commission — ${order.number}`]);
        if (affiliateCommission > 0) {
          entries.push([
            'affiliate_commission',
            -affiliateCommission,
            `Affiliate ${order.affiliateCode} — ${order.number}`,
          ]);
        }
        for (const [kind, amount, description] of entries) {
          await tx.query(
            `INSERT INTO ledger_entries (id, kind, order_id, amount_cents, description, created_at)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [randomUUID(), kind, orderId, amount, description, paidAt],
          );
        }
        for (const line of lines) {
          await tx.query(
            `INSERT INTO ledger_entries
              (id, kind, order_id, seller_id, amount_cents, description, created_at)
             VALUES ($1, 'seller_payable', $2, $3, $4, $5, $6)`,
            [
              randomUUID(),
              orderId,
              sellerIds[line.sellerKey],
              line.sellerAmount,
              `Seller earning — ${order.number}`,
              paidAt,
            ],
          );
        }
      }
    }

    const affiliateUserId = userIds.demo;
    const affiliateOrder = orderSeeds.find((order) => order.affiliateCode);
    const affiliateLineSubtotal = affiliateOrder
      ? affiliateOrder.items.reduce((sum, [slug, qty]) => {
          const product = products.find((item) => item.slug === slug);
          return sum + product.price * qty;
        }, 0)
      : 0;
    const affiliateEarnings = Math.round(
      (affiliateLineSubtotal * AFFILIATE_COMMISSION_BPS) / 10000,
    );
    await tx.query(
      `INSERT INTO affiliates (id, user_id, code, clicks, signups, earnings_cents, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        randomUUID(),
        affiliateUserId,
        'MARTY-DEMO10',
        48,
        3,
        affiliateEarnings,
        daysAgo(35),
      ],
    );

    await tx.query(
      `INSERT INTO payouts
        (id, seller_id, amount_cents, method, destination, status, reference, requested_at, processed_at)
       VALUES ($1,$2,$3,$4,$5,'paid',$6,$7,$8)`,
      [
        randomUUID(),
        sellerIds.technest,
        2000000,
        'bank',
        'KCB •••• 4821',
        'PAY-88213',
        daysAgo(7),
        daysAgo(6),
      ],
    );
    await tx.query(
      `INSERT INTO ledger_entries (id, kind, seller_id, amount_cents, description, created_at)
       VALUES ($1, 'payout', $2, $3, $4, $5)`,
      [randomUUID(), sellerIds.technest, -2000000, 'Payout PAY-88213', daysAgo(7)],
    );

    await tx.query(
      `INSERT INTO payouts
        (id, seller_id, amount_cents, method, destination, status, requested_at)
       VALUES ($1,$2,$3,'mpesa',$4,'requested',$5)`,
      [randomUUID(), sellerIds.soko, 1500000, '+254 711 000 111', daysAgo(1)],
    );
    await tx.query(
      `INSERT INTO ledger_entries (id, kind, seller_id, amount_cents, description, created_at)
       VALUES ($1, 'payout', $2, $3, $4, $5)`,
      [randomUUID(), sellerIds.soko, -1500000, 'Payout request', daysAgo(1)],
    );

    await tx.query(
      `UPDATE sellers s SET
        balance_cents = COALESCE((SELECT SUM(amount_cents) FROM ledger_entries l WHERE l.seller_id = s.id), 0),
        lifetime_sales_cents = COALESCE((
          SELECT SUM(oi.seller_amount_cents) FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          WHERE oi.seller_id = s.id AND o.payment_status = 'paid'
        ), 0)`,
    );

    const returnOrder = await tx.query(
      `SELECT oi.id AS item_id, oi.seller_id, oi.seller_amount_cents
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.order_number = 'MFT-100041' AND oi.title LIKE 'Anker%' LIMIT 1`,
    );
    if (returnOrder[0]) {
      await tx.query(
        `INSERT INTO returns
          (id, order_id, order_item_id, user_id, reason, details, status, refund_cents, created_at, updated_at)
         VALUES ($1, (SELECT id FROM orders WHERE order_number = 'MFT-100041'), $2, $3,
                 'Item is not as described', 'The power bank arrived with a scratched casing. I would like a refund for one unit.',
                 'requested', 0, $4, $4)`,
        [randomUUID(), returnOrder[0].item_id, userIds.demo, daysAgo(2)],
      );
    }

    const notificationSeeds = [
      ['demo', 'Your order is on the way', 'Order MFT-100042 has been handed to our express rider.', 'order', '/account/orders', false, 1],
      ['demo', 'Price drop on your wishlist', 'The iPhone 13 you saved is now KSh 62,500.', 'promo', '/product/iphone-13-128gb-refurbished', false, 2],
      ['demo', 'Welcome to Martify', 'Thanks for shopping local. Here is 10% off with WELCOME10.', 'info', '/deals', true, 12],
      ['demo', 'Return request received', 'We are reviewing your return for order MFT-100041.', 'order', '/account/returns', true, 2],
      ['amina', 'New order received', 'Order MFT-100048 is ready for packing.', 'order', '/seller/orders', false, 1],
      ['amina', 'Your payout is being processed', 'KSh 15,000 is on its way to your M-Pesa number.', 'payout', '/seller/payouts', true, 1],
      ['admin', 'Seller application pending', 'Kilimani Bikes is waiting for verification.', 'seller', '/admin/sellers', false, 2],
      ['admin', 'Return needs review', 'A customer requested a return on order MFT-100041.', 'return', '/admin/returns', false, 2],
      ['brianS', 'You are on Premium', 'Your commission is now 2% lower for 25 more days.', 'info', '/seller/promotions', true, 5],
    ];
    for (const [userKey, title, body, type, href, read, days] of notificationSeeds) {
      await tx.query(
        `INSERT INTO notifications (id, user_id, title, body, type, href, read, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), userIds[userKey], title, body, type, href, read, daysAgo(days)],
      );
    }
  });
}
