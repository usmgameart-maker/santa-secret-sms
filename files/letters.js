// Настройки новой версии. Коды рассчитываются по общей раскладке.
window.GAME = {
  "title": "Алло, Дед Мороз! Расшифруй желание",
  "tagline": "Разгадай секретные SMS и помоги собрать подарки для ребят.",
  "subtitle": "Новогодняя мастерская"
};

window.PHONE_KEYS = [
  {
    "digit": "1",
    "letters": "АБВ"
  },
  {
    "digit": "2",
    "letters": "ГДЕЁ"
  },
  {
    "digit": "3",
    "letters": "ЖЗИЙ"
  },
  {
    "digit": "4",
    "letters": "КЛМ"
  },
  {
    "digit": "5",
    "letters": "НОП"
  },
  {
    "digit": "6",
    "letters": "РСТ"
  },
  {
    "digit": "7",
    "letters": "УФХЦ"
  },
  {
    "digit": "8",
    "letters": "ЧШЩ"
  },
  {
    "digit": "9",
    "letters": "ЪЫЬ"
  },
  {
    "digit": "0",
    "letters": "ЭЮЯ"
  }
];

window.GIFTS = {
  "bricks": {
    "name": "Конструктор",
    "acc": "конструктор",
    "img": "bricks.png"
  },
  "bear": {
    "name": "Мишка",
    "acc": "мишку",
    "img": "bear.png"
  },
  "skates": {
    "name": "Коньки",
    "acc": "коньки",
    "img": "skates.png"
  },
  "puzzles": {
    "name": "Пазлы",
    "acc": "пазлы",
    "img": "puzzles.png"
  },
  "easel": {
    "name": "Мольберт",
    "acc": "мольберт",
    "img": "easel.png"
  },
  "computer": {
    "name": "Компьютер",
    "acc": "компьютер",
    "img": "computer.png"
  },
  "robot": {
    "name": "Робот",
    "acc": "робота",
    "img": "robot.png"
  },
  "sled": {
    "name": "Санки",
    "acc": "санки",
    "img": "sled.png"
  },
  "book": {
    "name": "Книга",
    "acc": "книгу",
    "img": "book.png"
  },
  "doll": {
    "name": "Кукла",
    "acc": "куклу",
    "img": "doll.png"
  },
  "guitar": {
    "name": "Гитара",
    "acc": "гитару",
    "img": "guitar.png"
  },
  "rollers": {
    "name": "Ролики",
    "acc": "ролики",
    "img": "rollers.png"
  },
  "tablet": {
    "name": "Планшет",
    "acc": "планшет",
    "img": "tablet.png"
  },
  "scooter": {
    "name": "Самокат",
    "acc": "самокат",
    "img": "scooter.png"
  },
  "drum": {
    "name": "Барабан",
    "acc": "барабан",
    "img": "drum.png"
  },
  "rcCar": {
    "name": "Машинка",
    "acc": "машинку",
    "img": "rc-car.png"
  },
  "rope": {
    "name": "Скакалка",
    "acc": "скакалку",
    "img": "rope.png"
  },
  "console": {
    "name": "Приставка",
    "acc": "приставку",
    "img": "console.png"
  },
  "skateboard": {
    "name": "Скейтборд",
    "acc": "скейтборд",
    "img": "skateboard.png"
  },
  "bike": {
    "name": "Велосипед",
    "acc": "велосипед",
    "img": "bike.png"
  },
  "paints": {
    "name": "Краски",
    "acc": "краски",
    "img": "paints.png"
  }
};

window.LETTERS = [
  {
    "name": "Алиса",
    "from": "Алисы",
    "gift": "bear"
  },
  {
    "name": "Матвей",
    "from": "Матвея",
    "gift": "book"
  },
  {
    "name": "Ева",
    "from": "Евы",
    "gift": "paints"
  },
  {
    "name": "Тимофей",
    "from": "Тимофея",
    "gift": "sled"
  },
  {
    "name": "Полина",
    "from": "Полины",
    "gift": "robot"
  },
  {
    "name": "Мирон",
    "from": "Мирона",
    "gift": "rope"
  },
  {
    "name": "Лев",
    "from": "Льва",
    "gift": "skates"
  },
  {
    "name": "Ульяна",
    "from": "Ульяны",
    "gift": "easel"
  },
  {
    "name": "Марк",
    "from": "Марка",
    "gift": "drum"
  },
  {
    "name": "Ксюша",
    "from": "Ксюши",
    "gift": "doll"
  },
  {
    "name": "Артём",
    "from": "Артёма",
    "gift": "rcCar"
  },
  {
    "name": "Олеся",
    "from": "Олеси",
    "gift": "guitar"
  },
  {
    "name": "Семён",
    "from": "Семёна",
    "gift": "puzzles"
  },
  {
    "name": "Савелий",
    "from": "Савелия",
    "gift": "bike"
  },
  {
    "name": "Аня",
    "from": "Ани",
    "gift": "bricks"
  }
];

window.STAGES = [
  {
    "title": "Первые желания",
    "short": "Начинаем",
    "replyGift": "bear"
  },
  {
    "title": "Мастерская оживает",
    "short": "Разгадываем",
    "replyGift": "sled"
  },
  {
    "title": "Зимние сюрпризы",
    "short": "Собираем",
    "replyGift": "skates"
  },
  {
    "title": "Подарки для друзей",
    "short": "Радуем",
    "replyGift": "doll"
  },
  {
    "title": "Всё готово к празднику",
    "short": "Завершаем",
    "replyGift": "bricks"
  }
];
