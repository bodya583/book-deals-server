import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export function toUserUuid(index: number): string {
  return `00000000-0000-4000-a000-${String(index).padStart(12, '0')}`;
}

export function toBookUuid(index: number): string {
  return `00000000-0000-4000-b000-${String(index).padStart(12, '0')}`;
}

export function toGenreUuid(index: number): string {
  return `00000000-0000-4000-c000-${String(index).padStart(12, '0')}`;
}

export interface SeedUserDef {
  id: string;
  username: string;
  email: string;
  city: string;
  latitude: number;
  longitude: number;
  photoURL: string;
}

export const SEED_USERS_RAW = [
  // KYIV (30 users at actual residential addresses)
  { username: 'alex_reader', email: 'alex.reader@bookswap.org', city: 'Kyiv', latitude: 50.5015, longitude: 30.4982, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'olena_books', email: 'olena.books@bookswap.org', city: 'Kyiv', latitude: 50.4688, longitude: 30.5185, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'taras_shev', email: 'taras.shev@bookswap.org', city: 'Kyiv', latitude: 50.4623, longitude: 30.5218, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'maria_reading', email: 'maria.reading@bookswap.org', city: 'Kyiv', latitude: 50.4472, longitude: 30.5225, photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80' },
  { username: 'max_reads', email: 'max.reads@bookswap.org', city: 'Kyiv', latitude: 50.4245, longitude: 30.5420, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'sophia_lit', email: 'sophia.lit@bookswap.org', city: 'Kyiv', latitude: 50.4210, longitude: 30.5180, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'yaroslav_k', email: 'yaroslav.k@bookswap.org', city: 'Kyiv', latitude: 50.4012, longitude: 30.6355, photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80' },
  { username: 'daria_books', email: 'daria.books@bookswap.org', city: 'Kyiv', latitude: 50.4095, longitude: 30.6410, photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
  { username: 'ivan_page', email: 'ivan.page@bookswap.org', city: 'Kyiv', latitude: 50.4050, longitude: 30.6220, photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80' },
  { username: 'nadiia_lit', email: 'nadiia.lit@bookswap.org', city: 'Kyiv', latitude: 50.4580, longitude: 30.4120, photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80' },
  { username: 'andriy_kyiv', email: 'andriy.kyiv@bookswap.org', city: 'Kyiv', latitude: 50.4600, longitude: 30.4900, photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
  { username: 'katya_reads', email: 'katya.reads@bookswap.org', city: 'Kyiv', latitude: 50.4520, longitude: 30.5920, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'artem_lit', email: 'artem.lit@bookswap.org', city: 'Kyiv', latitude: 50.5120, longitude: 30.6020, photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
  { username: 'solomiia_reads', email: 'solomiia.reads@bookswap.org', city: 'Kyiv', latitude: 50.5220, longitude: 30.4990, photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
  { username: 'vitaliy_k', email: 'vitaliy.k@bookswap.org', city: 'Kyiv', latitude: 50.5120, longitude: 30.5030, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'polina_lit', email: 'polina.lit@bookswap.org', city: 'Kyiv', latitude: 50.4510, longitude: 30.5110, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'dmytro_book', email: 'dmytro.book@bookswap.org', city: 'Kyiv', latitude: 50.4440, longitude: 30.5370, photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  { username: 'marina_kyiv', email: 'marina.kyiv@bookswap.org', city: 'Kyiv', latitude: 50.4290, longitude: 30.5170, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'rostyslav_d', email: 'rostyslav.d@bookswap.org', city: 'Kyiv', latitude: 50.3950, longitude: 30.5050, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'oksana_page', email: 'oksana.page@bookswap.org', city: 'Kyiv', latitude: 50.4120, longitude: 30.6550, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'bohdan_lit', email: 'bohdan.lit@bookswap.org', city: 'Kyiv', latitude: 50.3990, longitude: 30.6280, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'khrystyna_b', email: 'khrystyna.b@bookswap.org', city: 'Kyiv', latitude: 50.4140, longitude: 30.6200, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'nazar_reader', email: 'nazar.reader@bookswap.org', city: 'Kyiv', latitude: 50.4420, longitude: 30.4480, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'tetiana_lit', email: 'tetiana.lit@bookswap.org', city: 'Kyiv', latitude: 50.4510, longitude: 30.4720, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'stanislav_k', email: 'stanislav.k@bookswap.org', city: 'Kyiv', latitude: 50.4320, longitude: 30.4890, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'yuliya_reads', email: 'yuliya.reads@bookswap.org', city: 'Kyiv', latitude: 50.4280, longitude: 30.4600, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'valeriy_books', email: 'valeriy.books@bookswap.org', city: 'Kyiv', latitude: 50.4380, longitude: 30.5980, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'alina_page', email: 'alina.page@bookswap.org', city: 'Kyiv', latitude: 50.4180, longitude: 30.6020, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'roman_lit', email: 'roman.lit@bookswap.org', city: 'Kyiv', latitude: 50.5190, longitude: 30.6120, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'liliya_books', email: 'liliya.books@bookswap.org', city: 'Kyiv', latitude: 50.4530, longitude: 30.5050, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },

  // LVIV (15 users at actual residential addresses)
  { username: 'victoria_lviv', email: 'victoria.lviv@bookswap.org', city: 'Lviv', latitude: 49.8418, longitude: 24.0315, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'ostap_lit', email: 'ostap.lit@bookswap.org', city: 'Lviv', latitude: 49.8320, longitude: 24.0340, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'marta_books', email: 'marta.books@bookswap.org', city: 'Lviv', latitude: 49.8355, longitude: 24.0090, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'levko_reads', email: 'levko.reads@bookswap.org', city: 'Lviv', latitude: 49.8290, longitude: 23.9980, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'iryna_lviv', email: 'iryna.lviv@bookswap.org', city: 'Lviv', latitude: 49.7940, longitude: 24.0530, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'danylo_lit', email: 'danylo.lit@bookswap.org', city: 'Lviv', latitude: 49.8710, longitude: 24.0280, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'solomia_lviv', email: 'solomia.lviv@bookswap.org', city: 'Lviv', latitude: 49.8390, longitude: 23.9970, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'yuriy_books', email: 'yuriy.books@bookswap.org', city: 'Lviv', latitude: 49.8410, longitude: 24.0540, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'nataliya_lit', email: 'nataliya.lit@bookswap.org', city: 'Lviv', latitude: 49.8370, longitude: 24.0260, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'lyubomyr_k', email: 'lyubomyr.k@bookswap.org', city: 'Lviv', latitude: 49.8150, longitude: 24.0270, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'halyna_page', email: 'halyna.page@bookswap.org', city: 'Lviv', latitude: 49.8090, longitude: 23.9870, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'severyn_lit', email: 'severyn.lit@bookswap.org', city: 'Lviv', latitude: 49.8560, longitude: 24.0230, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'bohdana_lviv', email: 'bohdana.lviv@bookswap.org', city: 'Lviv', latitude: 49.8020, longitude: 24.0020, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'marko_reads', email: 'marko.reads@bookswap.org', city: 'Lviv', latitude: 49.8190, longitude: 24.0680, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'olesya_books', email: 'olesya.books@bookswap.org', city: 'Lviv', latitude: 49.8080, longitude: 24.0040, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },

  // ODESA (10 users at actual residential addresses)
  { username: 'denys_odesa', email: 'denys.odesa@bookswap.org', city: 'Odesa', latitude: 46.4850, longitude: 30.7380, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'kateryna_sea', email: 'kateryna.sea@bookswap.org', city: 'Odesa', latitude: 46.4590, longitude: 30.7550, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'leonid_lit', email: 'leonid.lit@bookswap.org', city: 'Odesa', latitude: 46.4420, longitude: 30.7520, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'valeriya_books', email: 'valeriya.books@bookswap.org', city: 'Odesa', latitude: 46.4020, longitude: 30.7180, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'ilya_reader', email: 'ilya.reader@bookswap.org', city: 'Odesa', latitude: 46.4820, longitude: 30.7020, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'svitlana_odesa', email: 'svitlana.odesa@bookswap.org', city: 'Odesa', latitude: 46.5780, longitude: 30.7950, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'pavel_lit', email: 'pavel.lit@bookswap.org', city: 'Odesa', latitude: 46.4480, longitude: 30.7510, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'marina_odesa', email: 'marina.odesa@bookswap.org', city: 'Odesa', latitude: 46.4380, longitude: 30.7010, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'serhiy_dev', email: 'serhiy.dev@bookswap.org', city: 'Odesa', latitude: 46.4790, longitude: 30.7420, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'anastasiya_sea', email: 'anastasiya.sea@bookswap.org', city: 'Odesa', latitude: 46.4680, longitude: 30.7450, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },

  // KHARKIV (8 users at actual residential addresses)
  { username: 'igor_kharkiv', email: 'igor.kharkiv@bookswap.org', city: 'Kharkiv', latitude: 50.0080, longitude: 36.2360, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'olena_kh', email: 'olena.kh@bookswap.org', city: 'Kharkiv', latitude: 50.0010, longitude: 36.2480, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { username: 'sergiy_saltivka', email: 'sergiy.saltivka@bookswap.org', city: 'Kharkiv', latitude: 50.0240, longitude: 36.3350, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'natali_kh', email: 'natali.kh@bookswap.org', city: 'Kharkiv', latitude: 50.0020, longitude: 36.3680, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'dmytro_pavlove', email: 'dmytro.pavlove@bookswap.org', city: 'Kharkiv', latitude: 50.0250, longitude: 36.2220, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'tetiana_kharkiv', email: 'tetiana.kharkiv@bookswap.org', city: 'Kharkiv', latitude: 49.9820, longitude: 36.1820, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'artur_lit', email: 'artur.lit@bookswap.org', city: 'Kharkiv', latitude: 50.0520, longitude: 36.2050, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'viktoriya_kh', email: 'viktoriya.kh@bookswap.org', city: 'Kharkiv', latitude: 49.9910, longitude: 36.2340, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },

  // DNIPRO (6 users at actual residential addresses)
  { username: 'taras_dnipro', email: 'taras.dnipro@bookswap.org', city: 'Dnipro', latitude: 48.4650, longitude: 35.0450, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'inna_dnipro', email: 'inna.dnipro@bookswap.org', city: 'Dnipro', latitude: 48.4230, longitude: 35.0780, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'mykhailo_dnipro', email: 'mykhailo.dnipro@bookswap.org', city: 'Dnipro', latitude: 48.4350, longitude: 35.0420, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'olha_peremoha', email: 'olha.peremoha@bookswap.org', city: 'Dnipro', latitude: 48.5020, longitude: 35.0820, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'vitalik_dnipro', email: 'vitalik.dnipro@bookswap.org', city: 'Dnipro', latitude: 48.4320, longitude: 35.0080, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'lyudmyla_dnipro', email: 'lyudmyla.dnipro@bookswap.org', city: 'Dnipro', latitude: 48.3950, longitude: 35.0250, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },

  // OTHER UKRAINIAN REGIONS (6 users at actual residential addresses)
  { username: 'dmytro_vin', email: 'dmytro.vin@bookswap.org', city: 'Vinnytsia', latitude: 49.2331, longitude: 28.4682, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { username: 'yuliya_frank', email: 'yuliya.frank@bookswap.org', city: 'Ivano-Frankivsk', latitude: 48.9226, longitude: 24.7111, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { username: 'bohdan_poltava', email: 'bohdan.poltava@bookswap.org', city: 'Poltava', latitude: 49.5883, longitude: 34.5514, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { username: 'oksana_bukovyna', email: 'oksana.bukovyna@bookswap.org', city: 'Chernivtsi', latitude: 48.2921, longitude: 25.9358, photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { username: 'andriy_zp', email: 'andriy.zp@bookswap.org', city: 'Zaporizhzhia', latitude: 47.8388, longitude: 35.1396, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { username: 'anna_warsaw', email: 'anna.warsaw@bookswap.org', city: 'Warsaw', latitude: 52.2297, longitude: 21.0122, photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
];

export const SEED_USERS: SeedUserDef[] = SEED_USERS_RAW.map((u, idx) => ({
  id: toUserUuid(idx + 1),
  ...u,
}));

export const ALL_GENRE_NAMES = [
  'Fiction',
  'Sci-Fi',
  'Fantasy',
  'Detective / Mystery',
  'Thriller / Horror',
  'Adventure',
  'Romance / Novel',
  'Classic Literature',
  'Popular Science',
  'Science / Non-Fiction',
  'Biography / Memoir',
  'History',
  'Psychology / Self-Help',
  'Business / Finance',
  'Philosophy',
  'Poetry',
  'Children’s Literature',
  'Children\'s Literature',
  'Art & Design',
];

export const GENRE_MAP = new Map<string, { id: string; name: string }>();
ALL_GENRE_NAMES.forEach((name, idx) => {
  GENRE_MAP.set(name.toLowerCase(), {
    id: toGenreUuid(idx + 1),
    name,
  });
});

export function resolveGenreObj(name: string) {
  const norm = name.toLowerCase();
  const existing = GENRE_MAP.get(norm);
  if (existing) return existing;
  const newObj = {
    id: toGenreUuid(GENRE_MAP.size + 1),
    name,
  };
  GENRE_MAP.set(norm, newObj);
  return newObj;
}
