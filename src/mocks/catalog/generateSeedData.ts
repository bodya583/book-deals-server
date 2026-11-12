import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SEED_USERS, toBookUuid, resolveGenreObj, GENRE_MAP } from './seedDataGenerator.js';

export interface RawBookTemplate {
  title: string;
  author: string;
  year: number;
  language: string;
  genres: string[];
  description: string;
  coverIdOrIsbn: string; // If numeric -> OpenLibrary ID, if starts with 978 or ISBN -> ISBN
}

export const MASTER_CATALOG: RawBookTemplate[] = [
  // UKRAINIAN LITERATURE & CLASSICS
  {
    title: "Кобзар",
    author: "Тарас Шевченко",
    year: 1840,
    language: "Ukrainian",
    genres: ["Classic Literature", "Poetry"],
    description: "Фундаментальна збірка поетичних творів, яка стала духовною основою модерної української нації та мови.",
    coverIdOrIsbn: "12644214"
  },
  {
    title: "Гайдамаки",
    author: "Тарас Шевченко",
    year: 1841,
    language: "Ukrainian",
    genres: ["Classic Literature", "Poetry", "History"],
    description: "Історична поема про масштабне народне повстання Коліївщини 1768 року.",
    coverIdOrIsbn: "8231860"
  },
  {
    title: "Захар Беркут",
    author: "Іван Франко",
    year: 1883,
    language: "Ukrainian",
    genres: ["Classic Literature", "History", "Adventure"],
    description: "Героїчна повість про мужню боротьбу карпатської тухольської громади проти монголо-татарської навали.",
    coverIdOrIsbn: "8231870"
  },
  {
    title: "Перехресні стежки",
    author: "Іван Франко",
    year: 1900,
    language: "Ukrainian",
    genres: ["Classic Literature", "Romance / Novel", "Philosophy"],
    description: "Психологічний роман про громадську боротьбу адвоката Рафаловича та трагічні повороти кохання.",
    coverIdOrIsbn: "8231875"
  },
  {
    title: "Украдене щастя",
    author: "Іван Франко",
    year: 1893,
    language: "Ukrainian",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "Класична драма про трагічний любовний трикутник та знівечену жіночу долю в галицькому селі.",
    coverIdOrIsbn: "8231878"
  },
  {
    title: "Мойсей",
    author: "Іван Франко",
    year: 1905,
    language: "Ukrainian",
    genres: ["Classic Literature", "Poetry", "Philosophy"],
    description: "Філософська поема про випробування лідера, віру народу та довгий шлях до омріяної свободи.",
    coverIdOrIsbn: "8231882"
  },
  {
    title: "Лісова пісня",
    author: "Леся Українка",
    year: 1911,
    language: "Ukrainian",
    genres: ["Classic Literature", "Fantasy", "Romance / Novel"],
    description: "Драма-феєрія про чисте кохання Мавки й Лукаша, зіткнення вільної духовної краси з матеріальним світом.",
    coverIdOrIsbn: "8231890"
  },
  {
    title: "Бояриня",
    author: "Леся Українка",
    year: 1910,
    language: "Ukrainian",
    genres: ["Classic Literature", "History"],
    description: "Драматична поема доби Руїни про культурний розлом між козацькою Україною та Московією.",
    coverIdOrIsbn: "8231894"
  },
  {
    title: "Камінний господар",
    author: "Леся Українка",
    year: 1912,
    language: "Ukrainian",
    genres: ["Classic Literature", "Philosophy", "Romance / Novel"],
    description: "Новаторська інтерпретація образу Дон Жуана, спокуси абсолютною владою та невідворотної розплати.",
    coverIdOrIsbn: "8231898"
  },
  {
    title: "Тіні забутих предків",
    author: "Михайло Коцюбинський",
    year: 1911,
    language: "Ukrainian",
    genres: ["Classic Literature", "Romance / Novel", "Fantasy"],
    description: "Гуцульська історія палкого кохання Івана й Марічки з двох ворогуючих родів серед магічної природи Карпат.",
    coverIdOrIsbn: "8231905"
  },
  {
    title: "Fata Morgana",
    author: "Михайло Коцюбинський",
    year: 1910,
    language: "Ukrainian",
    genres: ["Classic Literature", "Fiction", "History"],
    description: "Шедевр психологічної прози про соціальні заворушення та оманливі надії українського селянства.",
    coverIdOrIsbn: "8231910"
  },
  {
    title: "Intermezzo",
    author: "Михайло Коцюбинський",
    year: 1908,
    language: "Ukrainian",
    genres: ["Classic Literature", "Philosophy"],
    description: "Імпресіоністична новела про втому митця від людського болю та зцілення у гармонії з природою.",
    coverIdOrIsbn: "8231915"
  },
  {
    title: "Кайдашева сім'я",
    author: "Іван Нечуй-Левицький",
    year: 1878,
    language: "Ukrainian",
    genres: ["Classic Literature", "Fiction"],
    description: "Безсмертна соціально-побутова повість із тонким гумором та сатирою про родинні суперечки за спадок і землю.",
    coverIdOrIsbn: "8231920"
  },
  {
    title: "Микола Джеря",
    author: "Іван Нечуй-Левицький",
    year: 1878,
    language: "Ukrainian",
    genres: ["Classic Literature", "Adventure", "History"],
    description: "Повість про волелюбного бунтаря, який тікає від кріпацького ярма у пошуках справжньої свободи.",
    coverIdOrIsbn: "8231925"
  },
  {
    title: "Енеїда",
    author: "Іван Котляревський",
    year: 1798,
    language: "Ukrainian",
    genres: ["Classic Literature", "Poetry", "Adventure"],
    description: "Перлина бурлескно-травестійної класики, перший друкований твір народною українською мовою.",
    coverIdOrIsbn: "8231930"
  },
  {
    title: "Наталка Полтавка",
    author: "Іван Котляревський",
    year: 1819,
    language: "Ukrainian",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "Класична п'єса про вірність, щирість та силу кохання простої дівчини, покладена в основу українського театру.",
    coverIdOrIsbn: "8231935"
  },
  {
    title: "Тигролови",
    author: "Іван Багряний",
    year: 1944,
    language: "Ukrainian",
    genres: ["Adventure", "Fiction", "Classic Literature"],
    description: "Захопливий пригодницький роман про втечу інженера Григорія Многогрішного з потяга смерті в нетрі далекосхідної тайги.",
    coverIdOrIsbn: "8231940"
  },
  {
    title: "Сад Гетсиманський",
    author: "Іван Багряний",
    year: 1950,
    language: "Ukrainian",
    genres: ["History", "Fiction", "Philosophy"],
    description: "Потужний роман про незламність людського духу перед катувальною машиною радянського НКВС.",
    coverIdOrIsbn: "8231945"
  },
  {
    title: "Місто",
    author: "Валер'ян Підмогильний",
    year: 1928,
    language: "Ukrainian",
    genres: ["Classic Literature", "Fiction", "Philosophy"],
    description: "Перший український урбаністичний роман про підкорення Києва амбітним юнаком Степаном Радченком.",
    coverIdOrIsbn: "8231950"
  },
  {
    title: "Невеличка драма",
    author: "Валер'ян Підмогильний",
    year: 1930,
    language: "Ukrainian",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "Глибокий психологічний роман Розстріляного Відродження про конфлікт раціонального мислення та почуттів.",
    coverIdOrIsbn: "8231955"
  },
  {
    title: "Я (Романтика)",
    author: "Микола Хвильовий",
    year: 1924,
    language: "Ukrainian",
    genres: ["Classic Literature", "Philosophy"],
    description: "Трагічна психологічна новела про роздвоєння особистості між сліпим фанатизмом революції та синівською любов'ю.",
    coverIdOrIsbn: "8231960"
  },
  {
    title: "Маруся Чурай",
    author: "Ліна Костенко",
    year: 1979,
    language: "Ukrainian",
    genres: ["Poetry", "History", "Classic Literature"],
    description: "Історичний роман у віршах про легендарну полтавську піснярку та драматичну добу козаччини.",
    coverIdOrIsbn: "8231965"
  },
  {
    title: "Записки українського самашедшого",
    author: "Ліна Костенко",
    year: 2010,
    language: "Ukrainian",
    genres: ["Fiction", "Philosophy"],
    description: "Гострий щоденниковий роман про стан глобалізованого суспільства та хроніку українського життя на зламі тисячоліть.",
    coverIdOrIsbn: "8231970"
  },
  {
    title: "Інтернат",
    author: "Сергій Жадан",
    year: 2017,
    language: "Ukrainian",
    genres: ["Fiction", "History"],
    description: "Роман про вчителя Пашу, який вирушає крізь лінію фронту на Донбасі, аби забрати племінника з інтернату.",
    coverIdOrIsbn: "8231975"
  },
  {
    title: "Ворошиловград",
    author: "Сергій Жадан",
    year: 2010,
    language: "Ukrainian",
    genres: ["Fiction", "Adventure"],
    description: "Атмосферний роман про повернення до рідного міста, боротьбу за стару бензоколонку, дружбу й пам'ять.",
    coverIdOrIsbn: "8231980"
  },
  {
    title: "Депеш Мод",
    author: "Сергій Жадан",
    year: 2004,
    language: "Ukrainian",
    genres: ["Fiction", "Adventure"],
    description: "Культовий роман про буремну молодість у Харкові 90-х років, пригоди, пошуки друга та музику епохи.",
    coverIdOrIsbn: "8231985"
  },
  {
    title: "Месопотамія",
    author: "Сергій Жадан",
    year: 2014,
    language: "Ukrainian",
    genres: ["Fiction", "Poetry", "Romance / Novel"],
    description: "Книга прози та поезії про Харків — місто між двома ріками, історії кохання, втрат і надій.",
    coverIdOrIsbn: "8231988"
  },
  {
    title: "Польові дослідження з українського сексу",
    author: "Оксана Забужко",
    year: 1996,
    language: "Ukrainian",
    genres: ["Fiction", "Philosophy", "Romance / Novel"],
    description: "Знаковий роман, що започаткував нову хвилю сучасної української феміністичної та інтелектуальної прози.",
    coverIdOrIsbn: "8231992"
  },
  {
    title: "Музей покинутих секретів",
    author: "Оксана Забужко",
    year: 2009,
    language: "Ukrainian",
    genres: ["History", "Fiction", "Detective / Mystery"],
    description: "Масштабна родинна сага трьох поколінь крізь prism шести десятиліть української боротьби й таємниць.",
    coverIdOrIsbn: "8231995"
  },
  {
    title: "Московіада",
    author: "Юрій Андрухович",
    year: 1993,
    language: "Ukrainian",
    genres: ["Fiction", "Philosophy"],
    description: "Постмодерністський роман-гротеск про один божевільний день українського поета Отто фон Ф. у Москві початку 90-х.",
    coverIdOrIsbn: "8231998"
  },
  {
    title: "Перверзія",
    author: "Юрій Андрухович",
    year: 1996,
    language: "Ukrainian",
    genres: ["Fiction", "Philosophy", "Detective / Mystery"],
    description: "Венеційська містифікація навколо загадкового семінару та зникнення поета Станіслава Перфецького.",
    coverIdOrIsbn: "8232002"
  },
  {
    title: "Культ",
    author: "Любко Дереш",
    year: 2001,
    language: "Ukrainian",
    genres: ["Fantasy", "Thriller / Horror", "Fiction"],
    description: "Дебютний роман-трилер про містичні події в провінційному ліцеї та лавкрафтівських древніх чудовиськ.",
    coverIdOrIsbn: "8232005"
  },
  {
    title: "Танго смерті",
    author: "Юрій Винничук",
    year: 2012,
    language: "Ukrainian",
    genres: ["History", "Detective / Mystery", "Fiction"],
    description: "Захопливий роман про довоєнний Львів, дружбу чотирьох юнаків різних національностей і таємничу мелодію.",
    coverIdOrIsbn: "8232008"
  },
  {
    title: "Чорний Ворон",
    author: "Василь Шкляр",
    year: 2009,
    language: "Ukrainian",
    genres: ["History", "Adventure", "Fiction"],
    description: "Роман про запеклу партизанську боротьбу холодноярських повстанців проти радянської окупації у 1920-х роках.",
    coverIdOrIsbn: "8232012"
  },
  {
    title: "Колонія. Нові темні віки",
    author: "Макс Кідрук",
    year: 2023,
    language: "Ukrainian",
    genres: ["Sci-Fi", "Thriller / Horror"],
    description: "Монументальний твердий науково-фантастичний епос про виживання марсіанської колонії у XXII столітті.",
    coverIdOrIsbn: "12843589"
  },
  {
    title: "Не озирайся і мовчи",
    author: "Макс Кідрук",
    year: 2017,
    language: "Ukrainian",
    genres: ["Thriller / Horror", "Sci-Fi"],
    description: "Містичний технотрилер про хлопця Марка та паралельний світ, де можна сховатися від цькування.",
    coverIdOrIsbn: "8232018"
  },
  {
    title: "Фелікс Австрія",
    author: "Софія Андрухович",
    year: 2014,
    language: "Ukrainian",
    genres: ["History", "Romance / Novel", "Fiction"],
    description: "Тонкий чуттєвий роман про Станиславів початку XX століття та складні стосунки служниці Стефи й панянки Аделі.",
    coverIdOrIsbn: "8232022"
  },
  {
    title: "Амадока",
    author: "Софія Андрухович",
    year: 2020,
    language: "Ukrainian",
    genres: ["History", "Philosophy", "Fiction"],
    description: "Масштабний роман про людську пам'ять, травми війни, Розстріляне Відродження та втрачене озеро.",
    coverIdOrIsbn: "8232025"
  },
  {
    title: "Точка нуль",
    author: "Артем Чех",
    year: 2017,
    language: "Ukrainian",
    genres: ["Biography / Memoir", "History"],
    description: "Чесні та пронизливі фронтові нотатки солдата ЗСУ про передову, армійський побут та психологію війни.",
    coverIdOrIsbn: "8232028"
  },
  {
    title: "Хто ти такий?",
    author: "Артем Чех",
    year: 2021,
    language: "Ukrainian",
    genres: ["Fiction", "Biography / Memoir"],
    description: "Автобіографічний роман дорослішання у Черкасах 90-х років та дружби з ветераном війни в Афганістані Феліксом.",
    coverIdOrIsbn: "8232032"
  },
  {
    title: "Чорна рада",
    author: "Пантелеймон Куліш",
    year: 1857,
    language: "Ukrainian",
    genres: ["History", "Classic Literature", "Romance / Novel"],
    description: "Перший український історичний роман про бурхливі події Ніжинської ради 1663 року та боротьбу за гетьманство.",
    coverIdOrIsbn: "8232035"
  },
  {
    title: "Хіба ревуть воли, як ясла повні?",
    author: "Панас Мирний",
    year: 1880,
    language: "Ukrainian",
    genres: ["Classic Literature", "Fiction", "History"],
    description: "Соціально-психологічний роман про перетворення правдошукача Чіпки Варениченка на розбійника.",
    coverIdOrIsbn: "8232040"
  },
  {
    title: "Камінний хрест",
    author: "Василь Стефаник",
    year: 1900,
    language: "Ukrainian",
    genres: ["Classic Literature", "Philosophy"],
    description: "Експресіоністична новела про трагедію еміграції галицьких селян до далекої Канади.",
    coverIdOrIsbn: "8232045"
  },
  {
    title: "Записки кирпатого Мефістофеля",
    author: "Володимир Винниченко",
    year: 1917,
    language: "Ukrainian",
    genres: ["Classic Literature", "Romance / Novel", "Philosophy"],
    description: "Психологічний роман про адвоката Якова Михайлюка, цинізм, батьківство та моральні дилеми.",
    coverIdOrIsbn: "8232050"
  },
  {
    title: "Мина Мазайло",
    author: "Микола Куліш",
    year: 1929,
    language: "Ukrainian",
    genres: ["Classic Literature", "Fiction"],
    description: "Блискуча сатирична комедія доби українізації про харківського службовця, який соромиться свого прізвища.",
    coverIdOrIsbn: "8232055"
  },
  {
    title: "Червоний",
    author: "Андрій Кокотюха",
    year: 2012,
    language: "Ukrainian",
    genres: ["History", "Adventure", "Fiction"],
    description: "Гостросюжетний роман про командира УПА Данила Червоного, який піднімає повстання у сталінському концтаборі.",
    coverIdOrIsbn: "8232060"
  },

  // ENGLISH & WORLD CLASSICS
  {
    title: "1984",
    author: "George Orwell",
    year: 1949,
    language: "English",
    genres: ["Sci-Fi", "Classic Literature", "Philosophy"],
    description: "The definitive dystopian novel exploring surveillance, totalitarian rule, Big Brother, and the erasure of individual thought.",
    coverIdOrIsbn: "8575743"
  },
  {
    title: "Animal Farm",
    author: "George Orwell",
    year: 1945,
    language: "English",
    genres: ["Classic Literature", "Fiction", "Philosophy"],
    description: "A timeless political allegorical novella detailing how an animal revolution slips into oppressive tyranny.",
    coverIdOrIsbn: "8225261"
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    year: 1932,
    language: "English",
    genres: ["Sci-Fi", "Classic Literature", "Philosophy"],
    description: "Visionary masterpiece warning against consumerist sedation, caste genetics, and loss of humanity.",
    coverIdOrIsbn: "8754162"
  },
  {
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    year: 1953,
    language: "English",
    genres: ["Sci-Fi", "Classic Literature"],
    description: "A haunting portrait of a book-burning future where Guy Montag discovers the subversive power of literature.",
    coverIdOrIsbn: "10521270"
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    language: "English",
    genres: ["Fantasy", "Adventure", "Children's Literature"],
    description: "The enchanting journey of Bilbo Baggins to reclaim the Lonely Mountain and its treasure from Smaug.",
    coverIdOrIsbn: "8406786"
  },
  {
    title: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    year: 1954,
    language: "English",
    genres: ["Fantasy", "Adventure", "Classic Literature"],
    description: "The epic quest begins as Frodo Baggins sets out to cast the One Ring into Mount Doom.",
    coverIdOrIsbn: "8231991"
  },
  {
    title: "The Two Towers",
    author: "J.R.R. Tolkien",
    year: 1954,
    language: "English",
    genres: ["Fantasy", "Adventure"],
    description: "The fellowship is broken, Frodo and Sam travel with Gollum, while Aragorn battles at Helm's Deep.",
    coverIdOrIsbn: "8231993"
  },
  {
    title: "The Return of the King",
    author: "J.R.R. Tolkien",
    year: 1955,
    language: "English",
    genres: ["Fantasy", "Adventure"],
    description: "The final confrontation for Middle-earth at the Pelennor Fields and the destruction of the Ring.",
    coverIdOrIsbn: "8231994"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    language: "English",
    genres: ["Sci-Fi", "Adventure", "Philosophy"],
    description: "The sweeping space opera of Paul Atreides, Arrakis, spice melange, and planetary ecology.",
    coverIdOrIsbn: "8931215"
  },
  {
    title: "Dune Messiah",
    author: "Frank Herbert",
    year: 1969,
    language: "English",
    genres: ["Sci-Fi", "Philosophy"],
    description: "Paul Muad'Dib grapples with the uncontrollable consequences of his galactic holy war.",
    coverIdOrIsbn: "8931218"
  },
  {
    title: "Children of Dune",
    author: "Frank Herbert",
    year: 1976,
    language: "English",
    genres: ["Sci-Fi", "Philosophy"],
    description: "Leto II and Ghanima navigate spice addiction and political intrigue to forge the Golden Path.",
    coverIdOrIsbn: "8931220"
  },
  {
    title: "Foundation",
    author: "Isaac Asimov",
    year: 1951,
    language: "English",
    genres: ["Sci-Fi", "Classic Literature"],
    description: "Hari Seldon pioneers psychohistory to preserve knowledge across the dark age of the Galactic Empire.",
    coverIdOrIsbn: "8235287"
  },
  {
    title: "Foundation and Empire",
    author: "Isaac Asimov",
    year: 1952,
    language: "English",
    genres: ["Sci-Fi"],
    description: "The Foundation confronts the dying might of the Empire and the mysterious psychic power of the Mule.",
    coverIdOrIsbn: "8235290"
  },
  {
    title: "Second Foundation",
    author: "Isaac Asimov",
    year: 1953,
    language: "English",
    genres: ["Sci-Fi"],
    description: "The secretive mentalics of the Second Foundation guide galactic history from the shadows.",
    coverIdOrIsbn: "8235295"
  },
  {
    title: "Do Androids Dream of Electric Sheep?",
    author: "Philip K. Dick",
    year: 1968,
    language: "English",
    genres: ["Sci-Fi", "Philosophy"],
    description: "Bounty hunter Rick Deckard tracks rogue replicants in post-apocalyptic San Francisco.",
    coverIdOrIsbn: "8235300"
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    year: 1984,
    language: "English",
    genres: ["Sci-Fi"],
    description: "The seminal cyberpunk novel introducing cyberspace, console cowboys, and artificial superintelligence.",
    coverIdOrIsbn: "8235305"
  },
  {
    title: "A Game of Thrones",
    author: "George R.R. Martin",
    year: 1996,
    language: "English",
    genres: ["Fantasy", "Adventure"],
    description: "Noble houses vie for the Iron Throne of Westeros while an ancient menace awakens in the north.",
    coverIdOrIsbn: "8235310"
  },
  {
    title: "A Clash of Kings",
    author: "George R.R. Martin",
    year: 1998,
    language: "English",
    genres: ["Fantasy", "Adventure"],
    description: "Five kings wage brutal war across Westeros as a red comet burns across the sky.",
    coverIdOrIsbn: "8235315"
  },
  {
    title: "A Storm of Swords",
    author: "George R.R. Martin",
    year: 2000,
    language: "English",
    genres: ["Fantasy", "Adventure"],
    description: "The War of the Five Kings reaches its shocking climax with betrayal, royal weddings, and wall battles.",
    coverIdOrIsbn: "8235320"
  },
  {
    title: "American Gods",
    author: "Neil Gaiman",
    year: 2001,
    language: "English",
    genres: ["Fantasy", "Fiction"],
    description: "Shadow Moon is caught in an impending war between mythological gods and modern obsessions.",
    coverIdOrIsbn: "8235325"
  },
  {
    title: "Neverwhere",
    author: "Neil Gaiman",
    year: 1996,
    language: "English",
    genres: ["Fantasy", "Adventure"],
    description: "Richard Mayhew discovers the hidden, treacherous underworld of London Below.",
    coverIdOrIsbn: "8235330"
  },
  {
    title: "The Shining",
    author: "Stephen King",
    year: 1977,
    language: "English",
    genres: ["Thriller / Horror", "Fiction"],
    description: "Jack Torrance becomes caretaker of the secluded Overlook Hotel as malevolent spirits take hold.",
    coverIdOrIsbn: "8235335"
  },
  {
    title: "It",
    author: "Stephen King",
    year: 1986,
    language: "English",
    genres: ["Thriller / Horror", "Fiction"],
    description: "The Losers' Club reunites twenty-seven years later to destroy the shape-shifting evil beneath Derry.",
    coverIdOrIsbn: "8235340"
  },
  {
    title: "Misery",
    author: "Stephen King",
    year: 1987,
    language: "English",
    genres: ["Thriller / Horror", "Detective / Mystery"],
    description: "Novelist Paul Sheldon is rescued from a blizzard by his obsessive number-one fan Annie Wilkes.",
    coverIdOrIsbn: "8235345"
  },
  {
    title: "The Stand",
    author: "Stephen King",
    year: 1978,
    language: "English",
    genres: ["Thriller / Horror", "Sci-Fi", "Fantasy"],
    description: "Survivors of a weaponized super-flu divide into camps of good and evil for a final showdown.",
    coverIdOrIsbn: "8235350"
  },
  {
    title: "A Study in Scarlet",
    author: "Arthur Conan Doyle",
    year: 1887,
    language: "English",
    genres: ["Detective / Mystery", "Classic Literature"],
    description: "The legendary first meeting between Dr. John Watson and Sherlock Holmes solving a poison riddle.",
    coverIdOrIsbn: "8235355"
  },
  {
    title: "The Hound of the Baskervilles",
    author: "Arthur Conan Doyle",
    year: 1902,
    language: "English",
    genres: ["Detective / Mystery", "Classic Literature", "Thriller / Horror"],
    description: "Sherlock Holmes and Watson investigate a demonic phantom hound on the eerie Dartmoor moors.",
    coverIdOrIsbn: "8235360"
  },
  {
    title: "Murder on the Orient Express",
    author: "Agatha Christie",
    year: 1934,
    language: "English",
    genres: ["Detective / Mystery", "Classic Literature"],
    description: "Hercule Poirot must solve the murder of an American tycoon trapped in a snowbound train.",
    coverIdOrIsbn: "8235365"
  },
  {
    title: "And Then There Were None",
    author: "Agatha Christie",
    year: 1939,
    language: "English",
    genres: ["Detective / Mystery", "Thriller / Horror"],
    description: "Ten strangers invited to an isolated island are eliminated one by one in rhyme.",
    coverIdOrIsbn: "8235370"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    language: "English",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "A poignant portrait of Jazz Age glamour, unrequited love, and the disillusionment of the American Dream.",
    coverIdOrIsbn: "8432047"
  },
  {
    title: "The Old Man and the Sea",
    author: "Ernest Hemingway",
    year: 1952,
    language: "English",
    genres: ["Classic Literature", "Adventure", "Philosophy"],
    description: "Santiago's relentless solitary struggle against a giant marlin far out in the Gulf Stream.",
    coverIdOrIsbn: "8235375"
  },
  {
    title: "For Whom the Bell Tolls",
    author: "Ernest Hemingway",
    year: 1940,
    language: "English",
    genres: ["Classic Literature", "History", "Adventure"],
    description: "Robert Jordan's three harrowing days with anti-fascist guerrillas during the Spanish Civil War.",
    coverIdOrIsbn: "8235380"
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    year: 1951,
    language: "English",
    genres: ["Classic Literature", "Fiction"],
    description: "Holden Caulfield's iconic wandering through New York City battling phoniness and alienation.",
    coverIdOrIsbn: "8226191"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    year: 1960,
    language: "English",
    genres: ["Classic Literature", "Fiction"],
    description: "Atticus Finch defends a wrongly accused man in Depression-era Alabama, seen through Scout's eyes.",
    coverIdOrIsbn: "8225261"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
    language: "English",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "The sharp-witted Elizabeth Bennet clashes with the proud Mr. Darcy in Regency England.",
    coverIdOrIsbn: "8231856"
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
    language: "English",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "An orphaned governess fights for dignity, independence, and love with the brooding Mr. Rochester.",
    coverIdOrIsbn: "8235385"
  },
  {
    title: "Wuthering Heights",
    author: "Emily Brontë",
    year: 1847,
    language: "English",
    genres: ["Classic Literature", "Romance / Novel", "Thriller / Horror"],
    description: "The tempestuous and destructive passion between Heathcliff and Catherine on the Yorkshire moors.",
    coverIdOrIsbn: "8235390"
  },
  {
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    year: 1890,
    language: "English",
    genres: ["Classic Literature", "Philosophy", "Thriller / Horror"],
    description: "A decadent young man stays eternally youthful while his portrait bears the ugly scars of his sins.",
    coverIdOrIsbn: "8235395"
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    year: 1818,
    language: "English",
    genres: ["Classic Literature", "Sci-Fi", "Thriller / Horror"],
    description: "Victor Frankenstein reanimates lifeless flesh, unleashing a creature seeking companionship and revenge.",
    coverIdOrIsbn: "8235400"
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    year: 1897,
    language: "English",
    genres: ["Classic Literature", "Thriller / Horror"],
    description: "Count Dracula relocates from Transylvania to England to spread the curse of the undead.",
    coverIdOrIsbn: "8235405"
  },
  {
    title: "The Road",
    author: "Cormac McCarthy",
    year: 2006,
    language: "English",
    genres: ["Fiction", "Sci-Fi", "Philosophy"],
    description: "A father and son walk through burned America, carrying the fire of humanity amidst ash and ruins.",
    coverIdOrIsbn: "8235410"
  },
  {
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    year: 1985,
    language: "English",
    genres: ["Sci-Fi", "Fiction"],
    description: "Offred recounts life in the Republic of Gilead, a religious autocracy that subjugates women.",
    coverIdOrIsbn: "8235415"
  },
  {
    title: "Never Let Me Go",
    author: "Kazuo Ishiguro",
    year: 2005,
    language: "English",
    genres: ["Sci-Fi", "Romance / Novel", "Philosophy"],
    description: "Kathy, Tommy, and Ruth grow up at Hailsham school, slowly uncovering the truth of their existence.",
    coverIdOrIsbn: "8235420"
  },
  {
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    year: 1987,
    language: "English",
    genres: ["Fiction", "Romance / Novel"],
    description: "Toru Watanabe reflects on youth, suicide, and profound nostalgia in 1960s Tokyo.",
    coverIdOrIsbn: "8235425"
  },
  {
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    year: 2002,
    language: "English",
    genres: ["Fantasy", "Fiction", "Philosophy"],
    description: "A runaway teenager and an elderly man who speaks with cats cross paths in a world of surreal wonders.",
    coverIdOrIsbn: "8235430"
  },

  // FRENCH LITERATURE
  {
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    year: 1943,
    language: "French",
    genres: ["Classic Literature", "Philosophy", "Children's Literature"],
    description: "Conte poétique et philosophique explorant l'amitié, l'amour et ce qui est invisible pour les yeux.",
    coverIdOrIsbn: "8235111"
  },
  {
    title: "L'Étranger",
    author: "Albert Camus",
    year: 1942,
    language: "French",
    genres: ["Philosophy", "Classic Literature"],
    description: "Meursault tue un homme sur une plage d'Alger et affronte l'absurdité de la justice humaine.",
    coverIdOrIsbn: "8232150"
  },
  {
    title: "La Peste",
    author: "Albert Camus",
    year: 1947,
    language: "French",
    genres: ["Philosophy", "Classic Literature", "Fiction"],
    description: "Chronique héroïque de solidarité humaine face au fléau mortel qui frappe la ville d'Oran.",
    coverIdOrIsbn: "8232152"
  },
  {
    title: "Les Misérables",
    author: "Victor Hugo",
    year: 1862,
    language: "French",
    genres: ["Classic Literature", "History", "Romance / Novel"],
    description: "L'épopée monumentale de Jean Valjean, Javert, Cosette et Gavroche dans le Paris révolutionnaire.",
    coverIdOrIsbn: "8232155"
  },
  {
    title: "Notre-Dame de Paris",
    author: "Victor Hugo",
    year: 1831,
    language: "French",
    genres: ["Classic Literature", "History", "Romance / Novel"],
    description: "Le drame gothique d'Esméralda, Quasimodo et Claude Frollo au cœur de la cathédrale médiévale.",
    coverIdOrIsbn: "8232160"
  },
  {
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    year: 1844,
    language: "French",
    genres: ["Classic Literature", "Adventure"],
    description: "Edmond Dantès s'échappe du château d'If pour orchestrer une vengeance implacable contre ses traîtres.",
    coverIdOrIsbn: "8232165"
  },
  {
    title: "Les Trois Mousquetaires",
    author: "Alexandre Dumas",
    year: 1844,
    language: "French",
    genres: ["Classic Literature", "Adventure"],
    description: "Les prouesses de d'Artagnan, Athos, Porthos et Aramis pour sauver l'honneur de la reine de France.",
    coverIdOrIsbn: "8232170"
  },
  {
    title: "Madame Bovary",
    author: "Gustave Flaubert",
    year: 1857,
    language: "French",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "Emma Bovary cherche à fuir la banalité provinciale à travers des liaisons amoureuses destructrices.",
    coverIdOrIsbn: "8232188"
  },
  {
    title: "Du côté de chez Swann",
    author: "Marcel Proust",
    year: 1913,
    language: "French",
    genres: ["Classic Literature", "Philosophy", "Romance / Novel"],
    description: "Le premier volet d'À la recherche du temps perdu, le souvenir de Combray et la madeleine.",
    coverIdOrIsbn: "8232190"
  },
  {
    title: "Germinal",
    author: "Émile Zola",
    year: 1885,
    language: "French",
    genres: ["Classic Literature", "Fiction", "History"],
    description: "La grande révolte des mineurs de charbon du Nord emmenés par Étienne Lantier pour leur survie.",
    coverIdOrIsbn: "8232195"
  },
  {
    title: "Vingt mille lieues sous les mers",
    author: "Jules Verne",
    year: 1870,
    language: "French",
    genres: ["Classic Literature", "Sci-Fi", "Adventure"],
    description: "L'exploration des fonds marins à bord du sous-marin Nautilus sous les ordres du mystérieux capitaine Nemo.",
    coverIdOrIsbn: "8232200"
  },
  {
    title: "Le Tour du monde en quatre-vingts jours",
    author: "Jules Verne",
    year: 1872,
    language: "French",
    genres: ["Classic Literature", "Adventure"],
    description: "Le pari audacieux de Phileas Fogg et son fidèle Passepartout pour boucler le globe en 80 jours.",
    coverIdOrIsbn: "8232205"
  },

  // GERMAN LITERATURE & PHILOSOPHY
  {
    title: "Der Steppenwolf",
    author: "Hermann Hesse",
    year: 1927,
    language: "German",
    genres: ["Philosophy", "Classic Literature", "Fiction"],
    description: "Die Zerrissenheit von Harry Haller zwischen bürgerlichem Intellekt und der ungezähmten Natur des Steppenwolfs.",
    coverIdOrIsbn: "8235287"
  },
  {
    title: "Siddhartha",
    author: "Hermann Hesse",
    year: 1922,
    language: "German",
    genres: ["Philosophy", "Classic Literature"],
    description: "Die spirituelle Reise eines jungen indischen Brahmanen auf der Suche nach Erleuchtung und innerem Frieden.",
    coverIdOrIsbn: "8235289"
  },
  {
    title: "Demian",
    author: "Hermann Hesse",
    year: 1919,
    language: "German",
    genres: ["Philosophy", "Fiction"],
    description: "Emil Sinclairs innere Wandlung unter dem faszinierenden Einfluss seines Schulfreundes Max Demian.",
    coverIdOrIsbn: "8235292"
  },
  {
    title: "Die Verwandlung",
    author: "Franz Kafka",
    year: 1915,
    language: "German",
    genres: ["Classic Literature", "Philosophy"],
    description: "Gregor Samsa erwacht eines Morgens zu einem ungeheuren Ungeziefer verwandelt und erlebt die Entfremdung.",
    coverIdOrIsbn: "8232100"
  },
  {
    title: "Der Process",
    author: "Franz Kafka",
    year: 1925,
    language: "German",
    genres: ["Classic Literature", "Philosophy", "Detective / Mystery"],
    description: "Josef K. wird ohne erkennbaren Grund verhaftet und in das undurchdringliche Labyrinth der Justiz verstrickt.",
    coverIdOrIsbn: "8232102"
  },
  {
    title: "Faust",
    author: "Johann Wolfgang von Goethe",
    year: 1808,
    language: "German",
    genres: ["Classic Literature", "Philosophy", "Poetry"],
    description: "Die monumentale Tragödie des Gelehrten Heinrich Faust und sein Pakt mit dem Teufel Mephistopheles.",
    coverIdOrIsbn: "8232104"
  },
  {
    title: "Im Westen nichts Neues",
    author: "Erich Maria Remarque",
    year: 1929,
    language: "German",
    genres: ["Classic Literature", "History", "Fiction"],
    description: "Das schonungslose Antikriegswerk über die Schrecken und Entmenschlichung der Schützengräben im Ersten Weltkrieg.",
    coverIdOrIsbn: "8232110"
  },
  {
    title: "Drei Kameraden",
    author: "Erich Maria Remarque",
    year: 1936,
    language: "German",
    genres: ["Classic Literature", "Romance / Novel", "Fiction"],
    description: "Freundschaft dreier Kriegsheimkehrer und die ergreifende Liebe zwischen Robert und der unheilbar kranken Pat.",
    coverIdOrIsbn: "8232115"
  },
  {
    title: "Der Zauberberg",
    author: "Thomas Mann",
    year: 1924,
    language: "German",
    genres: ["Classic Literature", "Philosophy"],
    description: "Hans Castorps siebenjähriger Aufenthalt in einem Schweizer Sanatorium als Spiegelbild der europäischen Kulturkrise.",
    coverIdOrIsbn: "8232120"
  },
  {
    title: "Also sprach Zarathustra",
    author: "Friedrich Nietzsche",
    year: 1883,
    language: "German",
    genres: ["Philosophy", "Classic Literature", "Poetry"],
    description: "Nietzsches visionäre philosophische Dichtung über den Übermenschen und die ewige Wiederkehr des Gleichen.",
    coverIdOrIsbn: "8232130"
  },
  {
    title: "Jenseits von Gut und Böse",
    author: "Friedrich Nietzsche",
    year: 1886,
    language: "German",
    genres: ["Philosophy"],
    description: "Eine radikale Kritik der traditionellen Moral, der Metaphysik und die Grundlegung des Willens zur Macht.",
    coverIdOrIsbn: "8232001"
  },
  {
    title: "Das Parfum",
    author: "Patrick Süskind",
    year: 1985,
    language: "German",
    genres: ["Fiction", "Thriller / Horror", "Detective / Mystery"],
    description: "Jean-Baptiste Grenouilles Besessenheit, den vollkommenen Duft junger Mädchen im Frankreich des 18. Jahrhunderts zu destillieren.",
    coverIdOrIsbn: "8232140"
  },

  // POLISH LITERATURE
  {
    title: "Solaris",
    author: "Stanisław Lem",
    year: 1961,
    language: "Polish",
    genres: ["Sci-Fi", "Philosophy"],
    description: "Klasyczna powieść science fiction o próbie kontaktu ludzkich naukowców z żyjącym, myślącym oceanem obcej planety.",
    coverIdOrIsbn: "8232300"
  },
  {
    title: "Cyberiada",
    author: "Stanisław Lem",
    year: 1965,
    language: "Polish",
    genres: ["Sci-Fi", "Philosophy", "Children's Literature"],
    description: "Fascynujące i pełne humoru opowieści o genialnych konstruktorach Trurlu i Klapaucjuszu budujących wszechświaty.",
    coverIdOrIsbn: "8232305"
  },
  {
    title: "Ostatnie życzenie",
    author: "Andrzej Sapkowski",
    year: 1993,
    language: "Polish",
    genres: ["Fantasy", "Adventure"],
    description: "Początek sagi o wiedźminie Geralcie z Rivii, polującym na potwory w świecie, gdzie zło bywa mniejsze i większe.",
    coverIdOrIsbn: "8232350"
  },
  {
    title: "Miecz przeznaczenia",
    author: "Andrzej Sapkowski",
    year: 1992,
    language: "Polish",
    genres: ["Fantasy", "Adventure"],
    description: "Zbiór opowiadań ukazujący pierwsze spotkanie Geralta z dzieckiem niespodzianką — księżniczką Ciri z Cintry.",
    coverIdOrIsbn: "8232355"
  },
  {
    title: "Krew elfów",
    author: "Andrzej Sapkowski",
    year: 1994,
    language: "Polish",
    genres: ["Fantasy", "Adventure"],
    description: "Pierwsza powieść wiedzmińskiej sagi o szkoleniu Ciri w Kaer Morhen i rosnącym zagrożeniu wojną z Nilfgaardem.",
    coverIdOrIsbn: "8232360"
  },
  {
    title: "Bieguni",
    author: "Olga Tokarczuk",
    year: 2007,
    language: "Polish",
    genres: ["Fiction", "Philosophy"],
    description: "Nagrodzona Międzynarodowym Bookerem powieść konstelacyjna o podróży, anatomii ciała i współczesnym koczownictwie.",
    coverIdOrIsbn: "8232370"
  },
  {
    title: "Prowadź swój pług przez kości umarłych",
    author: "Olga Tokarczuk",
    year: 2009,
    language: "Polish",
    genres: ["Detective / Mystery", "Fiction", "Philosophy"],
    description: "Mroczny i błyskotliwy kryminał moralny o Janinie Duszejko i tajemniczych zgonach myśliwych w Kotlinie Kłodzkiej.",
    coverIdOrIsbn: "8232375"
  },
  {
    title: "Pan Tadeusz",
    author: "Adam Mickiewicz",
    year: 1834,
    language: "Polish",
    genres: ["Classic Literature", "Poetry", "History"],
    description: "Polska epopeja narodowa ukazująca szlachecki dwór w Soplicowie, spory rodowe i nadzieje na wolność z Napoleonem.",
    coverIdOrIsbn: "8232400"
  },
  {
    title: "Quo Vadis",
    author: "Henryk Sienkiewicz",
    year: 1896,
    language: "Polish",
    genres: ["Classic Literature", "History", "Romance / Novel"],
    description: "Nagrodzona Noblem powieść historyczna o miłości patrycjusza Winicjusza i chrześcijanki Ligii w płonącym Rzymie Nerona.",
    coverIdOrIsbn: "8232405"
  },
  {
    title: "Ogniem i mieczem",
    author: "Henryk Sienkiewicz",
    year: 1884,
    language: "Polish",
    genres: ["Classic Literature", "History", "Adventure"],
    description: "Epicka powieść awanturnicza z czasów powstania Bohdana Chmielnickiego w XVII-wiecznej Rzeczypospolitej.",
    coverIdOrIsbn: "8232410"
  },

  // SPANISH & LATIN AMERICAN LITERATURE
  {
    title: "Don Quijote de la Mancha",
    author: "Miguel de Cervantes",
    year: 1605,
    language: "Spanish",
    genres: ["Classic Literature", "Adventure"],
    description: "Las inmortales andanzas del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza contra molinos de viento.",
    coverIdOrIsbn: "8232210"
  },
  {
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    year: 1967,
    language: "Spanish",
    genres: ["Classic Literature", "Fantasy", "Fiction"],
    description: "La cumbre del realismo mágico: la saga de siete generaciones de la familia Buendía en el mítico pueblo de Macondo.",
    coverIdOrIsbn: "8232250"
  },
  {
    title: "El amor en los tiempos del cólera",
    author: "Gabriel García Márquez",
    year: 1985,
    language: "Spanish",
    genres: ["Classic Literature", "Romance / Novel"],
    description: "La paciente y apasionada devoción de Florentino Ariza esperando más de medio siglo el amor de Fermina Daza.",
    coverIdOrIsbn: "8232255"
  },
  {
    title: "Crónica de una muerte anunciada",
    author: "Gabriel García Márquez",
    year: 1981,
    language: "Spanish",
    genres: ["Detective / Mystery", "Classic Literature"],
    description: "La reconstrucción periodística y literaria del asesinato premeditado de Santiago Nasar que todo el pueblo conocía.",
    coverIdOrIsbn: "8232260"
  },
  {
    title: "Ficciones",
    author: "Jorge Luis Borges",
    year: 1944,
    language: "Spanish",
    genres: ["Fiction", "Philosophy", "Fantasy"],
    description: "Colección magistral de laberintos, bibliotecas infinitas, espejos y enigmas metafísicos.",
    coverIdOrIsbn: "8232270"
  },
  {
    title: "Rayuela",
    author: "Julio Cortázar",
    year: 1963,
    language: "Spanish",
    genres: ["Fiction", "Philosophy", "Romance / Novel"],
    description: "Novela contranovelística revolucionaria que puede leerse de múltiples formas a través de París y Buenos Aires.",
    coverIdOrIsbn: "8232275"
  },
  {
    title: "La sombra del viento",
    author: "Carlos Ruiz Zafón",
    year: 2001,
    language: "Spanish",
    genres: ["Detective / Mystery", "Romance / Novel", "Adventure"],
    description: "Daniel Sempere descubre en el Cementerio de los Libros Olvidados de Barcelona un misterio lleno de secretos oscuros.",
    coverIdOrIsbn: "8232280"
  },

  // ITALIAN LITERATURE
  {
    title: "Divina Commedia",
    author: "Dante Alighieri",
    year: 1320,
    language: "Italian",
    genres: ["Classic Literature", "Poetry", "Philosophy"],
    description: "Il viaggio allegorico attraverso Inferno, Purgatorio e Paradiso guidato da Virgilio e Beatrice.",
    coverIdOrIsbn: "8232450"
  },
  {
    title: "Il nome della rosa",
    author: "Umberto Eco",
    year: 1980,
    language: "Italian",
    genres: ["Detective / Mystery", "History", "Philosophy"],
    description: "Guglielmo da Baskerville indaga su una serie di misteriosi delitti in un'abbazia benedettina del XIV secolo.",
    coverIdOrIsbn: "8232455"
  },
  {
    title: "Il pendolo di Foucault",
    author: "Umberto Eco",
    year: 1988,
    language: "Italian",
    genres: ["Detective / Mystery", "Philosophy", "Fiction"],
    description: "Tre redattori creano per gioco un gigantesco complotto ermetico che finisce per prendere vita.",
    coverIdOrIsbn: "8232460"
  },
  {
    title: "Le città invisibili",
    author: "Italo Calvino",
    year: 1972,
    language: "Italian",
    genres: ["Fiction", "Philosophy", "Poetry"],
    description: "I dialoghi poetici tra Marco Polo e l'imperatore Kublai Khan sulle meraviglie delle città dell'immaginazione.",
    coverIdOrIsbn: "8232465"
  },
  {
    title: "L'amica geniale",
    author: "Elena Ferrante",
    year: 2011,
    language: "Italian",
    genres: ["Fiction", "Romance / Novel"],
    description: "L'intensa amicizia di oltre cinquant'anni tra Elena e Lila in un rione popolare di Napoli.",
    coverIdOrIsbn: "8232470"
  },

  // WORLD NON-FICTION, PHILOSOPHY, PSYCHOLOGY & SCIENCE
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    language: "English",
    genres: ["History", "Science / Non-Fiction", "Philosophy"],
    description: "An exhilarating exploration of how an insignificant ape became the master of planet Earth.",
    coverIdOrIsbn: "8314120"
  },
  {
    title: "Homo Deus: A Brief History of Tomorrow",
    author: "Yuval Noah Harari",
    year: 2015,
    language: "English",
    genres: ["Philosophy", "Science / Non-Fiction", "History"],
    description: "Provocative examination of future dreams, artificial intelligence, and the destiny of humanity.",
    coverIdOrIsbn: "8314125"
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    year: 2011,
    language: "English",
    genres: ["Psychology / Self-Help", "Science / Non-Fiction", "Business / Finance"],
    description: "Nobel laureate Kahneman reveals the dual systems of human intuition, bias, and decision-making.",
    coverIdOrIsbn: "8235456"
  },
  {
    title: "Antifragile: Things That Gain from Disorder",
    author: "Nassim Nicholas Taleb",
    year: 2012,
    language: "English",
    genres: ["Philosophy", "Business / Finance", "Science / Non-Fiction"],
    description: "How certain systems, businesses, and people thrive under volatility, stress, and uncertainty.",
    coverIdOrIsbn: "8235460"
  },
  {
    title: "The Black Swan",
    author: "Nassim Nicholas Taleb",
    year: 2007,
    language: "English",
    genres: ["Philosophy", "Business / Finance", "Science / Non-Fiction"],
    description: "The impact of highly improbable, massive-consequence events and our collective blindness to them.",
    coverIdOrIsbn: "8235465"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    language: "English",
    genres: ["Psychology / Self-Help", "Business / Finance"],
    description: "An easy and proven way to build good habits, break bad ones, and achieve remarkable results.",
    coverIdOrIsbn: "12843589"
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    year: 180,
    language: "English",
    genres: ["Philosophy", "Classic Literature"],
    description: "The personal private journal of the Roman Emperor practicing Stoic mindfulness, virtue, and resilience.",
    coverIdOrIsbn: "8231923"
  },
  {
    title: "Letters from a Stoic",
    author: "Seneca",
    year: 65,
    language: "English",
    genres: ["Philosophy", "Classic Literature"],
    description: "Timeless ethical counsel on overcoming fear, handling grief, living simply, and finding tranquil peace.",
    coverIdOrIsbn: "8231926"
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    year: 1946,
    language: "English",
    genres: ["Psychology / Self-Help", "Philosophy", "Biography / Memoir"],
    description: "Psychiatrist Frankl's harrowing experience in Nazi concentration camps and the birth of logotherapy.",
    coverIdOrIsbn: "8235470"
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    language: "English",
    genres: ["Science / Non-Fiction", "Philosophy"],
    description: "Landmark book explaining the Big Bang, black holes, light cones, and the nature of space-time.",
    coverIdOrIsbn: "8235475"
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    year: 1980,
    language: "English",
    genres: ["Science / Non-Fiction", "Philosophy"],
    description: "Lyrical and awe-inspiring scientific journey through the fifteen billion years of cosmic evolution.",
    coverIdOrIsbn: "8235480"
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    year: 1976,
    language: "English",
    genres: ["Science / Non-Fiction", "Philosophy"],
    description: "Gene-centric view of evolution introducing the concept of the meme and natural selection dynamics.",
    coverIdOrIsbn: "8235485"
  },
  {
    title: "The 48 Laws of Power",
    author: "Robert Greene",
    year: 1998,
    language: "English",
    genres: ["Psychology / Self-Help", "History", "Business / Finance"],
    description: "Amoral, cunning, and ruthless distilled wisdom of three thousand years of history and power struggle.",
    coverIdOrIsbn: "8235490"
  },
  {
    title: "The Prince",
    author: "Niccolò Machiavelli",
    year: 1532,
    language: "English",
    genres: ["Philosophy", "History", "Classic Literature"],
    description: "Pragmatic treatise on statecraft, political survival, and the cold realities of gaining and holding power.",
    coverIdOrIsbn: "8235495"
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    year: -500,
    language: "English",
    genres: ["Philosophy", "History", "Business / Finance"],
    description: "Ancient Chinese military treatise on deception, strategic positioning, and overcoming conflict without battle.",
    coverIdOrIsbn: "8235500"
  }
];

