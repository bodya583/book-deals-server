import { randomUUID } from 'crypto';
import type { CreateBookDto, UpdateBookDto, GetBooksFilter } from '../books/books.service.js';

export interface MockGenre {
  id: string;
  name: string;
}

export interface MockUser {
  id: string;
  username: string;
  photoURL?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
}

export interface MockBook {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverURL: string | null;
  language: string | null;
  year: number | null;
  genres: MockGenre[];
  userId: string | null;
  isForTrade?: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: MockUser | null;
}

export const MOCK_GENRES: MockGenre[] = [
  { id: 'g-1', name: 'Fiction' },
  { id: 'g-2', name: 'Sci-Fi' },
  { id: 'g-3', name: 'Fantasy' },
  { id: 'g-4', name: 'Mystery / Detective' },
  { id: 'g-5', name: 'Thriller / Horror' },
  { id: 'g-6', name: 'Adventure' },
  { id: 'g-7', name: 'Romance / Novel' },
  { id: 'g-8', name: 'Classic Literature' },
  { id: 'g-9', name: 'Non-fiction' },
  { id: 'g-10', name: 'Biography / Memoir' },
  { id: 'g-11', name: 'History' },
  { id: 'g-12', name: 'Psychology / Self-help' },
  { id: 'g-13', name: 'Business / Finance' },
  { id: 'g-14', name: 'Philosophy' },
  { id: 'g-15', name: 'Poetry' },
  { id: 'g-16', name: 'Children’s Literature' },
  { id: 'g-17', name: 'Computer Science / IT' },
];

const findGenre = (name: string): MockGenre => {
  const found = MOCK_GENRES.find((g) => g.name.toLowerCase() === name.toLowerCase());
  return found || { id: randomUUID(), name };
};

export const MOCK_USERS: MockUser[] = [
  { id: 'u-1', username: 'alex_reader', photoURL: null, latitude: 50.4501, longitude: 30.5234, city: 'Kyiv' },
  { id: 'u-2', username: 'olga_books', photoURL: null, latitude: 49.8397, longitude: 24.0297, city: 'Lviv' },
  { id: 'u-3', username: 'serhiy_dev', photoURL: null, latitude: 46.4825, longitude: 30.7233, city: 'Odesa' },
  { id: 'u-4', username: 'maria_reading', photoURL: null, latitude: 49.9935, longitude: 36.2304, city: 'Kharkiv' },
  { id: 'u-5', username: 'taras_lit', photoURL: null, latitude: 48.4647, longitude: 35.0462, city: 'Dnipro' },
  { id: 'u-6', username: 'anna_books', photoURL: null, latitude: 52.2297, longitude: 21.0122, city: 'Warsaw' },
  { id: 'u-7', username: 'dmytro_lit', photoURL: null, latitude: 49.2331, longitude: 28.4682, city: 'Vinnytsia' },
  { id: 'u-8', username: 'yuliya_frank', photoURL: null, latitude: 48.9226, longitude: 24.7111, city: 'Ivano-Frankivsk' },
  { id: 'u-9', username: 'bohdan_poltava', photoURL: null, latitude: 49.5883, longitude: 34.5514, city: 'Poltava' },
  { id: 'u-10', username: 'oksana_bukovyna', photoURL: null, latitude: 48.2921, longitude: 25.9358, city: 'Chernivtsi' },
];

