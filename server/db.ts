import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Article, MonetagConfig, GoogleVerificationConfig, SiteSettings, Comment, User } from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface DatabaseSchema {
  adminUser: {
    email: string;
    passwordHash: string | null;
    isConfigured: boolean;
    name: string;
    resetToken?: string;
  };
  users: Array<User & { passwordHash: string }>;
  articles: Article[];
  comments: Comment[];
  media: MediaItem[];
  monetag: MonetagConfig;
  googleVerification: GoogleVerificationConfig;
  siteSettings: SiteSettings;
  auditLogs: Array<{ id: string; action: string; timestamp: string; details?: string }>;
}

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Afrobeats Triumphs at Global Stadiums: Burna Boy & Wizkid Redefine Modern Music Touring',
    subtitle: 'From sold-out nights at Madison Square Garden to London Stadium, African superstars are setting historic box office records worldwide.',
    slug: 'afrobeats-global-stadium-tour-burna-boy-wizkid',
    category: 'Music',
    tags: ['Afrobeats', 'Burna Boy', 'Wizkid', 'Touring', 'Global Music'],
    author: {
      name: 'Chidubem Okafor',
      role: 'Senior Music Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    caption: 'Grammy-winning Afrobeats performers command record-breaking international arenas with electrifying live orchestras.',
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    views: 14250,
    readingTime: 4,
    seoTitle: 'Afrobeats Triumphs at Global Stadiums - ALL GENRES Music News',
    seoDescription: 'Discover how Burna Boy, Wizkid, and African music luminaries are breaking international touring records across North America and Europe.',
    featured: true,
    breaking: true,
    excerpt: 'African artists are no longer just international crossover acts—they are leading the vanguard of the global live music economy with multi-night stadium runs.',
    content: `Afrobeats has officially transcended the label of a rising genre to become the pulse of global pop culture. Over the past twenty-four months, African musical titans have shattered glass ceilings across every continent.

When Burna Boy headlined a capacity crowd of over 80,000 at London Stadium followed by consecutive nights at New York's iconic Madison Square Garden, critics and music industry executives took notice. What was once viewed by Western labels as a niche demographic has materialized as one of the most energetic and financially dominant live touring forces on earth.

Wizkid's landmark three-night residency at London's O2 Arena paved the initial pathway, with tickets disappearing in a staggering twelve minutes. Alongside peers like Asake, Rema, Tems, and Tiwa Savage, the continent's sound is dominating streaming charts from Lagos to Los Angeles.

"The rhythmic architecture of Afrobeats is universally compelling," remarks veteran music producer Adeola Martins. "When you experience a 30-piece live horn section, authentic talking drums, and infectious West African polyrhythms in a stadium, language barriers instantly evaporate."

As major music festivals such as Coachella, Glastonbury, and Afro Nation continue to elevate African acts to top-billing positions, the economic ripple effect is felt back home in Nigeria, Ghana, and South Africa, catalyzing an explosive creative economy that shows zero signs of slowing down.`
  },
  {
    id: 'art-2',
    title: 'Nollywood Shatters Box Office Milestones: Cinematic Renaissance and Global Streaming Domination',
    subtitle: 'High-budget productions, technical excellence, and compelling African narratives bring historic returns to Nigerian cinema.',
    slug: 'nollywood-shatters-box-office-milestones-global-streaming',
    category: 'Nollywood',
    tags: ['Nollywood', 'Cinema', 'African Film', 'Box Office', 'Genevieve Nnaji'],
    author: {
      name: 'Amara Nwosu',
      role: 'Film & Culture Critic',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    caption: 'Cinematographers and directors on set in Lagos redefining cinematic standards for modern Nollywood.',
    status: 'published',
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    views: 9820,
    readingTime: 5,
    seoTitle: 'Nollywood Box Office Records & Streaming Era - ALL GENRES',
    seoDescription: 'Explore the phenomenal rise of Nollywood cinema, soaring theatrical earnings, and groundbreaking global acquisitions by premier streaming services.',
    featured: true,
    breaking: false,
    excerpt: 'The Nigerian film industry is witnessing unprecedented theatrical ticket sales and worldwide acclaim as directors embrace cinematic grade technology and daring original stories.',
    content: `Nollywood has journeyed from its humble VHS origins in the bustling markets of Alaba to becoming the second-largest film production industry globally by volume—and now, an undeniable powerhouse of cinematic craft.

Recent blockbusters have smashed the one-billion Naira threshold in domestic theatrical runs, a milestone previously deemed impossible. International distribution partnerships and direct commissions from Netflix, Prime Video, and Showmax have catalyzed an injection of capital that is transforming production quality.

Cinematographers are now utilizing ARRI Alexa 35 and RED V-Raptor cameras, professional Foley stages, and comprehensive color-grading suites. The result is a breathtaking visual language that honors traditional folklore while speaking fluently to modern contemporary moviegoers.

Trailblazing actors and directors are earning standing ovations at prestigious international film festivals from Toronto (TIFF) to Berlin. "We are telling our authentic stories on our own terms," states acclaimed filmmaker Kunle Afolayan. "The world has realized that our myths, our struggles, our triumphs, and our humor are utterly universal."`
  },
  {
    id: 'art-3',
    title: 'Hollywood Fall Preview: Sci-Fi Epics, Oscar Contenders, and the Resurgence of Theatrical Spectacle',
    subtitle: 'From visionary auteur releases to groundbreaking practical effects, studios make their biggest bet on cinema screens.',
    slug: 'hollywood-fall-preview-sci-fi-epics-oscar-contenders',
    category: 'Hollywood',
    tags: ['Hollywood', 'Movies', 'Oscars', 'Box Office', 'Christopher Nolan'],
    author: {
      name: 'Marcus Vance',
      role: 'Chief Hollywood Correspondent',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Film cameras rolling on an expansive Hollywood soundstage prepared for high-octane theatrical releases.',
    status: 'published',
    publishedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    views: 11400,
    readingTime: 6,
    seoTitle: 'Hollywood Fall Preview & Oscar Race - ALL GENRES',
    seoDescription: 'An insider preview of the upcoming Hollywood theatrical blockbusters, critical darlings, and early Academy Awards contenders.',
    featured: false,
    breaking: false,
    excerpt: 'Hollywood studios are doubling down on immersive 70mm IMAX releases and bold auteur visions to captivate discerning audiences this awards season.',
    content: `The theatrical experience has proven its enduring resilience. Following the cultural phenomenon of recent dual blockbusters, Hollywood studios are steering away from risk-averse formulas to champion visionary storytelling.

This autumn lineup showcases an exhilarating collision between grand sci-fi worldbuilding and intimate, character-driven dramatic triumphs. Directors are increasingly pushing for real-world practical effects, breathtaking stunt choreography, and authentic locations over sterile green screens.

Early festival screenings in Venice and Telluride have already illuminated frontrunners for the upcoming Academy Awards. Industry insiders point to stellar performances from leading veteran actors and breakout newcomers alike who are daring to tackle complex emotional terrain.

As premium large format theaters (IMAX and Dolby Cinema) report sold-out advance screenings weeks prior to opening nights, Hollywood reaffirms that the communal darkness of a cinema hall remains peerless.`
  },
  {
    id: 'art-4',
    title: 'Inside the Life of Zendaya: The Fashion Icon and Emmy Winner Defining a Generation',
    subtitle: 'From teenage prodigy to Hollywood leading lady and haute couture visionary, tracing Zendaya\'s meteoric evolution.',
    slug: 'inside-life-zendaya-fashion-icon-emmy-winner',
    category: 'Actors',
    tags: ['Zendaya', 'Actors', 'Fashion', 'Celebrity Biography', 'Hollywood'],
    author: {
      name: 'Sasha Laurent',
      role: 'Celebrity Culture Writer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    caption: 'Zendaya stuns at international film premieres, seamlessly commanding both red carpet style and dramatic nuance.',
    status: 'published',
    publishedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    views: 18900,
    readingTime: 5,
    seoTitle: 'Zendaya Biography: From Disney to Hollywood Royalty - ALL GENRES',
    seoDescription: 'An intimate portrait of Zendaya’s inspiring journey, award-winning acting career, and transformative influence on red carpet fashion.',
    featured: false,
    breaking: false,
    excerpt: 'Zendaya has redefined what it means to be a modern Hollywood superstar—balancing critical acclaim with boundary-pushing couture.',
    content: `Very few performers navigate the transition from child star to globally respected dramatic titan with the grace, precision, and poise demonstrated by Zendaya Coleman.

Winning two Primetime Emmy Awards for Outstanding Lead Actress in a Drama Series made her the youngest two-time winner in Emmy history. Her raw, gut-wrenching portrayal captured the anxieties and complexities of contemporary youth with devastating honesty.

Simultaneously, her collaboration with visionary image architect Law Roach has transformed every red carpet appearance into a cultural event that halts social media. From vintage Mugler robotic couture to custom archival Valentino, Zendaya treats fashion as an extension of performance art.

Beyond the cameras, her producing credits reflect a deliberate commitment to championing diverse storytelling and ensuring that underrepresented voices claim their rightful seat at the Hollywood table.`
  },
  {
    id: 'art-5',
    title: 'The Rise of Asake: How the "Mr. Money" Sound Conquered the Global Music Underground',
    subtitle: 'Fuji vocal inflections, Amapiano log drums, and infectious Lagos street anthems create an unstoppable sonic signature.',
    slug: 'the-rise-of-asake-mr-money-fuji-amapiano',
    category: 'Musicians',
    tags: ['Asake', 'Musicians', 'Amapiano', 'Fuji', 'Afrobeats'],
    author: {
      name: 'Chidubem Okafor',
      role: 'Senior Music Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    caption: 'Asake performing with trademark high energy and choir harmonies before thousands of adoring supporters.',
    status: 'published',
    publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    views: 12850,
    readingTime: 4,
    seoTitle: 'Asake Music Biography & Ascent - ALL GENRES',
    seoDescription: 'Tracing Asake’s meteoric rise from Lagos streets to sold-out arenas across the UK and United States.',
    featured: false,
    breaking: false,
    excerpt: 'Combining traditional Yoruba Fuji cadence with pulsating South African log drums, Asake engineered a sound that has taken over clubs globally.',
    content: `When Asake burst onto the mainstream scene, few could have anticipated the relentless sonic assault that would follow. With three critically revered albums released in breathless succession, the singer-songwriter has redefined the tempo of African music.

His sound is built upon the synthesis of sacred Islamic Fuji vocal styling, choral harmonies reminiscent of church hymns, and the thunderous, hypnotic log drums of South African Amapiano. It is a formula that feels simultaneously ancient and radically futuristic.

Crowds in London, Toronto, and Atlanta can be heard chanting Yoruba refrains word-for-word, a testament to music’s supernatural capacity to transcend geographical and linguistic borders. Asake represents the unstoppable triumph of uncompromised cultural identity on the world stage.`
  },
  {
    id: 'art-6',
    title: 'AMAA Awards Unveils Star-Studded Nominations: Celebrating African Cinema Royalty',
    subtitle: 'The Africa Movie Academy Awards return with fierce competition across directing, screenplay, and acting categories.',
    slug: 'amaa-awards-unveils-nominations-african-cinema',
    category: 'Celebrity News',
    tags: ['AMAA', 'Awards', 'Nollywood', 'African Cinema', 'Red Carpet'],
    author: {
      name: 'Amara Nwosu',
      role: 'Film & Culture Critic',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    caption: 'Celebrities arrive in breathtaking traditional and contemporary couture for the annual AMAA Awards gala.',
    status: 'published',
    publishedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    views: 7420,
    readingTime: 3,
    seoTitle: 'AMAA Awards Nominations Announced - ALL GENRES',
    seoDescription: 'Full breakdown of the Africa Movie Academy Awards nominations, standout films, and red carpet previews.',
    featured: false,
    breaking: false,
    excerpt: 'The Africa Movie Academy Awards have officially unveiled nominees for this year’s gala, honoring cinematic brilliance from across 40 countries.',
    content: `The prestigious Africa Movie Academy Awards (AMAA) has revealed its official nominations list, highlighting an extraordinary year for pan-African storytelling.

Entries spanning 40 nations demonstrated remarkable growth in screenwriting nuance, sound design, and historical epics. Nigeria, South Africa, Ghana, Kenya, and Egypt lead the nominations count, with independent indie filmmakers earning prominent placement alongside high-budget blockbusters.

The awards ceremony promises an unforgettable gathering of film royalty, honoring the legends whose foundational work paved the way for today's golden era.`
  },
  {
    id: 'art-7',
    title: 'Pedro Pascal: The Internet\'s Favorite Hero on Navigating Super-Stardom in His Late 40s',
    subtitle: 'From surviving grueling audition circuits in New York to headlining blockbuster franchises, Pedro Pascal reflects on persistence.',
    slug: 'pedro-pascal-internets-hero-super-stardom-interview',
    category: 'Actors',
    tags: ['Pedro Pascal', 'Actors', 'Hollywood', 'Interviews', 'Gladiator'],
    author: {
      name: 'Marcus Vance',
      role: 'Chief Hollywood Correspondent',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
    caption: 'Pedro Pascal photographed during an intimate press sit-down in Los Angeles.',
    status: 'published',
    publishedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    views: 15300,
    readingTime: 4,
    seoTitle: 'Pedro Pascal Profile: The Unstoppable Ascent - ALL GENRES',
    seoDescription: 'An exclusive look into Pedro Pascal’s remarkable career turnaround, beloved characters, and upcoming film triumphs.',
    featured: false,
    breaking: false,
    excerpt: 'Pedro Pascal is proof that true talent and perseverance can rewrite the rules of Hollywood stardom at any decade of life.',
    content: `There was a time when Pedro Pascal wondered if he would ever pay his rent solely through acting. Today, his face is anchored across the biggest cinematic and television franchises on the planet.

His warmth, grounded charisma, and unapologetic emotional vulnerability have endeared him to audiences worldwide. In an industry often obsessed with fleeting youth, Pascal’s triumph in his late forties offers a refreshing reminder that maturity and hard-won craft possess an irreplaceable resonance.`
  },
  {
    id: 'art-8',
    title: 'Top 10 Emerging Afropop & Amapiano Stars You Need to Stream Right Now',
    subtitle: 'Fresh voices from Johannesburg, Lagos, Accra, and Nairobi disrupting playlists and sound systems across the globe.',
    slug: 'top-10-emerging-afropop-amapiano-artists-to-watch',
    category: 'Trending',
    tags: ['Trending', 'Music', 'Afropop', 'New Artists', 'Playlists'],
    author: {
      name: 'Sasha Laurent',
      role: 'Celebrity Culture Writer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Studio mixing console glowing as producers engineer the next viral African sonic movement.',
    status: 'published',
    publishedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    views: 8900,
    readingTime: 3,
    seoTitle: 'Top 10 Emerging African Music Artists - ALL GENRES Trending',
    seoDescription: 'Discover the hottest rising talents redefining contemporary African sounds across streaming platforms right now.',
    featured: false,
    breaking: false,
    excerpt: 'From soulful alté melodies to high-BPM amapiano anthems, here are the 10 breakthrough voices currently dominating airwaves.',
    content: `The velocity of African music innovation is breathtaking. Every few months, an entirely new sub-genre or regional cadence explodes from neighborhood block parties to global algorithmic dominance.

In this curated roundup, ALL GENRES spotlights ten extraordinary young innovators who are pushing production boundaries, collaborating across borders, and delivering unforgettable earworms.`
  },
  {
    id: 'art-9',
    title: 'Genevieve Nnaji: The Nollywood Queen Whose Visionary Artistry Conquered International Cinema',
    subtitle: 'From her legendary early performances to directing landmark international acquisitions, an intimate portrait of an African icon.',
    slug: 'genevieve-nnaji-nollywood-queen-african-cinema-biography',
    category: 'Nollywood',
    tags: ['Genevieve Nnaji', 'Nollywood', 'African Cinema', 'Biography', 'Oscars'],
    author: {
      name: 'Amara Nwosu',
      role: 'Film & Culture Critic',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    caption: 'Genevieve Nnaji honored internationally for elevating Nollywood narratives to global prestige.',
    status: 'published',
    publishedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    views: 19420,
    readingTime: 6,
    seoTitle: 'Genevieve Nnaji Biography: Nollywood Pioneer - ALL GENRES',
    seoDescription: 'Read the life story, career milestones, and cinematic triumphs of Nollywood legend Genevieve Nnaji.',
    featured: false,
    breaking: false,
    excerpt: 'Genevieve Nnaji transformed African cinema from local video cassettes to worldwide streaming acclaim.',
    content: `To recount the history of modern Nollywood without placing Genevieve Nnaji at the absolute center is to miss the beating heart of the movement.

Rising to fame in the late 1990s, her raw screen presence, regal poise, and emotional vulnerability captured hearts across the African continent and diaspora. Referred to by Oprah Winfrey as the "Julia Roberts of Africa," Nnaji used her unprecedented stardom to demand higher production standards across the Nigerian film ecosystem.

Her directorial debut marked Nigeria’s first-ever official submission for Best International Feature Film at the Academy Awards and was acquired worldwide by Netflix. Today, she stands as an enduring beacon of artistic sovereignty, proving that African women can write, direct, produce, and headline cinematic masterpieces that command global reverence.`
  },
  {
    id: 'art-10',
    title: 'Tems & Tiwa Savage: The Powerhouses Driving African Women to the Zenith of Global Music',
    subtitle: 'Songwriting mastery, Grammy victories, and unapologetic female energy reshaping world charts.',
    slug: 'tems-tiwa-savage-women-reshaping-global-afrobeats',
    category: 'Musicians',
    tags: ['Tems', 'Tiwa Savage', 'Musicians', 'Grammys', 'Afrobeats'],
    author: {
      name: 'Chidubem Okafor',
      role: 'Senior Music Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Leading female African vocalists taking center stage at international music festivals.',
    status: 'published',
    publishedAt: new Date(Date.now() - 84 * 3600 * 1000).toISOString(),
    views: 16800,
    readingTime: 5,
    seoTitle: 'Tems & Tiwa Savage: African Queens of Global Music - ALL GENRES',
    seoDescription: 'Celebrating the incredible achievements, chart domination, and cultural resonance of Tems and Tiwa Savage.',
    featured: false,
    breaking: false,
    excerpt: 'African women are commanding the highest echelons of pop, R&B, and film score composition with soul-stirring vocal brilliance.',
    content: `The global conquest of African sounds would be incomplete without honoring the breathtaking artistry of its women. From Tiwa Savage’s trailblazing decade as the undisputed Queen of Afrobeats to Tems’ meteoric Grammy-winning ascent, female voices are leading the charge.

When Tems’ haunting vocals resonated across the Oscar-nominated Black Panther soundtrack and Beyoncé’s Renaissance album, she cemented her status as one of the most distinctive vocalists of her generation. Her deep, smoky timbre and poetic songwriting have made her an in-demand collaborator for international royalty from Drake to Justin Bieber.

Alongside her, Tiwa Savage continues to break records with sold-out arena shows across Europe and the Americas. Together, they represent an unstoppable wave of female empowerment that is inspiring a new generation of girls from Lagos to London to pick up the microphone.`
  },
  {
    id: 'art-11',
    title: 'Rema: The 24-Year-Old Nigerian Phenomenon Who Shattered Two Billion Streams',
    subtitle: 'From Benin City streets to historic Billboard Hot 100 runs, analyzing the "Afrorave" musical revolution.',
    slug: 'rema-calm-down-billboard-records-afrorave-superstar',
    category: 'Musicians',
    tags: ['Rema', 'Musicians', 'Afrorave', 'Billboard', 'Calm Down'],
    author: {
      name: 'Chidubem Okafor',
      role: 'Senior Music Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    caption: 'Rema electrifying thousands of fans during his sold-out global headline tour.',
    status: 'published',
    publishedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    views: 22100,
    readingTime: 4,
    seoTitle: 'Rema Biography: The Afrorave Titan - ALL GENRES',
    seoDescription: 'Discover how 24-year-old Rema engineered the historic record-breaking anthem "Calm Down" and conquered global charts.',
    featured: false,
    breaking: true,
    excerpt: 'Rema has shattered every streaming benchmark for African music, remaining on the Billboard Hot 100 for over a year.',
    content: `When divine talent meets tireless work ethic and audacious aesthetic fearlessness, you get Divine Ikubor, known to the universe as Rema.

His breakout single "Calm Down" achieved what no African recording had ever accomplished: surpassing billions of Spotify streams, topping charts in over thirty countries, and spending more than fifty consecutive weeks in the upper reaches of the US Billboard Hot 100.

Coining his genre as "Afrorave," Rema integrates Indian classical vocal scales, Arabic cadence, and infectious West African bounce into an otherworldly sonic potion. At just twenty-four years of age, he is already recognized as one of the definitive pop pioneers of the 21st century.`
  },
  {
    id: 'art-12',
    title: 'The Red Carpet Renaissance: Inside the Haute Couture Revolution at African & Hollywood Galas',
    subtitle: 'How African traditional textiles, avant-garde silhouettes, and cultural pride are redefining high fashion.',
    slug: 'red-carpet-renaissance-african-couture-fashion-galas',
    category: 'Celebrity News',
    tags: ['Fashion', 'Red Carpet', 'Celebrity News', 'Couture', 'Met Gala'],
    author: {
      name: 'Sasha Laurent',
      role: 'Celebrity Culture Writer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    featuredImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Couture gowns and artisanal embroidery stealing headlines across world entertainment galas.',
    status: 'published',
    publishedAt: new Date(Date.now() - 110 * 3600 * 1000).toISOString(),
    views: 11800,
    readingTime: 4,
    seoTitle: 'Red Carpet Fashion & African Haute Couture - ALL GENRES',
    seoDescription: 'Inside the fashion renaissance transforming red carpets from Lagos to Cannes and the Met Gala.',
    featured: false,
    breaking: false,
    excerpt: 'African designers and celebrity stylists are asserting cultural power on the most watched red carpets on the planet.',
    content: `The days when red carpet fashion was dictated exclusively by Parisian fashion houses are firmly in the past. Today’s premier entertainment events are vibrant showcases of global diaspora craftsmanship.

From intricate handwoven Aso-Oke garments adorned with Swarovski crystals to sculptural headpieces inspired by Benin bronzes, celebrities are wearing their heritage with magnificent pride. Designers like Kenneth Ize, Thebe Magugu, and Andrea Iyamah are routinely dressed on Hollywood A-listers, proving that authentic cultural lineage is the pinnacle of contemporary luxury.`
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    articleId: 'art-1',
    authorName: 'Emmanuel Cole',
    content: 'Afrobeats to the world! Seeing Burna Boy pack out MSG was an emotional moment for African youth everywhere.',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    reaction: '🔥'
  },
  {
    id: 'c-2',
    articleId: 'art-2',
    authorName: 'Blessing Adeyemi',
    content: 'The cinematography in modern Nollywood films is truly world-class. Proud of how far the industry has evolved!',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    reaction: '❤️'
  }
];

const INITIAL_SCHEMA: DatabaseSchema = {
  adminUser: {
    email: 'jacobfriday216@gmail.com',
    passwordHash: null, // Will be set securely by admin via /admin setup
    isConfigured: false,
    name: 'Jacob Friday (Founder & Admin)'
  },
  users: [],
  articles: INITIAL_ARTICLES,
  comments: INITIAL_COMMENTS,
  media: [
    {
      id: 'med-1',
      name: 'burna-boy-arena.jpg',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      size: 420000,
      type: 'image/jpeg',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'med-2',
      name: 'nollywood-cinema-set.jpg',
      url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      size: 380000,
      type: 'image/jpeg',
      uploadedAt: new Date().toISOString()
    }
  ],
  monetag: {
    smartLink: {
      enabled: false,
      url: '',
      title: 'Trending Entertainment Scoop & Special Offers',
      description: 'Discover exclusive celebrity interviews, insider music drops, and VIP entertainment deals powered by our partners.',
      buttonText: 'Claim Access Now',
      delaySeconds: 5,
      showOnHomepageOnly: false,
      allowDismiss: true,
      frequencyHours: 24
    },
    verification: {
      method: 'none',
      metaTagCode: '',
      fileName: '',
      fileContent: ''
    },
    placements: {
      header: { enabled: false, code: '', label: 'Top Header Banner (728x90)' },
      homepage: { enabled: false, code: '', label: 'Homepage In-Feed Billboard' },
      sidebar: { enabled: false, code: '', label: 'Sidebar Sticky Rectangle (300x250)' },
      insideArticle: { enabled: false, code: '', label: 'Inside Article Content Unit' },
      afterArticle: { enabled: false, code: '', label: 'Below Article Recommendation Unit' },
      footer: { enabled: false, code: '', label: 'Footer Full-Width Leaderboard' }
    }
  },
  googleVerification: {
    method: 'none',
    metaTag: '',
    filename: '',
    fileContent: '',
    lastChecked: undefined
  },
  siteSettings: {
    siteName: 'ALL GENRES',
    tagline: 'The Heartbeat of Global Entertainment, Music, Nollywood & Pop Culture',
    description: 'Premier entertainment news magazine covering music artists, Nollywood, Hollywood, celebrity biographies, movies, and pop culture.',
    contactEmail: 'jacobfriday216@gmail.com',
    socialLinks: {
      twitter: 'https://twitter.com/allgenresnews',
      facebook: 'https://facebook.com/allgenresnews',
      instagram: 'https://instagram.com/allgenresnews',
      youtube: 'https://youtube.com/@allgenresmedia',
      tiktok: 'https://tiktok.com/@allgenresnews'
    },
    visitorRegistrationEnabled: true,
    defaultOgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: /sitemap.xml`
  },
  auditLogs: [
    {
      id: 'log-1',
      action: 'System Initialized',
      timestamp: new Date().toISOString(),
      details: 'ALL GENRES platform database initialized with core entertainment sections.'
    }
  ]
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge missing keys with default schema safely
        const existingIds = new Set((parsed.articles || []).map((a: Article) => a.id));
        const mergedArticles = [
          ...(parsed.articles || []),
          ...INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id))
        ];
        return {
          ...INITIAL_SCHEMA,
          ...parsed,
          articles: mergedArticles,
          adminUser: { ...INITIAL_SCHEMA.adminUser, ...(parsed.adminUser || {}) },
          monetag: {
            ...INITIAL_SCHEMA.monetag,
            ...(parsed.monetag || {}),
            smartLink: { ...INITIAL_SCHEMA.monetag.smartLink, ...(parsed.monetag?.smartLink || {}) },
            verification: { ...INITIAL_SCHEMA.monetag.verification, ...(parsed.monetag?.verification || {}) },
            placements: { ...INITIAL_SCHEMA.monetag.placements, ...(parsed.monetag?.placements || {}) }
          },
          googleVerification: { ...INITIAL_SCHEMA.googleVerification, ...(parsed.googleVerification || {}) },
          siteSettings: { ...INITIAL_SCHEMA.siteSettings, ...(parsed.siteSettings || {}) }
        };
      }
    } catch (err) {
      console.error('Failed to read database file, initializing fresh store:', err);
    }
    this.saveData(INITIAL_SCHEMA);
    return INITIAL_SCHEMA;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public save(): void {
    this.saveData(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Admin Account & Setup
  public getAdmin() {
    return this.data.adminUser;
  }

  public async setInitialAdminPassword(password: string): Promise<boolean> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    this.data.adminUser.passwordHash = hash;
    this.data.adminUser.isConfigured = true;
    this.logAction('Admin Password Set', 'Master administrator password successfully established.');
    this.save();
    return true;
  }

  public async verifyAdminPassword(password: string): Promise<boolean> {
    if (!this.data.adminUser.passwordHash) return false;
    return await bcrypt.compare(password, this.data.adminUser.passwordHash);
  }

  public logAction(action: string, details?: string) {
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      timestamp: new Date().toISOString(),
      details
    });
    // Keep max 100 logs
    if (this.data.auditLogs.length > 100) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 100);
    }
  }
}

export const db = new Database();