export function generate1000Books() {
  const users = SEED_USERS;
  const templates = MASTER_CATALOG;
  const books: any[] = [];

  const verifiedCoverPool = [
    "8575743", "8225261", "8754162", "10521270", "8406786", "8231991", "8231993", "8231994",
    "8931215", "8931218", "8931220", "8235287", "8235290", "8235295", "8235300", "8235305",
    "8235310", "8235315", "8235320", "8235325", "8235330", "8235335", "8235340", "8235345",
    "8235350", "8235355", "8235360", "8235365", "8235370", "8432047", "8235375", "8235380",
    "8226191", "8231856", "8235385", "8235390", "8235395", "8235400", "8235405", "8235410",
    "8235415", "8235420", "8235425", "8235430", "8235111", "8232150", "8232152", "8232155",
    "8232160", "8232165", "8232170", "8232188", "8232190", "8232195", "8232200", "8232205",
    "8232100", "8232102", "8232104", "8232110", "8232115", "8232120", "8232130", "8232001",
    "8232140", "8232300", "8232305", "8232350", "8232355", "8232360", "8232370", "8232375",
    "8232400", "8232405", "8232410", "8232210", "8232250", "8232255", "8232260", "8232270",
    "8232275", "8232280", "8232450", "8232455", "8232460", "8232465", "8232470", "8314120",
    "8314125", "8235456", "8235460", "8235465", "12843589", "8231923", "8231926", "8235470",
    "8235475", "8235480", "8235485", "8235490", "8235495", "8235500", "12644214", "8231860"
  ];

  let currentBookIndex = 1;

  for (let cycle = 0; currentBookIndex <= 1000; cycle++) {
    for (let tIdx = 0; tIdx < templates.length && currentBookIndex <= 1000; tIdx++) {
      const tmpl = templates[tIdx];
      const assignedUser = users[(currentBookIndex - 1) % users.length];

      let title = tmpl.title;
      let year = tmpl.year;
      let language = tmpl.language;
      let cover = tmpl.coverIdOrIsbn;

      if (cycle > 0) {
        if (cycle === 1) {
          title = `${tmpl.title} (Видання ${cycle + 1})`;
          year = Math.min(2024, tmpl.year + cycle * 5);
        } else if (cycle === 2) {
          title = `${tmpl.title} (Колекційне видання)`;
          year = Math.min(2024, tmpl.year + cycle * 8);
        } else if (cycle === 3) {
          title = `${tmpl.title} (Ілюстроване видання)`;
          year = Math.min(2024, tmpl.year + cycle * 10);
        } else if (cycle === 4) {
          title = `${tmpl.title} (Повне зібрання)`;
          year = Math.min(2024, tmpl.year + cycle * 12);
        } else if (cycle === 5) {
          title = `${tmpl.title} (Ювілейне видання)`;
          year = Math.min(2024, tmpl.year + cycle * 15);
        } else if (cycle === 6) {
          title = `${tmpl.title} (Том ${((currentBookIndex % 3) + 1)})`;
          year = Math.min(2024, tmpl.year + cycle * 18);
        } else {
          title = `${tmpl.title} (Серія «Світовий бестселер»)`;
          year = Math.min(2024, tmpl.year + cycle * 20);
        }

        const coverChoice = verifiedCoverPool[(currentBookIndex * 13) % verifiedCoverPool.length];
        cover = coverChoice;
      }

      const coverURL = cover.startsWith("978") || cover.startsWith("ISBN")
        ? `https://covers.openlibrary.org/b/isbn/${cover}-L.jpg`
        : `https://covers.openlibrary.org/b/id/${cover}-L.jpg`;

      const genreObjects = tmpl.genres.map((gName) => resolveGenreObj(gName));

      books.push({
        id: toBookUuid(currentBookIndex),
        title,
        author: tmpl.author,
        year: year > 0 ? year : 1900,
        language,
        genres: genreObjects,
        description: tmpl.description,
        coverURL,
        userId: assignedUser.id,
        isForTrade: (currentBookIndex % 15 !== 0), // ~93% for trade, ~7% personal
        user: {
          id: assignedUser.id,
          username: assignedUser.username,
          photoURL: assignedUser.photoURL,
          city: assignedUser.city,
          latitude: assignedUser.latitude,
          longitude: assignedUser.longitude,
        }
      });

      currentBookIndex++;
    }
  }

  return books;
}

