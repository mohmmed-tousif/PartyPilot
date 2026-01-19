const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Package = require('../models/Package');

dotenv.config();

const packages = [
  // Kids Parties
  {
    name: 'Magical Kids Birthday Bash',
    description: 'Complete birthday setup with colorful balloons, clown entertainment, face painting, and fun games for kids.',
    price: 499.99,
    category: 'Kids',
    tags: ['birthday','kids','balloons','games','clown'],
    features: ['Balloon decorations', 'Clown entertainer', '5 game stations', 'Birthday cake', 'Face painting'],
    images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 50,
    duration: '4 hours',
    colorTheme: '#FF6B9D'
  },
  {
    name: 'Superhero Theme Party',
    description: 'Action-packed superhero birthday party with costumes, themed games, and hero training activities.',
    price: 549.99,
    category: 'Kids',
    tags: ['birthday','kids','themed','superhero'],
    features: ['Superhero decorations', 'Costume accessories', 'Hero training games', 'Themed cake', 'Photo booth'],
    images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 40,
    duration: '3 hours',
    colorTheme: '#FF8A65'
  },
  {
    name: 'Princess Royal Party',
    description: 'Enchanting princess party with castle decorations, dress-up, tea party, and magical entertainment.',
    price: 599.99,
    category: 'Kids',
    tags: ['birthday','kids','princess','themed'],
    features: ['Princess decorations', 'Dress-up costumes', 'Tea party setup', 'Storyteller', 'Tiara crafts'],
    images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'],
    rating: 5.0,
    capacity: 35,
    duration: '3 hours',
    colorTheme: '#F48FB1'
  },
  
  // Weddings
  {
    name: 'Elegant Garden Wedding',
    description: 'Romantic outdoor wedding with floral arrangements, arch setup, seating, and complete coordination.',
    price: 4999.99,
    category: 'Weddings',
    tags: ['wedding','outdoor','garden','romantic'],
    features: ['Floral arch & aisle', 'Chair decorations', 'Reception setup', 'Coordinator', 'Photography spots'],
    images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 200,
    duration: 'Full Day',
    colorTheme: '#FFDAB9'
  },
  {
    name: 'Luxury Ballroom Wedding',
    description: 'Grand ballroom wedding with crystal chandeliers, premium catering, DJ, and full-service planning.',
    price: 7999.99,
    category: 'Weddings',
    tags: ['wedding','luxury','ballroom','premium'],
    features: ['Ballroom decoration', 'Premium catering', 'DJ & lighting', 'Wedding planner', 'Dance floor'],
    images: ['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80'],
    rating: 5.0,
    capacity: 300,
    duration: 'Full Day',
    colorTheme: '#FFD700'
  },
  {
    name: 'Beach Wedding Package',
    description: 'Stunning beachfront wedding with ocean views, tropical decor, and sunset ceremony setup.',
    price: 5499.99,
    category: 'Weddings',
    tags: ['wedding','beach','outdoor','tropical'],
    features: ['Beach arch setup', 'Tropical flowers', 'Sunset timing', 'Beach seating', 'Sound system'],
    images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 150,
    duration: 'Full Day',
    colorTheme: '#87CEEB'
  },

  // Corporate Events
  {
    name: 'Corporate Conference Package',
    description: 'Professional conference setup with AV equipment, stage, seating, and catering for business events.',
    price: 2999.99,
    category: 'Corporate',
    tags: ['corporate','conference','business','professional'],
    features: ['Stage & podium', 'AV equipment', 'Professional seating', 'Business lunch', 'Registration desk'],
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.7,
    capacity: 250,
    duration: 'Full Day',
    colorTheme: '#4A90E2'
  },
  {
    name: 'Team Building Event',
    description: 'Interactive team building activities with outdoor games, challenges, and group bonding exercises.',
    price: 1499.99,
    category: 'Corporate',
    tags: ['corporate','team-building','outdoor','activities'],
    features: ['Team games setup', 'Facilitator', 'Outdoor activities', 'Lunch & snacks', 'Award ceremony'],
    images: ['https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 100,
    duration: '6 hours',
    colorTheme: '#50C878'
  },
  {
    name: 'Product Launch Event',
    description: 'High-impact product launch with stage setup, lighting, media coverage, and promotional materials.',
    price: 3499.99,
    category: 'Corporate',
    tags: ['corporate','launch','marketing','promotional'],
    features: ['Custom stage design', 'LED screens', 'Professional lighting', 'Media kit', 'Cocktail reception'],
    images: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 200,
    duration: '4 hours',
    colorTheme: '#9B59B6'
  },

  // Casual Events
  {
    name: 'Backyard BBQ Party',
    description: 'Relaxed BBQ party with grills, picnic tables, outdoor games, and casual catering.',
    price: 799.99,
    category: 'Casual',
    tags: ['bbq','casual','outdoor','food'],
    features: ['BBQ grill & chef', 'Picnic setup', 'Lawn games', 'Casual seating', 'Beverage station'],
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.6,
    capacity: 60,
    duration: '5 hours',
    colorTheme: '#FF6347'
  },
  {
    name: 'Pool Party Splash',
    description: 'Summer pool party with poolside setup, music, floating decorations, and refreshments.',
    price: 899.99,
    category: 'Casual',
    tags: ['pool','summer','casual','outdoor'],
    features: ['Pool decorations', 'Floating loungers', 'Music system', 'Poolside bar', 'Towel service'],
    images: ['https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.7,
    capacity: 50,
    duration: '4 hours',
    colorTheme: '#00CED1'
  },
  {
    name: 'Game Night Gathering',
    description: 'Indoor game night with board games, video games, snacks, and comfortable lounge setup.',
    price: 399.99,
    category: 'Casual',
    tags: ['games','indoor','casual','entertainment'],
    features: ['Game collection', 'Lounge seating', 'Snack bar', 'Gaming consoles', 'Pizza & drinks'],
    images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.5,
    capacity: 30,
    duration: '4 hours',
    colorTheme: '#FFB347'
  },

  // Festival & Cultural
  {
    name: 'Diwali Celebration Package',
    description: 'Traditional Diwali party with rangoli, diyas, cultural decorations, and Indian cuisine.',
    price: 1299.99,
    category: 'Festival',
    tags: ['diwali','cultural','festival','indian'],
    features: ['Traditional decorations', 'Diya lighting', 'Rangoli art', 'Indian catering', 'Cultural music'],
    images: ['https://images.unsplash.com/photo-1605472200879-47f00cee5e43?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 100,
    duration: '6 hours',
    colorTheme: '#FF9933'
  },
  {
    name: 'Christmas Holiday Party',
    description: 'Festive Christmas celebration with tree, lights, Santa, gifts, and holiday feast.',
    price: 1599.99,
    category: 'Festival',
    tags: ['christmas','holiday','winter','festive'],
    features: ['Christmas tree & lights', 'Santa appearance', 'Gift exchange setup', 'Holiday catering', 'Carol singers'],
    images: ['https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=80'],
    rating: 5.0,
    capacity: 80,
    duration: '5 hours',
    colorTheme: '#C41E3A'
  },
  {
    name: 'Holi Color Festival',
    description: 'Vibrant Holi celebration with color powders, music, dance, and traditional Indian snacks.',
    price: 999.99,
    category: 'Festival',
    tags: ['holi','cultural','festival','colors'],
    features: ['Color powder supply', 'DJ & music', 'Dance area', 'Water station', 'Indian snacks'],
    images: ['https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 120,
    duration: '4 hours',
    colorTheme: '#FF1493'
  },

  // Themed Parties
  {
    name: 'Hollywood Glamour Night',
    description: 'Elegant Hollywood-themed party with red carpet, paparazzi, photo booth, and champagne reception.',
    price: 1899.99,
    category: 'Themed',
    tags: ['hollywood','glamour','themed','elegant'],
    features: ['Red carpet setup', 'Photo booth', 'Paparazzi actors', 'Champagne bar', 'Award props'],
    images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 100,
    duration: '5 hours',
    colorTheme: '#D4AF37'
  },
  {
    name: 'Tropical Luau Party',
    description: 'Hawaiian luau with tiki torches, leis, hula dancers, tropical drinks, and island cuisine.',
    price: 1299.99,
    category: 'Themed',
    tags: ['luau','tropical','themed','hawaiian'],
    features: ['Tiki decorations', 'Lei greeting', 'Hula performance', 'Tropical bar', 'Island BBQ'],
    images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.7,
    capacity: 80,
    duration: '5 hours',
    colorTheme: '#FF7F50'
  },
  {
    name: 'Masquerade Ball',
    description: 'Mysterious masquerade party with elegant masks, ballroom setup, live music, and fine dining.',
    price: 2299.99,
    category: 'Themed',
    tags: ['masquerade','ball','elegant','mysterious'],
    features: ['Mask collection', 'Ballroom setup', 'Live orchestra', 'Fine dining', 'Champagne tower'],
    images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'],
    rating: 5.0,
    capacity: 150,
    duration: '6 hours',
    colorTheme: '#4B0082'
  },
  
  // Additional varied packages to reach 36 total
  {
    name: 'Graduation Celebration Party',
    description: 'Celebrate academic achievements with themed decorations, photo booth, and congratulatory setup.',
    price: 899.99,
    category: 'Kids',
    tags: ['graduation','celebration','academic'],
    features: ['Graduation banners', 'Photo booth', 'Cap & gown props', 'Buffet setup', 'Achievement awards'],
    images: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.7,
    capacity: 75,
    duration: '4 hours',
    colorTheme: '#4169E1'
  },
  {
    name: 'Baby Shower Bliss',
    description: 'Adorable baby shower with gender-neutral or themed decorations, games, and sweet treats.',
    price: 749.99,
    category: 'Casual',
    tags: ['baby-shower','celebration','themed'],
    features: ['Baby decorations', 'Gift table setup', 'Baby games', 'Dessert bar', 'Guest book station'],
    images: ['https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 50,
    duration: '3 hours',
    colorTheme: '#FFB6C1'
  },
  {
    name: 'Retirement Party Package',
    description: 'Honorable retirement celebration with memory displays, speeches setup, and elegant catering.',
    price: 1199.99,
    category: 'Corporate',
    tags: ['retirement','celebration','professional'],
    features: ['Memory wall', 'Speech podium', 'Video presentation', 'Elegant catering', 'Gift ceremony'],
    images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.6,
    capacity: 100,
    duration: '4 hours',
    colorTheme: '#B8860B'
  },
  {
    name: 'Sweet 16 Birthday Bash',
    description: 'Memorable Sweet 16 with DJ, dance floor, photo booth, and trendy decorations for teenagers.',
    price: 1499.99,
    category: 'Kids',
    tags: ['sweet-16','birthday','teenager','dance'],
    features: ['DJ & sound system', 'LED dance floor', 'Instagram-worthy booth', 'Trendy decor', 'Custom cake'],
    images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 80,
    duration: '5 hours',
    colorTheme: '#FF69B4'
  },
  {
    name: 'Cocktail Party Evening',
    description: 'Sophisticated cocktail party with mixologist, appetizers, lounge seating, and ambient lighting.',
    price: 1799.99,
    category: 'Casual',
    tags: ['cocktail','adult','sophisticated','evening'],
    features: ['Professional mixologist', 'Cocktail bar', 'Hors d\'oeuvres', 'Lounge furniture', 'Mood lighting'],
    images: ['https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 60,
    duration: '4 hours',
    colorTheme: '#2C3E50'
  },
  {
    name: 'Outdoor Movie Night',
    description: 'Cozy outdoor cinema with large screen, projector, bean bags, and popcorn bar.',
    price: 699.99,
    category: 'Casual',
    tags: ['movie','outdoor','cinema','entertainment'],
    features: ['Large screen & projector', 'Sound system', 'Bean bag seating', 'Popcorn bar', 'Blankets'],
    images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.7,
    capacity: 50,
    duration: '4 hours',
    colorTheme: '#34495E'
  },
  {
    name: 'Engagement Party Package',
    description: 'Romantic engagement celebration with couple\'s decor, champagne toast, and intimate dining.',
    price: 1999.99,
    category: 'Weddings',
    tags: ['engagement','romantic','celebration','couples'],
    features: ['Romantic decorations', 'Champagne service', 'Couple\'s table', 'Photo backdrop', 'Guest seating'],
    images: ['https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 80,
    duration: '4 hours',
    colorTheme: '#E91E63'
  },
  {
    name: 'Wine Tasting Evening',
    description: 'Elegant wine tasting event with sommelier, cheese pairings, and vineyard ambiance.',
    price: 1299.99,
    category: 'Casual',
    tags: ['wine','tasting','sophisticated','adult'],
    features: ['Professional sommelier', 'Wine selection', 'Cheese & charcuterie', 'Tasting notes', 'Elegant setup'],
    images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 40,
    duration: '3 hours',
    colorTheme: '#8B0000'
  },
  {
    name: 'New Year\'s Eve Gala',
    description: 'Spectacular NYE party with countdown, champagne toast, DJ, and midnight celebration.',
    price: 2499.99,
    category: 'Festival',
    tags: ['new-year','gala','celebration','party'],
    features: ['Countdown clock', 'Champagne toast', 'DJ & dancing', 'Party favors', 'Midnight snacks'],
    images: ['https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1200&q=80'],
    rating: 5.0,
    capacity: 200,
    duration: '6 hours',
    colorTheme: '#FFD700'
  },
  {
    name: 'Bridal Shower Party',
    description: 'Beautiful bridal shower with elegant decorations, games, gift opening, and tea service.',
    price: 899.99,
    category: 'Weddings',
    tags: ['bridal-shower','wedding','celebration','feminine'],
    features: ['Floral decorations', 'Bridal games', 'Gift display', 'Tea & desserts', 'Photo props'],
    images: ['https://images.unsplash.com/photo-1514849302-984523450cf4?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 40,
    duration: '3 hours',
    colorTheme: '#FFC0CB'
  },
  {
    name: 'Milestone Birthday (50th/60th)',
    description: 'Special milestone birthday celebration with memory displays, tribute videos, and elegant dining.',
    price: 1699.99,
    category: 'Casual',
    tags: ['milestone','birthday','celebration','adult'],
    features: ['Memory photo wall', 'Video tribute', 'Elegant dining', 'Speech setup', 'Anniversary decor'],
    images: ['https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.8,
    capacity: 100,
    duration: '5 hours',
    colorTheme: '#DAA520'
  },
  {
    name: 'Sports Viewing Party',
    description: 'Ultimate sports party with multiple screens, stadium seating, game snacks, and team decorations.',
    price: 799.99,
    category: 'Casual',
    tags: ['sports','viewing','party','entertainment'],
    features: ['Multiple TV screens', 'Stadium seating', 'Sports snacks', 'Team decorations', 'Halftime games'],
    images: ['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.6,
    capacity: 75,
    duration: '4 hours',
    colorTheme: '#228B22'
  },
  {
    name: 'Murder Mystery Dinner',
    description: 'Interactive murder mystery party with actors, themed dinner, clues, and suspenseful entertainment.',
    price: 1599.99,
    category: 'Themed',
    tags: ['mystery','dinner','interactive','entertainment'],
    features: ['Professional actors', 'Mystery script', 'Themed dinner', 'Clue packets', 'Prize for winner'],
    images: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 50,
    duration: '4 hours',
    colorTheme: '#800020'
  },
  {
    name: 'Charity Fundraiser Event',
    description: 'Professional fundraising event with auction setup, donation stations, and elegant reception.',
    price: 2999.99,
    category: 'Corporate',
    tags: ['charity','fundraiser','professional','formal'],
    features: ['Auction display', 'Donation stations', 'Guest reception', 'Program coordinator', 'Elegant catering'],
    images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.7,
    capacity: 200,
    duration: '5 hours',
    colorTheme: '#1E90FF'
  },
  {
    name: 'Karaoke Night Party',
    description: 'Fun karaoke party with professional system, song library, stage lights, and party atmosphere.',
    price: 599.99,
    category: 'Casual',
    tags: ['karaoke','music','entertainment','party'],
    features: ['Karaoke system', 'Song library', 'Stage lighting', 'Microphones', 'Snack bar'],
    images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.5,
    capacity: 60,
    duration: '4 hours',
    colorTheme: '#FF1493'
  },
  {
    name: 'Anniversary Celebration',
    description: 'Romantic anniversary party with couple\'s spotlight, renewal ceremony option, and elegant reception.',
    price: 1799.99,
    category: 'Weddings',
    tags: ['anniversary','romantic','celebration','couples'],
    features: ['Romantic decorations', 'Renewal ceremony setup', 'Photo montage', 'Elegant dining', 'Dance floor'],
    images: ['https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80'],
    rating: 4.9,
    capacity: 100,
    duration: '5 hours',
    colorTheme: '#C71585'
  }
];

const importData = async () => {
  try {
    await connectDB();
    
    // Drop any problematic indexes
    try {
      await mongoose.connection.collection('packages').dropIndexes();
      console.log('Dropped existing indexes');
    } catch (e) {
      console.log('No indexes to drop or error:', e.message);
    }
    
    await Package.deleteMany();
    await Package.insertMany(packages);
    console.log(`✓ Successfully inserted ${packages.length} packages`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding packages:', err);
    process.exit(1);
  }
};

importData();