// Great-circle / spherical distance on Earth (km)
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export let inMemoryBooks: MockBook[] = [
  {
    id: 'b-1',
    title: "1984",
    author: "George Orwell",
    description: "Iconic dystopian novel about a totalitarian regime, Big Brother, and freedom of thought.",
    coverURL: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1949,
    genres: [findGenre("Sci-Fi"), findGenre("Romance / Novel"), findGenre("Philosophy")],
    userId: 'u-1',
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-01T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-2',
    title: "The Master and Margarita",
    author: "Mikhail Bulgakov",
    description: "Brilliant satirical novel weaving Woland’s visit to Moscow, Pontius Pilate, and enduring love.",
    coverURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1967,
    genres: [findGenre("Romance / Novel"), findGenre("Fantasy"), findGenre("Philosophy")],
    userId: 'u-2',
    createdAt: new Date('2023-03-04T12:00:00Z'),
    updatedAt: new Date('2023-03-04T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-3',
    title: "The Tiger Catchers",
    author: "Ivan Bahrianyi",
    description: "Thrilling adventure novel about Hryhorii Mnohohrishnyi, Siberia, and the struggle for freedom.",
    coverURL: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1944,
    genres: [findGenre("Adventure"), findGenre("Romance / Novel"), findGenre("Fiction")],
    userId: 'u-3',
    createdAt: new Date('2023-05-07T12:00:00Z'),
    updatedAt: new Date('2023-05-07T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-4',
    title: "Dune",
    author: "Frank Herbert",
    description: "A masterpiece of science fiction set on the desert planet Arrakis, full of politics and destiny.",
    coverURL: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1965,
    genres: [findGenre("Sci-Fi"), findGenre("Adventure")],
    userId: 'u-1',
    createdAt: new Date('2023-07-10T12:00:00Z'),
    updatedAt: new Date('2023-07-10T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-5',
    title: "Der Steppenwolf",
    author: "Hermann Hesse",
    description: "Eine tiefgründige Erzählung über die Zerrissenheit der menschlichen Seele.",
    coverURL: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
    language: "German",
    year: 1927,
    genres: [findGenre("Classic Literature"), findGenre("Philosophy")],
    userId: 'u-4',
    createdAt: new Date('2023-09-13T12:00:00Z'),
    updatedAt: new Date('2023-09-13T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-6',
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    description: "Psychological crime novel exploring morality, guilt, and redemption through Rodion Raskolnikov.",
    coverURL: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1866,
    genres: [findGenre("Classic Literature"), findGenre("Mystery / Detective"), findGenre("Psychology / Self-help")],
    userId: 'u-2',
    createdAt: new Date('2023-11-16T12:00:00Z'),
    updatedAt: new Date('2023-11-16T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-7',
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    description: "Practical guide to writing clean, maintainable, and elegant software.",
    coverURL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2008,
    genres: [findGenre("Computer Science / IT"), findGenre("Non-fiction")],
    userId: 'u-7',
    createdAt: new Date('2023-01-19T12:00:00Z'),
    updatedAt: new Date('2023-01-19T12:00:00Z'),
    user: MOCK_USERS[6],
  },
  {
    id: 'b-8',
    title: "The City",
    author: "Valerian Pidmohylnyi",
    description: "The first urban novel in Ukrainian literature, depicting ambition and life in 1920s Kyiv.",
    coverURL: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1928,
    genres: [findGenre("Classic Literature"), findGenre("Romance / Novel")],
    userId: 'u-3',
    createdAt: new Date('2023-03-22T12:00:00Z'),
    updatedAt: new Date('2023-03-22T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-9',
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    description: "Un conte poétique et philosophique sur l’amitié, l’amour et la nature humaine.",
    coverURL: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1943,
    genres: [findGenre("Children’s Literature"), findGenre("Philosophy")],
    userId: 'u-4',
    createdAt: new Date('2023-05-25T12:00:00Z'),
    updatedAt: new Date('2023-05-25T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-10',
    title: "Atomic Habits",
    author: "James Clear",
    description: "A proven framework for building good habits and breaking bad ones through tiny daily improvements.",
    coverURL: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2018,
    genres: [findGenre("Psychology / Self-help"), findGenre("Business / Finance")],
    userId: 'u-2',
    createdAt: new Date('2023-07-28T12:00:00Z'),
    updatedAt: new Date('2023-07-28T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-11',
    title: "Project Hail Mary",
    author: "Andy Weir",
    description: "A thrilling survival journey of a lone astronaut trying to save humanity from extinction.",
    coverURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2021,
    genres: [findGenre("Sci-Fi"), findGenre("Adventure"), findGenre("Non-fiction")],
    userId: 'u-1',
    createdAt: new Date('2023-09-03T12:00:00Z'),
    updatedAt: new Date('2023-09-03T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-12',
    title: "Kobzar",
    author: "Taras Shevchenko",
    description: "Immortal poetry collection at the heart of Ukrainian national culture and identity.",
    coverURL: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1840,
    genres: [findGenre("Poetry"), findGenre("Classic Literature")],
    userId: 'u-3',
    createdAt: new Date('2023-11-06T12:00:00Z'),
    updatedAt: new Date('2023-11-06T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-13',
    title: "Shadows of Forgotten Ancestors",
    author: "Mykhailo Kotsiubynsky",
    description: "Lyrical novella about the tragic love of Ivan and Marichka in the mystical Carpathian highlands.",
    coverURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1911,
    genres: [findGenre("Classic Literature"), findGenre("Romance / Novel")],
    userId: 'u-8',
    createdAt: new Date('2023-01-09T12:00:00Z'),
    updatedAt: new Date('2023-01-09T12:00:00Z'),
    user: MOCK_USERS[7],
  },
  {
    id: 'b-14',
    title: "The Kaidash Family",
    author: "Ivan Nechui-Levytsky",
    description: "Vivid social comedy and drama depicting everyday life and family feuds in a 19th-century village.",
    coverURL: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1878,
    genres: [findGenre("Classic Literature"), findGenre("Fiction")],
    userId: 'u-5',
    createdAt: new Date('2023-03-12T12:00:00Z'),
    updatedAt: new Date('2023-03-12T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-15',
    title: "Zakhar Berkut",
    author: "Ivan Franko",
    description: "Historical novella chronicling the Tukhlia mountain community’s heroic resistance against invasion.",
    coverURL: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1883,
    genres: [findGenre("History"), findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-3',
    createdAt: new Date('2023-05-15T12:00:00Z'),
    updatedAt: new Date('2023-05-15T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-16',
    title: "The Forest Song",
    author: "Lesia Ukrainka",
    description: "Poetic fairy drama about the power of true love and the eternal clash between high ideals and reality.",
    coverURL: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1911,
    genres: [findGenre("Poetry"), findGenre("Fantasy"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2023-07-18T12:00:00Z'),
    updatedAt: new Date('2023-07-18T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-17',
    title: "The Black Council",
    author: "Panteleimon Kulish",
    description: "The first historical novel in Ukrainian depicting the Cossack political struggles of 1663.",
    coverURL: 'https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1857,
    genres: [findGenre("History"), findGenre("Romance / Novel")],
    userId: 'u-9',
    createdAt: new Date('2023-09-21T12:00:00Z'),
    updatedAt: new Date('2023-09-21T12:00:00Z'),
    user: MOCK_USERS[8],
  },
  {
    id: 'b-18',
    title: "Eneida",
    author: "Ivan Kotliarevsky",
    description: "Witty mock-heroic burlesque poem marking the dawn of modern Ukrainian literature.",
    coverURL: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1798,
    genres: [findGenre("Poetry"), findGenre("Classic Literature")],
    userId: 'u-3',
    createdAt: new Date('2023-11-24T12:00:00Z'),
    updatedAt: new Date('2023-11-24T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-19',
    title: "The Garden of Gethsemane",
    author: "Ivan Bahrianyi",
    description: "Powerful novel of resilience and unbroken human spirit against totalitarian imprisonment.",
    coverURL: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1950,
    genres: [findGenre("Romance / Novel"), findGenre("History")],
    userId: 'u-1',
    createdAt: new Date('2023-01-27T12:00:00Z'),
    updatedAt: new Date('2023-01-27T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-20',
    title: "The Yellow Prince",
    author: "Vasyl Barka",
    description: "Tragic historical novel bearing witness to the 1932–1933 famine and the resilience of humanity.",
    coverURL: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1962,
    genres: [findGenre("History"), findGenre("Romance / Novel")],
    userId: 'u-2',
    createdAt: new Date('2023-03-02T12:00:00Z'),
    updatedAt: new Date('2023-03-02T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-21',
    title: "The Cathedral",
    author: "Oles Honchar",
    description: "Philosophical novel on spiritual heritage, historical memory, and preserving cultural landmarks.",
    coverURL: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1968,
    genres: [findGenre("Romance / Novel"), findGenre("Philosophy")],
    userId: 'u-5',
    createdAt: new Date('2023-05-05T12:00:00Z'),
    updatedAt: new Date('2023-05-05T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-22',
    title: "Voroshilovgrad",
    author: "Serhiy Zhadan",
    description: "Atmospheric novel about returning to one’s hometown, friendship, and standing up for one’s roots.",
    coverURL: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2010,
    genres: [findGenre("Fiction"), findGenre("Romance / Novel")],
    userId: 'u-6',
    createdAt: new Date('2023-07-08T12:00:00Z'),
    updatedAt: new Date('2023-07-08T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-23',
    title: "The Orphanage",
    author: "Serhiy Zhadan",
    description: "Dramatic journey of teacher Pasha crossing conflict zones in eastern Ukraine to rescue his nephew.",
    coverURL: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2017,
    genres: [findGenre("Romance / Novel"), findGenre("Fiction")],
    userId: 'u-6',
    createdAt: new Date('2023-09-11T12:00:00Z'),
    updatedAt: new Date('2023-09-11T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-24',
    title: "Fieldwork in Ukrainian Sex",
    author: "Oksana Zabuzhko",
    description: "Groundbreaking confessional novel exploring identity, personal freedom, and passion.",
    coverURL: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1996,
    genres: [findGenre("Romance / Novel"), findGenre("Psychology / Self-help")],
    userId: 'u-4',
    createdAt: new Date('2023-11-14T12:00:00Z'),
    updatedAt: new Date('2023-11-14T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-25',
    title: "Sweet Darusia",
    author: "Maria Matios",
    description: "Haunting drama set in a Bukovynian village amidst 20th-century occupations.",
    coverURL: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2004,
    genres: [findGenre("Romance / Novel"), findGenre("History")],
    userId: 'u-10',
    createdAt: new Date('2023-01-17T12:00:00Z'),
    updatedAt: new Date('2023-01-17T12:00:00Z'),
    user: MOCK_USERS[9],
  },
  {
    id: 'b-26',
    title: "I (Romance)",
    author: "Mykola Khvylovyi",
    description: "Psychological novella portraying the fatal split between fanaticism and human conscience.",
    coverURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1924,
    genres: [findGenre("Classic Literature"), findGenre("Philosophy")],
    userId: 'u-3',
    createdAt: new Date('2023-03-20T12:00:00Z'),
    updatedAt: new Date('2023-03-20T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-27',
    title: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    description: "The first volume of the legendary epic fantasy saga about the quest to destroy the One Ring.",
    coverURL: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1954,
    genres: [findGenre("Fantasy"), findGenre("Adventure")],
    userId: 'u-1',
    createdAt: new Date('2023-05-23T12:00:00Z'),
    updatedAt: new Date('2023-05-23T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-28',
    title: "The Two Towers",
    author: "J.R.R. Tolkien",
    description: "The journey continues as the Fellowship is fractured, facing war across Rohan and Gondor.",
    coverURL: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1954,
    genres: [findGenre("Fantasy"), findGenre("Adventure")],
    userId: 'u-1',
    createdAt: new Date('2023-07-26T12:00:00Z'),
    updatedAt: new Date('2023-07-26T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-29',
    title: "The Return of the King",
    author: "J.R.R. Tolkien",
    description: "The climactic final struggle against Sauron and the crowning of Aragorn as the true king.",
    coverURL: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1955,
    genres: [findGenre("Fantasy"), findGenre("Adventure")],
    userId: 'u-1',
    createdAt: new Date('2023-09-01T12:00:00Z'),
    updatedAt: new Date('2023-09-01T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-30',
    title: "The Hobbit, or There and Back Again",
    author: "J.R.R. Tolkien",
    description: "Bilbo Baggins embarks on a dangerous adventure with thirteen dwarves to reclaim their treasure from Smaug.",
    coverURL: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1937,
    genres: [findGenre("Fantasy"), findGenre("Children’s Literature"), findGenre("Adventure")],
    userId: 'u-2',
    createdAt: new Date('2023-11-04T12:00:00Z'),
    updatedAt: new Date('2023-11-04T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-31',
    title: "The Last Wish",
    author: "Andrzej Sapkowski",
    description: "Short story collection introducing Geralt of Rivia, monster hunter caught in destiny.",
    coverURL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1993,
    genres: [findGenre("Fantasy"), findGenre("Adventure")],
    userId: 'u-3',
    createdAt: new Date('2023-01-07T12:00:00Z'),
    updatedAt: new Date('2023-01-07T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-32',
    title: "Sword of Destiny",
    author: "Andrzej Sapkowski",
    description: "Continuing Geralt’s adventures where his destiny first intertwines with young Ciri.",
    coverURL: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1992,
    genres: [findGenre("Fantasy"), findGenre("Adventure")],
    userId: 'u-3',
    createdAt: new Date('2023-03-10T12:00:00Z'),
    updatedAt: new Date('2023-03-10T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-33',
    title: "Blood of Elves",
    author: "Andrzej Sapkowski",
    description: "The Witcher saga begins as kingdoms edge toward war and sorcerers hunt for Ciri.",
    coverURL: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1994,
    genres: [findGenre("Fantasy"), findGenre("Romance / Novel")],
    userId: 'u-3',
    createdAt: new Date('2023-05-13T12:00:00Z'),
    updatedAt: new Date('2023-05-13T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-34',
    title: "Foundation",
    author: "Isaac Asimov",
    description: "Hari Seldon uses psychohistory to preserve human knowledge through a coming galactic dark age.",
    coverURL: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1951,
    genres: [findGenre("Sci-Fi"), findGenre("Non-fiction")],
    userId: 'u-1',
    createdAt: new Date('2023-07-16T12:00:00Z'),
    updatedAt: new Date('2023-07-16T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-35',
    title: "I, Robot",
    author: "Isaac Asimov",
    description: "Groundbreaking interconnected tales establishing the Three Laws of Robotics and humanity’s future.",
    coverURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1950,
    genres: [findGenre("Sci-Fi"), findGenre("Philosophy")],
    userId: 'u-1',
    createdAt: new Date('2023-09-19T12:00:00Z'),
    updatedAt: new Date('2023-09-19T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-36',
    title: "Solaris",
    author: "Stanislaw Lem",
    description: "Philosophical sci-fi novel on humanity attempting to comprehend an alien oceanic intelligence.",
    coverURL: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1961,
    genres: [findGenre("Sci-Fi"), findGenre("Philosophy")],
    userId: 'u-2',
    createdAt: new Date('2023-11-22T12:00:00Z'),
    updatedAt: new Date('2023-11-22T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-37',
    title: "The Cyberiad",
    author: "Stanislaw Lem",
    description: "Witty philosophical fables starring robotic constructors Trurl and Klapaucius.",
    coverURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1965,
    genres: [findGenre("Sci-Fi"), findGenre("Adventure")],
    userId: 'u-2',
    createdAt: new Date('2023-01-25T12:00:00Z'),
    updatedAt: new Date('2023-01-25T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-38',
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    description: "A dystopian vision of a future society where books are outlawed and firemen burn any that are found.",
    coverURL: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1953,
    genres: [findGenre("Sci-Fi"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2023-03-28T12:00:00Z'),
    updatedAt: new Date('2023-03-28T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-39',
    title: "The Martian Chronicles",
    author: "Ray Bradbury",
    description: "Lyrical science-fiction chronicle depicting the human settlement of Mars.",
    coverURL: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1950,
    genres: [findGenre("Sci-Fi"), findGenre("Fiction")],
    userId: 'u-4',
    createdAt: new Date('2023-05-03T12:00:00Z'),
    updatedAt: new Date('2023-05-03T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-40',
    title: "The Hitchhiker’s Guide to the Galaxy",
    author: "Douglas Adams",
    description: "A wildly comedic space romp following Arthur Dent across the galaxy after Earth’s sudden destruction.",
    coverURL: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1979,
    genres: [findGenre("Sci-Fi"), findGenre("Adventure")],
    userId: 'u-6',
    createdAt: new Date('2023-07-06T12:00:00Z'),
    updatedAt: new Date('2023-07-06T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-41',
    title: "The Three-Body Problem",
    author: "Cixin Liu",
    description: "Humanity makes its first contact with an alien civilization poised on the brink of collapse.",
    coverURL: 'https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2008,
    genres: [findGenre("Sci-Fi"), findGenre("Non-fiction")],
    userId: 'u-1',
    createdAt: new Date('2023-09-09T12:00:00Z'),
    updatedAt: new Date('2023-09-09T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-42',
    title: "The Dark Forest",
    author: "Cixin Liu",
    description: "The terrifying cosmic reality of the Fermi paradox unfolds as Trisolaran fleet approaches Earth.",
    coverURL: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2008,
    genres: [findGenre("Sci-Fi"), findGenre("Non-fiction")],
    userId: 'u-1',
    createdAt: new Date('2023-11-12T12:00:00Z'),
    updatedAt: new Date('2023-11-12T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-43',
    title: "Death’s End",
    author: "Cixin Liu",
    description: "The awe-inspiring conclusion spanning eons of cosmic warfare and higher dimensions of spacetime.",
    coverURL: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2010,
    genres: [findGenre("Sci-Fi"), findGenre("Philosophy")],
    userId: 'u-1',
    createdAt: new Date('2023-01-15T12:00:00Z'),
    updatedAt: new Date('2023-01-15T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-44',
    title: "Neuromancer",
    author: "William Gibson",
    description: "The seminal cyberpunk novel introducing cyberspace, artificial intelligence, and digital outlaws.",
    coverURL: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1984,
    genres: [findGenre("Sci-Fi"), findGenre("Computer Science / IT")],
    userId: 'u-3',
    createdAt: new Date('2023-03-18T12:00:00Z'),
    updatedAt: new Date('2023-03-18T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-45',
    title: "The Martian",
    author: "Andy Weir",
    description: "Astronaut Mark Watney must use scientific ingenuity and stubborn optimism to survive alone on Mars.",
    coverURL: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2011,
    genres: [findGenre("Sci-Fi"), findGenre("Adventure"), findGenre("Non-fiction")],
    userId: 'u-1',
    createdAt: new Date('2023-05-21T12:00:00Z'),
    updatedAt: new Date('2023-05-21T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-46',
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description: "Classic detective cases of 221B Baker Street solved by Sherlock Holmes and Dr. Watson.",
    coverURL: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1892,
    genres: [findGenre("Mystery / Detective"), findGenre("Classic Literature")],
    userId: 'u-2',
    createdAt: new Date('2023-07-24T12:00:00Z'),
    updatedAt: new Date('2023-07-24T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-47',
    title: "The Hound of the Baskervilles",
    author: "Arthur Conan Doyle",
    description: "Sherlock Holmes investigates the legend of a spectral hound on foggy Devonshire moors.",
    coverURL: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1902,
    genres: [findGenre("Mystery / Detective"), findGenre("Thriller / Horror")],
    userId: 'u-2',
    createdAt: new Date('2023-09-27T12:00:00Z'),
    updatedAt: new Date('2023-09-27T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-48',
    title: "Murder on the Orient Express",
    author: "Agatha Christie",
    description: "Hercule Poirot must solve a baffling murder aboard an isolated snowbound luxury train.",
    coverURL: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1934,
    genres: [findGenre("Mystery / Detective"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2023-11-02T12:00:00Z'),
    updatedAt: new Date('2023-11-02T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-49',
    title: "And Then There Were None",
    author: "Agatha Christie",
    description: "Ten strangers are lured to an isolated island and accused of past crimes, dying one by one.",
    coverURL: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1939,
    genres: [findGenre("Mystery / Detective"), findGenre("Thriller / Horror")],
    userId: 'u-4',
    createdAt: new Date('2023-01-05T12:00:00Z'),
    updatedAt: new Date('2023-01-05T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-50',
    title: "The Shining",
    author: "Stephen King",
    description: "Jack Torrance becomes caretaker of the isolated Overlook Hotel, where sinister forces lurk in winter.",
    coverURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1977,
    genres: [findGenre("Thriller / Horror"), findGenre("Romance / Novel")],
    userId: 'u-6',
    createdAt: new Date('2023-03-08T12:00:00Z'),
    updatedAt: new Date('2023-03-08T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-51',
    title: "The Green Mile",
    author: "Stephen King",
    description: "A deeply moving story set on death row involving a gentle giant with miraculous healing powers.",
    coverURL: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1996,
    genres: [findGenre("Romance / Novel"), findGenre("Fantasy")],
    userId: 'u-6',
    createdAt: new Date('2023-05-11T12:00:00Z'),
    updatedAt: new Date('2023-05-11T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-52',
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    description: "Investigative journalist Mikael Blomkvist and hacker Lisbeth Salander uncover dark family secrets.",
    coverURL: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2005,
    genres: [findGenre("Mystery / Detective"), findGenre("Thriller / Horror")],
    userId: 'u-2',
    createdAt: new Date('2024-07-14T12:00:00Z'),
    updatedAt: new Date('2024-07-14T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-53',
    title: "The Silence of the Lambs",
    author: "Thomas Harris",
    description: "FBI trainee Clarice Starling seeks the insight of imprisoned cannibalistic psychiatrist Hannibal Lecter.",
    coverURL: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1988,
    genres: [findGenre("Thriller / Horror"), findGenre("Mystery / Detective")],
    userId: 'u-6',
    createdAt: new Date('2024-09-17T12:00:00Z'),
    updatedAt: new Date('2024-09-17T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-54',
    title: "The Da Vinci Code",
    author: "Dan Brown",
    description: "Symbologist Robert Langdon races across Europe unraveling religious riddles guarded for centuries.",
    coverURL: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2003,
    genres: [findGenre("Mystery / Detective"), findGenre("Adventure"), findGenre("History")],
    userId: 'u-1',
    createdAt: new Date('2024-11-20T12:00:00Z'),
    updatedAt: new Date('2024-11-20T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-55',
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A sweeping exploration of how Homo sapiens came to dominate Earth.",
    coverURL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2011,
    genres: [findGenre("History"), findGenre("Non-fiction"), findGenre("Philosophy")],
    userId: 'u-2',
    createdAt: new Date('2024-01-23T12:00:00Z'),
    updatedAt: new Date('2024-01-23T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-56',
    title: "Homo Deus: A Brief History of Tomorrow",
    author: "Yuval Noah Harari",
    description: "An examination of humanity’s future shaped by artificial intelligence and biotechnology.",
    coverURL: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2015,
    genres: [findGenre("Non-fiction"), findGenre("Philosophy")],
    userId: 'u-2',
    createdAt: new Date('2024-03-26T12:00:00Z'),
    updatedAt: new Date('2024-03-26T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-57',
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description: "Nobel laureate explains the two cognitive systems that drive our choices, judgments, and biases.",
    coverURL: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2011,
    genres: [findGenre("Psychology / Self-help"), findGenre("Non-fiction")],
    userId: 'u-4',
    createdAt: new Date('2024-05-01T12:00:00Z'),
    updatedAt: new Date('2024-05-01T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-58',
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description: "From the Big Bang to black holes, exploring the deepest mysteries of cosmological physics.",
    coverURL: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1988,
    genres: [findGenre("Non-fiction")],
    userId: 'u-3',
    createdAt: new Date('2024-07-04T12:00:00Z'),
    updatedAt: new Date('2024-07-04T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-59',
    title: "The Black Swan: The Impact of the Highly Improbable",
    author: "Nassim Nicholas Taleb",
    description: "How rare, extreme, and unforeseen events shape history, economics, and human understanding.",
    coverURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2007,
    genres: [findGenre("Business / Finance"), findGenre("Philosophy"), findGenre("Non-fiction")],
    userId: 'u-1',
    createdAt: new Date('2024-09-07T12:00:00Z'),
    updatedAt: new Date('2024-09-07T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-60',
    title: "Antifragile: Things That Gain from Disorder",
    author: "Nassim Nicholas Taleb",
    description: "Why some systems thrive on volatility, stress, and randomness while fragile ones collapse.",
    coverURL: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2012,
    genres: [findGenre("Philosophy"), findGenre("Business / Finance")],
    userId: 'u-1',
    createdAt: new Date('2024-11-10T12:00:00Z'),
    updatedAt: new Date('2024-11-10T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-61',
    title: "The Power of Habit",
    author: "Charles Duhigg",
    description: "Explores the science behind habit creation and reformation in individuals, businesses, and society.",
    coverURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2012,
    genres: [findGenre("Psychology / Self-help"), findGenre("Business / Finance")],
    userId: 'u-4',
    createdAt: new Date('2024-01-13T12:00:00Z'),
    updatedAt: new Date('2024-01-13T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-62',
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    description: "Timeless principles of personal integrity, proactive leadership, and constructive collaboration.",
    coverURL: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1989,
    genres: [findGenre("Psychology / Self-help"), findGenre("Business / Finance")],
    userId: 'u-2',
    createdAt: new Date('2024-03-16T12:00:00Z'),
    updatedAt: new Date('2024-03-16T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-63',
    title: "Man’s Search for Meaning",
    author: "Viktor Frankl",
    description: "Psychiatrist’s timeless memoir and psychological treatise on finding purpose amid suffering.",
    coverURL: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1946,
    genres: [findGenre("Psychology / Self-help"), findGenre("Philosophy"), findGenre("Biography / Memoir")],
    userId: 'u-5',
    createdAt: new Date('2024-05-19T12:00:00Z'),
    updatedAt: new Date('2024-05-19T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-64',
    title: "Zero to One: Notes on Startups, or How to Build the Future",
    author: "Peter Thiel",
    description: "The philosophy of creating breakthrough innovations and lasting technological value.",
    coverURL: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2014,
    genres: [findGenre("Business / Finance"), findGenre("Computer Science / IT")],
    userId: 'u-3',
    createdAt: new Date('2024-07-22T12:00:00Z'),
    updatedAt: new Date('2024-07-22T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-65',
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    description: "The definitive classic on value investing, risk minimization, and long-term financial discipline.",
    coverURL: 'https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1949,
    genres: [findGenre("Business / Finance")],
    userId: 'u-1',
    createdAt: new Date('2024-09-25T12:00:00Z'),
    updatedAt: new Date('2024-09-25T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-66',
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    description: "Financial literacy basics on assets, liabilities, and mindset for wealth accumulation.",
    coverURL: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1997,
    genres: [findGenre("Business / Finance"), findGenre("Psychology / Self-help")],
    userId: 'u-6',
    createdAt: new Date('2024-11-28T12:00:00Z'),
    updatedAt: new Date('2024-11-28T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-67',
    title: "Clean Architecture: A Craftsman’s Guide to Software Structure",
    author: "Robert C. Martin",
    description: "Core architectural guidelines for building decoupled, testable, and durable systems.",
    coverURL: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2017,
    genres: [findGenre("Computer Science / IT"), findGenre("Non-fiction")],
    userId: 'u-3',
    createdAt: new Date('2024-01-03T12:00:00Z'),
    updatedAt: new Date('2024-01-03T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-68',
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    author: "David Thomas, Andrew Hunt",
    description: "Essential wisdom for developers on career longevity, craftsmanship, and pragmatic engineering.",
    coverURL: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1999,
    genres: [findGenre("Computer Science / IT")],
    userId: 'u-3',
    createdAt: new Date('2024-03-06T12:00:00Z'),
    updatedAt: new Date('2024-03-06T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-69',
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    description: "The iconic Gang of Four reference detailing 23 fundamental software architectural patterns.",
    coverURL: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1994,
    genres: [findGenre("Computer Science / IT")],
    userId: 'u-3',
    createdAt: new Date('2024-05-09T12:00:00Z'),
    updatedAt: new Date('2024-05-09T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-70',
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    description: "Principles, techniques, and catalog of refactoring to elevate software maintainability.",
    coverURL: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1999,
    genres: [findGenre("Computer Science / IT")],
    userId: 'u-3',
    createdAt: new Date('2024-07-12T12:00:00Z'),
    updatedAt: new Date('2024-07-12T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-71',
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    description: "In-depth guide to storage engines, distributed consensus, transactions, and event streams.",
    coverURL: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 2017,
    genres: [findGenre("Computer Science / IT"), findGenre("Non-fiction")],
    userId: 'u-3',
    createdAt: new Date('2024-09-15T12:00:00Z'),
    updatedAt: new Date('2024-09-15T12:00:00Z'),
    user: MOCK_USERS[2],
  },
  {
    id: 'b-72',
    title: "The Art of War",
    author: "Sun Tzu",
    description: "Ancient Chinese military treatise on strategic thinking, diplomacy, and decisive victory.",
    coverURL: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: -500,
    genres: [findGenre("Philosophy"), findGenre("Classic Literature"), findGenre("Business / Finance")],
    userId: 'u-1',
    createdAt: new Date('2024-11-18T12:00:00Z'),
    updatedAt: new Date('2024-11-18T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-73',
    title: "The Prince",
    author: "Niccolò Machiavelli",
    description: "Classic political treatise exploring power dynamics, statecraft, and realpolitik leadership.",
    coverURL: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1532,
    genres: [findGenre("Philosophy"), findGenre("History"), findGenre("Classic Literature")],
    userId: 'u-2',
    createdAt: new Date('2024-01-21T12:00:00Z'),
    updatedAt: new Date('2024-01-21T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-74',
    title: "Meditations",
    author: "Marcus Aurelius",
    description: "Private journal of the Roman Emperor offering profound stoic reflections on virtue and resilience.",
    coverURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 180,
    genres: [findGenre("Philosophy"), findGenre("Classic Literature"), findGenre("Psychology / Self-help")],
    userId: 'u-5',
    createdAt: new Date('2024-03-24T12:00:00Z'),
    updatedAt: new Date('2024-03-24T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-75',
    title: "Also sprach Zarathustra",
    author: "Friedrich Nietzsche",
    description: "Philosophical masterpiece presenting concepts of the Übermensch, will to power, and eternal return.",
    coverURL: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    language: "German",
    year: 1883,
    genres: [findGenre("Philosophy"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2024-05-27T12:00:00Z'),
    updatedAt: new Date('2024-05-27T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-76',
    title: "A Man Called Ove",
    author: "Fredrik Backman",
    description: "Heartwarming story of a grumpy widower whose solitary routine is upended by lively neighbors.",
    coverURL: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2012,
    genres: [findGenre("Romance / Novel"), findGenre("Fiction")],
    userId: 'u-4',
    createdAt: new Date('2024-07-02T12:00:00Z'),
    updatedAt: new Date('2024-07-02T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-77',
    title: "Anxious People",
    author: "Fredrik Backman",
    description: "Touching comedy-drama about a failed bank robbery turning an apartment viewing into a hostage story.",
    coverURL: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2019,
    genres: [findGenre("Romance / Novel"), findGenre("Mystery / Detective")],
    userId: 'u-4',
    createdAt: new Date('2024-09-05T12:00:00Z'),
    updatedAt: new Date('2024-09-05T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-78',
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    description: "Nostalgic coming-of-age story of loss, first love, and youth in 1960s Tokyo.",
    coverURL: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 1987,
    genres: [findGenre("Romance / Novel"), findGenre("Fiction")],
    userId: 'u-6',
    createdAt: new Date('2024-11-08T12:00:00Z'),
    updatedAt: new Date('2024-11-08T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-79',
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    description: "Magical realism intertwining a teenage runaway and an elderly man who talks to cats.",
    coverURL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    language: "Ukrainian",
    year: 2002,
    genres: [findGenre("Romance / Novel"), findGenre("Fantasy")],
    userId: 'u-6',
    createdAt: new Date('2024-01-11T12:00:00Z'),
    updatedAt: new Date('2024-01-11T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-80',
    title: "Treasure Island",
    author: "Robert Louis Stevenson",
    description: "Classic pirate tale of young Jim Hawkins, Long John Silver, and hidden treasure on a remote island.",
    coverURL: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1883,
    genres: [findGenre("Adventure"), findGenre("Classic Literature"), findGenre("Children’s Literature")],
    userId: 'u-5',
    createdAt: new Date('2024-03-14T12:00:00Z'),
    updatedAt: new Date('2024-03-14T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-81',
    title: "Robinson Crusoe",
    author: "Daniel Defoe",
    description: "The quintessential survival adventure of a castaway spending 28 years on an uncharted tropical isle.",
    coverURL: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1719,
    genres: [findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-5',
    createdAt: new Date('2024-05-17T12:00:00Z'),
    updatedAt: new Date('2024-05-17T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-82',
    title: "The Call of the Wild",
    author: "Jack London",
    description: "A pampered dog named Buck is stolen and sent to the frozen Yukon, answering the call of primal nature.",
    coverURL: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1903,
    genres: [findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-2',
    createdAt: new Date('2024-07-20T12:00:00Z'),
    updatedAt: new Date('2024-07-20T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-83',
    title: "White Fang",
    author: "Jack London",
    description: "The journey of a wild wolfdog through hardship, fighting pits, and eventually redemption through kindness.",
    coverURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1906,
    genres: [findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-2',
    createdAt: new Date('2024-09-23T12:00:00Z'),
    updatedAt: new Date('2024-09-23T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-84',
    title: "Martin Eden",
    author: "Jack London",
    description: "Tragic story of a working-class sailor who educates himself to win love, only to become disillusioned.",
    coverURL: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1909,
    genres: [findGenre("Romance / Novel"), findGenre("Classic Literature")],
    userId: 'u-2',
    createdAt: new Date('2024-11-26T12:00:00Z'),
    updatedAt: new Date('2024-11-26T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-85',
    title: "The Adventures of Tom Sawyer",
    author: "Mark Twain",
    description: "Mischievous boyhood adventures along the Mississippi River with Tom, Becky Thatcher, and Huckleberry Finn.",
    coverURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1876,
    genres: [findGenre("Children’s Literature"), findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-86',
    title: "Adventures of Huckleberry Finn",
    author: "Mark Twain",
    description: "Huck Finn and runaway slave Jim raft down the Mississippi in pursuit of freedom and dignity.",
    coverURL: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1884,
    genres: [findGenre("Classic Literature"), findGenre("Adventure")],
    userId: 'u-4',
    createdAt: new Date('2024-03-04T12:00:00Z'),
    updatedAt: new Date('2024-03-04T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-87',
    title: "Vingt mille lieues sous les mers",
    author: "Jules Verne",
    description: "Captain Nemo commands the futuristic submarine Nautilus through uncharted oceans of the world.",
    coverURL: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1870,
    genres: [findGenre("Sci-Fi"), findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-5',
    createdAt: new Date('2024-05-07T12:00:00Z'),
    updatedAt: new Date('2024-05-07T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-88',
    title: "Le Tour du monde en quatre-vingts jours",
    author: "Jules Verne",
    description: "Phileas Fogg wagers that he can circumnavigate the globe in precisely eighty days.",
    coverURL: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1872,
    genres: [findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-5',
    createdAt: new Date('2024-07-10T12:00:00Z'),
    updatedAt: new Date('2024-07-10T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-89',
    title: "L’Île mystérieuse",
    author: "Jules Verne",
    description: "Five castaways escape a Civil War prison via balloon and build an ingenious colony on a remote island.",
    coverURL: 'https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1874,
    genres: [findGenre("Adventure"), findGenre("Sci-Fi")],
    userId: 'u-5',
    createdAt: new Date('2024-09-13T12:00:00Z'),
    updatedAt: new Date('2024-09-13T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-90',
    title: "Alice’s Adventures in Wonderland",
    author: "Lewis Carroll",
    description: "Alice falls down a rabbit hole into a whimsical, nonsensical world of talking creatures and tea parties.",
    coverURL: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1865,
    genres: [findGenre("Children’s Literature"), findGenre("Fantasy"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2024-11-16T12:00:00Z'),
    updatedAt: new Date('2024-11-16T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-91',
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "Glitz, obsession, and the hollow American Dream in the roaring Jazz Age of Long Island.",
    coverURL: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1925,
    genres: [findGenre("Romance / Novel"), findGenre("Classic Literature")],
    userId: 'u-1',
    createdAt: new Date('2024-01-19T12:00:00Z'),
    updatedAt: new Date('2024-01-19T12:00:00Z'),
    user: MOCK_USERS[0],
  },
  {
    id: 'b-92',
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "The stormy romance and sparkling battle of wits between Elizabeth Bennet and proud Mr. Darcy.",
    coverURL: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1813,
    genres: [findGenre("Romance / Novel"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2024-03-22T12:00:00Z'),
    updatedAt: new Date('2024-03-22T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-93',
    title: "The Old Man and the Sea",
    author: "Ernest Hemingway",
    description: "An aging Cuban fisherman battles alone in the Gulf Stream against a giant marlin.",
    coverURL: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1952,
    genres: [findGenre("Fiction"), findGenre("Classic Literature")],
    userId: 'u-2',
    createdAt: new Date('2024-05-25T12:00:00Z'),
    updatedAt: new Date('2024-05-25T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-94',
    title: "For Whom the Bell Tolls",
    author: "Ernest Hemingway",
    description: "American dynamiter Robert Jordan fights behind enemy lines in the Spanish Civil War.",
    coverURL: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1940,
    genres: [findGenre("Romance / Novel"), findGenre("History")],
    userId: 'u-2',
    createdAt: new Date('2024-07-28T12:00:00Z'),
    updatedAt: new Date('2024-07-28T12:00:00Z'),
    user: MOCK_USERS[1],
  },
  {
    id: 'b-95',
    title: "Drei Kameraden",
    author: "Erich Maria Remarque",
    description: "Tiefe Freundschaft und tragische Liebe im von der Wirtschaftskrise gezeichneten Berlin der 1920er Jahre.",
    coverURL: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&auto=format&fit=crop&q=80',
    language: "German",
    year: 1936,
    genres: [findGenre("Romance / Novel"), findGenre("Classic Literature")],
    userId: 'u-4',
    createdAt: new Date('2024-09-03T12:00:00Z'),
    updatedAt: new Date('2024-09-03T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-96',
    title: "Im Westen nichts Neues",
    author: "Erich Maria Remarque",
    description: "Erschütterndes Antikriegszeugnis einer verlorenen Generation in den Schützengräben des Ersten Weltkriegs.",
    coverURL: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=80',
    language: "German",
    year: 1929,
    genres: [findGenre("Romance / Novel"), findGenre("History")],
    userId: 'u-4',
    createdAt: new Date('2024-11-06T12:00:00Z'),
    updatedAt: new Date('2024-11-06T12:00:00Z'),
    user: MOCK_USERS[3],
  },
  {
    id: 'b-97',
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    description: "A hedonistic aristocrat retains his youthful beauty while his hidden portrait bears the sins of his life.",
    coverURL: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    language: "English",
    year: 1890,
    genres: [findGenre("Classic Literature"), findGenre("Philosophy")],
    userId: 'u-6',
    createdAt: new Date('2024-01-09T12:00:00Z'),
    updatedAt: new Date('2024-01-09T12:00:00Z'),
    user: MOCK_USERS[5],
  },
  {
    id: 'b-98',
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    description: "Edmond Dantès is unjustly imprisoned, escapes with treasure, and exacts retribution upon his betrayers.",
    coverURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1844,
    genres: [findGenre("Adventure"), findGenre("Classic Literature"), findGenre("Romance / Novel")],
    userId: 'u-5',
    createdAt: new Date('2024-03-12T12:00:00Z'),
    updatedAt: new Date('2024-03-12T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-99',
    title: "Les Trois Mousquetaires",
    author: "Alexandre Dumas",
    description: "Young d’Artagnan joins Athos, Porthos, and Aramis to defend the French crown in 17th-century intrigue.",
    coverURL: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1844,
    genres: [findGenre("Adventure"), findGenre("Classic Literature")],
    userId: 'u-5',
    createdAt: new Date('2024-05-15T12:00:00Z'),
    updatedAt: new Date('2024-05-15T12:00:00Z'),
    user: MOCK_USERS[4],
  },
  {
    id: 'b-100',
    title: "Les Misérables",
    author: "Victor Hugo",
    description: "Ex-convict Jean Valjean seeks redemption amidst poverty, revolution, and relentless pursuit by Inspector Javert.",
    coverURL: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    language: "French",
    year: 1862,
    genres: [findGenre("Romance / Novel"), findGenre("Classic Literature"), findGenre("History")],
    userId: 'u-5',
    createdAt: new Date('2024-07-18T12:00:00Z'),
    updatedAt: new Date('2024-07-18T12:00:00Z'),
    user: MOCK_USERS[4],
  },
];

export const getAllMockBooks = async (filter?: GetBooksFilter) => {
  let list = [...inMemoryBooks];

  // 1. User filter (for personal library)
  if (filter?.userId) {
    list = list.filter((b) => b.userId === filter.userId);
  }

  // Filter by isForTrade if specified
  if (filter?.isForTrade !== undefined) {
    list = list.filter((b) => (b.isForTrade ?? true) === filter.isForTrade);
  }

  // Settlement / City filter
  const cityList =
    filter?.cities && filter.cities.length > 0
      ? filter.cities.map((c) => c.toLowerCase().trim())
      : filter?.city && filter.city !== 'all'
      ? [filter.city.toLowerCase().trim()]
      : [];

  if (cityList.length > 0) {
    const matchingUserIds = new Set(
      MOCK_USERS
        .filter((u) => u.city && cityList.includes(u.city.toLowerCase().trim()))
        .map((u) => u.id)
    );
    list = list.filter((b) => b.userId && matchingUserIds.has(b.userId));
  }

  // Proximity filter (spherical distance)
  if (
    filter?.nearLat !== undefined &&
    filter?.nearLng !== undefined &&
    typeof filter.nearLat === 'number' &&
    typeof filter.nearLng === 'number'
  ) {
    const radiusKm = typeof filter.radius === 'number' && filter.radius > 0 ? filter.radius : 50;
    const nearbyUserIds = new Set(
      MOCK_USERS
        .filter((u) => {
          if (u.latitude == null || u.longitude == null) return false;
          return haversineKm(filter.nearLat!, filter.nearLng!, u.latitude, u.longitude) <= radiusKm;
        })
        .map((u) => u.id)
    );
    list = list.filter((b) => b.userId && nearbyUserIds.has(b.userId));
  }

  // 2. Search filter
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }

  // 3. Languages filter (multi-select)
  const langs =
    filter?.languages && filter.languages.length > 0
      ? filter.languages
      : filter?.language && filter.language !== 'all'
      ? [filter.language]
      : [];

  if (langs.length > 0) {
    list = list.filter((b) => b.language && langs.includes(b.language));
  }

  // 4. Genres filter (multi-select with strict AND vs OR)
  const genreList =
    filter?.genres && filter.genres.length > 0
      ? filter.genres
      : filter?.genre && filter.genre !== 'all'
      ? [filter.genre]
      : [];

  if (genreList.length > 0) {
    if (filter?.strictGenres) {
      // Must contain ALL requested genres
      list = list.filter((b) => {
        const bookGenreNames = b.genres.map((g) => g.name.toLowerCase());
        return genreList.every((req) => bookGenreNames.includes(req.toLowerCase()));
      });
    } else {
      // Must contain ANY of the requested genres
      list = list.filter((b) => {
        const bookGenreNames = b.genres.map((g) => g.name.toLowerCase());
        return genreList.some((req) => bookGenreNames.includes(req.toLowerCase()));
      });
    }
  }

  // 5. Year filter
  if (filter?.year !== undefined && !isNaN(filter.year)) {
    list = list.filter((b) => b.year === filter.year);
  } else {
    if (filter?.yearFrom !== undefined && !isNaN(filter.yearFrom)) {
      list = list.filter((b) => b.year !== null && b.year >= filter.yearFrom!);
    }
    if (filter?.yearTo !== undefined && !isNaN(filter.yearTo)) {
      list = list.filter((b) => b.year !== null && b.year <= filter.yearTo!);
    }
  }

  // 6. Sorting
  const sortBy = filter?.sortBy || 'newest';
  if (sortBy === 'oldest') {
    list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (sortBy === 'title_asc') {
    list.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
  } else if (sortBy === 'title_desc') {
    list.sort((a, b) => b.title.localeCompare(a.title, 'en', { sensitivity: 'base' }));
  } else if (sortBy === 'popular') {
    const getPopularity = (book: typeof list[0]) => {
      const idNum = parseInt(book.id.replace(/\D/g, '') || '0', 10);
      return ((idNum * 17) % 100) + (book.genres?.length || 0) * 15;
    };
    list.sort((a, b) => getPopularity(b) - getPopularity(a));
  } else if (sortBy === 'distance' && filter?.nearLat != null && filter?.nearLng != null) {
    const getDist = (b: typeof list[0]) => {
      if (b.user?.latitude == null || b.user?.longitude == null) return Infinity;
      return haversineKm(filter.nearLat!, filter.nearLng!, b.user.latitude, b.user.longitude);
    };
    list.sort((a, b) => getDist(a) - getDist(b));
  } else {
    // Default: newest
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const page = Math.max(1, Number(filter?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter?.limit) || 12));
  const skip = (page - 1) * limit;

  const total = list.length;
  const sanitizeUser = (user?: MockUser | null) => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      photoURL: user.photoURL ?? null,
      city: user.city ?? null,
    };
  };

  const paginated = list.slice(skip, skip + limit).map((b) => ({
    ...b,
    user: sanitizeUser(b.user),
  }));

  return {
    books: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getMockBookById = async (id: string) => {
  const book = inMemoryBooks.find((b) => b.id === id);
  if (!book) {
    throw new Error('Book not found');
  }
  return {
    ...book,
    user: book.user
      ? {
          id: book.user.id,
          username: book.user.username,
          photoURL: book.user.photoURL ?? null,
          city: book.user.city ?? null,
        }
      : null,
  };
};

export const getMockBookDetails = async (id: string) => {
  const book = await getMockBookById(id);

  const moreByAuthor = inMemoryBooks
    .filter(
      (b) =>
        b.id !== book.id &&
        b.author.toLowerCase().trim() === book.author.toLowerCase().trim()
    )
    .slice(0, 4)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverURL: b.coverURL,
      language: b.language,
      year: b.year,
      genres: b.genres,
      createdAt: b.createdAt,
    }));

  return {
    ...book,
    moreByAuthor,
  };
};

export const createMockGenre = async (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Genre name cannot be empty');
  }
  let existing = MOCK_GENRES.find((g) => g.name.toLowerCase() === trimmed.toLowerCase());
  if (!existing) {
    existing = { id: `g-${Date.now()}`, name: trimmed };
    MOCK_GENRES.push(existing);
  }
  return existing;
};

export const createMockBook = async (data: CreateBookDto, userId?: string) => {
  const genres = (data.genres || []).map((name) => findGenre(name));
  const user = MOCK_USERS.find((u) => u.id === userId) || (userId ? { id: userId, username: 'me' } : null);

  const newBook: MockBook = {
    id: randomUUID(),
    title: data.title.trim(),
    author: data.author.trim(),
    description: data.description?.trim() || null,
    coverURL: data.coverURL?.trim() || null,
    language: data.language?.trim() || null,
    year: data.year || null,
    genres,
    userId: userId || 'u-1',
    isForTrade: data.isForTrade !== undefined ? data.isForTrade : true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user,
  };

  inMemoryBooks.unshift(newBook);
  return newBook;
};

export const updateMockBook = async (id: string, data: UpdateBookDto, _userId?: string) => {
  const index = inMemoryBooks.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error('Book not found');
  }

  const current = inMemoryBooks[index];
  const genres = data.genres ? data.genres.map((name) => findGenre(name)) : current.genres;

  const updated: MockBook = {
    ...current,
    title: data.title !== undefined ? data.title.trim() : current.title,
    author: data.author !== undefined ? data.author.trim() : current.author,
    description: data.description !== undefined ? data.description.trim() || null : current.description,
    coverURL: data.coverURL !== undefined ? data.coverURL.trim() || null : current.coverURL,
    language: data.language !== undefined ? data.language.trim() || null : current.language,
    year: data.year !== undefined ? data.year : current.year,
    genres,
    isForTrade: data.isForTrade !== undefined ? data.isForTrade : (current.isForTrade ?? true),
    updatedAt: new Date(),
  };

  inMemoryBooks[index] = updated;
  return updated;
};

export const deleteMockBook = async (id: string, _userId?: string) => {
  const index = inMemoryBooks.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error('Book not found');
  }
  const deleted = inMemoryBooks.splice(index, 1)[0];
  return deleted;
};

export const getMockGenres = async () => {
  return MOCK_GENRES.map((g) => ({
    ...g,
    _count: {
      books: inMemoryBooks.filter((b) => b.genres.some((bg) => bg.name === g.name)).length,
    },
  }));
};

export interface MockSettlement {
  name: string;
  count: number;
  latitude: number;
  longitude: number;
}

export const getMockSettlements = async (): Promise<MockSettlement[]> => {
  const map = new Map<string, MockSettlement>();
  for (const user of MOCK_USERS) {
    if (!user.city || user.latitude == null || user.longitude == null) continue;
    const count = inMemoryBooks.filter((b) => b.userId === user.id).length;
    const existing = map.get(user.city);
    if (existing) {
      existing.count += count;
    } else {
      map.set(user.city, {
        name: user.city,
        count,
        latitude: user.latitude,
        longitude: user.longitude,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};