async function build() {
  console.log('Generating 1000 books and users dataset...');
  const books = generate1000Books();
  console.log(`Generated ${books.length} books across ${SEED_USERS.length} users.`);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const fileContent = `/**
 * Automatically generated seed catalog: 1000 books & 75 residential users
 * NO trades included. Real OpenLibrary cover URLs, multilingual titles,
 * and exact residential building coordinates in Ukrainian cities.
 */
import type { MockBook, MockUser } from '../mockBooks.types.js';

export const SEED_GENRES = ${JSON.stringify(Array.from(GENRE_MAP.values()), null, 2)};

export const SEED_USERS_WITH_HASH = ${JSON.stringify(
    SEED_USERS.map((u) => ({
      ...u,
      password: passwordHash,
    })),
    null,
    2
  )};

export interface RawSeedBook {
  id: string;
  title: string;
  author: string;
  year: number;
  language: string;
  genres: { id: string; name: string }[];
  description: string;
  coverURL: string;
  userId: string;
  isForTrade: boolean;
  createdAt: string;
  updatedAt: string;
  user?: MockUser | null;
}

export const RAW_SEED_BOOKS_1000: RawSeedBook[] = ${JSON.stringify(
    books.map((b) => ({
      ...b,
      createdAt: '2023-01-01T12:00:00Z',
      updatedAt: '2023-01-01T12:00:00Z',
    })),
    null,
    2
  )};

export const SEED_BOOKS_1000: MockBook[] = RAW_SEED_BOOKS_1000.map((b) => ({
  ...b,
  createdAt: new Date(b.createdAt),
  updatedAt: new Date(b.updatedAt),
}));
`;

  const outputPath = path.join(process.cwd(), 'server', 'src', 'mocks', 'catalog', 'seed1000Data.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Wrote seed data to ${outputPath} (${(fileContent.length / 1024).toFixed(1)} KB)`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
