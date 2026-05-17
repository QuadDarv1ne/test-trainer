export type Difficulty = "Легко" | "Средне" | "Сложно";

export type TestCaseCategory =
  | "Нормальное значение"
  | "Граничное значение"
  | "Исключение"
  | "Недопустимый тип";

export interface EquivalenceClass {
  id: string;
  name: string;
  description: string;
  exampleValues: unknown[];
}

export interface BoundaryValue {
  value: unknown;
  description: string;
}

export interface TaskParam {
  name: string;
  type: string;
  description: string;
}

export interface Task {
  id: number;
  name: string;
  difficulty: Difficulty;
  description: string;
  signature: string;
  topics: string[];
  params: TaskParam[];
  returnType: string;
  code: string;
  equivalenceClasses: EquivalenceClass[];
  boundaryValues: BoundaryValue[];
}

// Reference functions
function factorial(n: number): number {
  if (!Number.isInteger(n)) throw new Error("Аргумент должен быть целым числом");
  if (n < 0) throw new Error("Факториал не определён для отрицательных чисел");
  if (n > 20) throw new Error("Переполнение: n > 20");
  if (n === 0) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function isPrime(n: number): boolean {
  if (!Number.isInteger(n)) throw new Error("Аргумент должен быть целым числом");
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function applyDiscount(price: number, discountPercent: number): number {
  if (
    typeof price !== "number" ||
    typeof discountPercent !== "number" ||
    isNaN(price) ||
    isNaN(discountPercent)
  )
    throw new Error("Аргументы должны быть числами");
  if (price < 0) throw new Error("Цена не может быть отрицательной");
  if (discountPercent < 0)
    throw new Error("Скидка не может быть отрицательной");
  if (discountPercent > 100) throw new Error("Скидка не может превышать 100%");
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) throw new Error("Год должен быть целым числом");
  if (year <= 0) throw new Error("Год должен быть положительным");
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function triangleType(
  a: number,
  b: number,
  c: number
): string {
  if ([a, b, c].some((v) => typeof v !== "number" || isNaN(v)))
    throw new Error("Стороны должны быть числами");
  if (a <= 0 || b <= 0 || c <= 0)
    throw new Error("Стороны должны быть положительными");
  if (a + b <= c || a + c <= b || b + c <= a) return "не треугольник";
  if (a === b && b === c) return "равносторонний";
  if (a === b || b === c || a === c) return "равнобедренный";
  return "разносторонний";
}

function validatePassword(
  password: string
): { valid: boolean; errors: string[] } {
  if (typeof password !== "string")
    throw new Error("Пароль должен быть строкой");
  const errors: string[] = [];
  if (password.length < 8) errors.push("Минимум 8 символов");
  if (!/[A-ZА-ЯЁ]/.test(password)) errors.push("Хотя бы одна заглавная буква");
  if (!/[a-zа-яё]/.test(password)) errors.push("Хотя бы одна строчная буква");
  if (!/[0-9]/.test(password)) errors.push("Хотя бы одна цифра");
  if (
    !/[!@#$%^&*()_+\-=\]{};':"\\|,.<>/?[]/.test(password)
  )
    errors.push("Хотя бы один спецсимвол");
  return { valid: errors.length === 0, errors };
}

function stringTransform(
  str1: string,
  str2: string,
  start: number,
  length: number
): string {
  if (typeof str1 !== "string" || typeof str2 !== "string")
    throw new Error("Аргументы должны быть строками");
  if (!Number.isInteger(start)) throw new Error("Начало должно быть целым числом");
  if (!Number.isInteger(length)) throw new Error("Длина должна быть целым числом");
  if (start < 0) throw new Error("Начало не может быть отрицательным");
  if (length < 0) throw new Error("Длина не может быть отрицательной");
  if (start >= str1.length) return str1 + str2;
  const actualLength = Math.min(length, str1.length - start);
  const substring = str1.substring(start, start + actualLength);
  return str1 + str2 + substring;
}

function validateDate(
  day: number,
  month: number,
  year: number
): { valid: boolean; reason?: string } {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year))
    throw new Error("День, месяц и год должны быть целыми числами");
  if (year < 1 || year > 9999) return { valid: false, reason: "Год должен быть от 1 до 9999" };
  if (month < 1 || month > 12) return { valid: false, reason: "Месяц должен быть от 1 до 12" };
  if (day < 1) return { valid: false, reason: "День не может быть меньше 1" };
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return { valid: false, reason: `В месяце ${month} не более ${daysInMonth[month - 1]} дней` };
  return { valid: true };
}

function sortAndFilter(arr: number[]): number[] {
  if (!Array.isArray(arr))
    throw new Error("Аргумент должен быть массивом");
  if (arr.length === 0) return [];
  for (const item of arr) {
    if (typeof item !== "number" || isNaN(item))
      throw new Error("Все элементы должны быть числами");
  }
  if (arr.length > 1000) throw new Error("Массив слишком большой (макс. 1000 элементов)");
  return arr.filter((n) => n >= 0).sort((a, b) => a - b);
}

function validateEmail(email: string): { valid: boolean; reason?: string } {
  if (typeof email !== "string")
    throw new Error("Email должен быть строкой");
  if (email.length === 0) return { valid: false, reason: "Пустая строка" };
  if (email.length > 254) return { valid: false, reason: "Слишком длинный email (макс. 254 символа)" };
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    if (!email.includes("@")) return { valid: false, reason: "Отсутствует символ @" };
    const [local, domain] = email.split("@");
    if (!local || local.length === 0) return { valid: false, reason: "Пустая локальная часть" };
    if (!domain || !domain.includes(".")) return { valid: false, reason: "Некорректный домен" };
    const parts = domain.split(".");
    if (parts[parts.length - 1].length < 2) return { valid: false, reason: "Домен верхнего уровня слишком короткий" };
    return { valid: false, reason: "Некорректный формат email" };
  }
  return { valid: true };
}

function passwordStrength(password: string): number {
  if (typeof password !== "string") throw new Error("Пароль должен быть строкой");
  if (password.length === 0) return 0;
  if (password.length > 128) throw new Error("Пароль слишком длинный (макс. 128 символов)");
  let score = 0;
  if (password.length >= 12) score = 60;
  else if (password.length >= 8) score = 40;
  else if (password.length >= 4) score = 20;
  if (/[A-ZА-ЯЁ]/.test(password)) score += 10;
  if (/[a-zа-яё]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Zа-яА-ЯёЁ0-9]/.test(password)) score += 10;
  return Math.min(score, 100);
}

function calculateShipping(weight: number, distance: number): number {
  if (typeof weight !== "number" || typeof distance !== "number" || isNaN(weight) || isNaN(distance))
    throw new Error("Аргументы должны быть числами");
  if (weight <= 0) throw new Error("Вес должен быть положительным");
  if (distance <= 0) throw new Error("Расстояние должно быть положительным");
  if (weight > 100) throw new Error("Вес не может превышать 100 кг");
  if (distance > 5000) throw new Error("Расстояние не может превышать 5000 км");
  let baseCost: number;
  if (weight <= 1) baseCost = 100;
  else if (weight <= 5) baseCost = 100 + (weight - 1) * 50;
  else if (weight <= 20) baseCost = 300 + (weight - 5) * 30;
  else baseCost = 750 + (weight - 20) * 20;
  let distanceMultiplier: number;
  if (distance <= 10) distanceMultiplier = 1.0;
  else if (distance <= 50) distanceMultiplier = 1.5;
  else distanceMultiplier = 2.0;
  return Math.round(baseCost * distanceMultiplier * 100) / 100;
}

function validatePhone(phone: string): { valid: boolean; reason?: string } {
  if (typeof phone !== "string") throw new Error("Номер должен быть строкой");
  if (phone.length === 0) return { valid: false, reason: "Пустая строка" };
  if (!phone.startsWith("+")) return { valid: false, reason: "Номер должен начинаться с +" };
  const digits = phone.replace(/[\s\-()]/g, "");
  if (!/^\+\d+$/.test(digits)) return { valid: false, reason: "Разрешены только цифры, пробелы, дефисы и скобки" };
  const digitCount = digits.length - 1;
  if (digitCount < 7) return { valid: false, reason: "Слишком короткий номер (мин. 7 цифр)" };
  if (digitCount > 15) return { valid: false, reason: "Слишком длинный номер (макс. 15 цифр)" };
  return { valid: true };
}

function calculateGrade(score: number): { grade: string; gpa: number } {
  if (typeof score !== "number" || isNaN(score))
    throw new Error("Балл должен быть числом");
  if (score < 0) throw new Error("Балл не может быть отрицательным");
  if (score > 100) throw new Error("Балл не может превышать 100");
  if (score >= 90) return { grade: "A", gpa: 4.0 };
  if (score >= 80) return { grade: "B", gpa: 3.0 };
  if (score >= 70) return { grade: "C", gpa: 2.0 };
  if (score >= 60) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
}

function queueOperation(
  queue: string[],
  operation: string,
  item?: string
): { queue: string[]; result?: string } {
  if (!Array.isArray(queue)) throw new Error("Очередь должна быть массивом");
  if (typeof operation !== "string") throw new Error("Операция должна быть строкой");
  if (queue.length > 100) throw new Error("Очередь слишком большая (макс. 100 элементов)");
  const q = [...queue];
  switch (operation) {
    case "enqueue":
      if (item === undefined) throw new Error("Для enqueue нужен элемент");
      if (q.length >= 100) throw new Error("Очередь заполнена");
      q.push(item);
      return { queue: q };
    case "dequeue":
      if (q.length === 0) throw new Error("Очередь пуста");
      const dequeued = q.shift();
      return { queue: q, result: dequeued };
    case "peek":
      if (q.length === 0) throw new Error("Очередь пуста");
      return { queue: q, result: q[0] };
    case "isEmpty":
      return { queue: q, result: String(q.length === 0) };
    case "size":
      return { queue: q, result: String(q.length) };
    default:
      throw new Error(`Неизвестная операция: ${operation}`);
  }
}

function binarySearch(arr: number[], target: number): number {
  if (!Array.isArray(arr)) throw new Error("Аргумент должен быть массивом");
  if (typeof target !== "number" || isNaN(target))
    throw new Error("Цель должна быть числом");
  for (const item of arr) {
    if (typeof item !== "number" || isNaN(item))
      throw new Error("Все элементы должны быть числами");
  }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) throw new Error("Массив должен быть отсортирован");
  }
  if (arr.length === 0) return -1;
  if (arr.length > 10000) throw new Error("Массив слишком большой (макс. 10000 элементов)");
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

function analyzeText(text: string): { words: number; sentences: number; avgWordLength: number } {
  if (typeof text !== "string") throw new Error("Текст должен быть строкой");
  if (text.length === 0) return { words: 0, sentences: 0, avgWordLength: 0 };
  if (text.length > 10000) throw new Error("Текст слишком длинный (макс. 10000 символов)");
  const trimmed = text.trim();
  if (trimmed.length === 0) return { words: 0, sentences: 0, avgWordLength: 0 };
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const totalWordLength = words.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = words.length > 0 ? Math.round((totalWordLength / words.length) * 100) / 100 : 0;
  return { words: words.length, sentences: sentences.length, avgWordLength };
}

// Map of reference functions
export const referenceFunctions: Record<
  number,
  (args: unknown[]) => unknown
> = {
  1: (args: unknown[]) => factorial(args[0] as number),
  2: (args: unknown[]) => isPrime(args[0] as number),
  3: (args: unknown[]) => applyDiscount(args[0] as number, args[1] as number),
  4: (args: unknown[]) => isLeapYear(args[0] as number),
  5: (args: unknown[]) => triangleType(args[0] as number, args[1] as number, args[2] as number),
  6: (args: unknown[]) => validatePassword(args[0] as string),
  7: (args: unknown[]) => stringTransform(args[0] as string, args[1] as string, args[2] as number, args[3] as number),
  8: (args: unknown[]) => validateDate(args[0] as number, args[1] as number, args[2] as number),
  9: (args: unknown[]) => sortAndFilter(args[0] as number[]),
  10: (args: unknown[]) => validateEmail(args[0] as string),
  11: (args: unknown[]) => passwordStrength(args[0] as string),
  12: (args: unknown[]) => calculateShipping(args[0] as number, args[1] as number),
  13: (args: unknown[]) => validatePhone(args[0] as string),
  14: (args: unknown[]) => calculateGrade(args[0] as number),
  15: (args: unknown[]) => queueOperation(args[0] as string[], args[1] as string, args[2] as string | undefined),
  16: (args: unknown[]) => binarySearch(args[0] as number[], args[1] as number),
  17: (args: unknown[]) => analyzeText(args[0] as string),
};

export const tasks: Task[] = [
  {
    id: 1,
    name: "Факториал",
    difficulty: "Легко",
    description:
      "Вычисляет **факториал** целого неотрицательного числа `n`. Факториал нуля равен `1`, для чисел больше `20` происходит переполнение.",
    signature: "factorial(n: number): number",
    topics: ["Классы эквивалентности", "Граничные значения"],
    params: [
      { name: "n", type: "number", description: "Целое неотрицательное число (0–20)" },
    ],
    returnType: "number",
    code: `function factorial(n: number): number {
  if (!Number.isInteger(n)) throw new Error("Аргумент должен быть целым числом");
  if (n < 0) throw new Error("Факториал не определён для отрицательных чисел");
  if (n > 20) throw new Error("Переполнение: n > 20");
  if (n === 0) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}`,
    equivalenceClasses: [
      {
        id: "t1-ec1",
        name: "EC1: n = 0",
        description: "Граничное значение — факториал 0 равен 1",
        exampleValues: [0],
      },
      {
        id: "t1-ec2",
        name: "EC2: 1 ≤ n ≤ 20",
        description: "Нормальные значения",
        exampleValues: [1, 5, 10, 20],
      },
      {
        id: "t1-ec3",
        name: "EC3: n < 0",
        description: "Недопустимые — ошибка",
        exampleValues: [-1, -5],
      },
      {
        id: "t1-ec4",
        name: "EC4: n > 20",
        description: "Переполнение",
        exampleValues: [21, 100],
      },
      {
        id: "t1-ec5",
        name: "EC5: n — не число",
        description: "Недопустимый тип",
        exampleValues: [1.5, "abc", null],
      },
    ],
    boundaryValues: [
      { value: 0, description: "Нижняя граница (факториал = 1)" },
      { value: 1, description: "Минимальное положительное" },
      { value: 19, description: "Предпоследнее допустимое" },
      { value: 20, description: "Верхняя граница допустимых" },
      { value: 21, description: "Переполнение" },
      { value: -1, description: "Первая недопустимая" },
    ],
  },
  {
    id: 2,
    name: "Простое число",
    difficulty: "Средне",
    description:
      "Проверяет, является ли целое число `n` **простым**. Простое число — это натуральное число больше `1`, которое делится только на `1` и на себя.",
    signature: "isPrime(n: number): boolean",
    topics: ["Классы эквивалентности", "Граничные значения", "Нелинейные классы"],
    params: [
      { name: "n", type: "number", description: "Целое число для проверки" },
    ],
    returnType: "boolean",
    code: `function isPrime(n: number): boolean {
  if (!Number.isInteger(n)) throw new Error("Аргумент должен быть целым числом");
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}`,
    equivalenceClasses: [
      {
        id: "t2-ec1",
        name: "EC1: n ≤ 1",
        description: "Недопустимые — не являются простыми",
        exampleValues: [0, 1, -3],
      },
      {
        id: "t2-ec2",
        name: "EC2: n = 2",
        description: "Единственное чётное простое число",
        exampleValues: [2],
      },
      {
        id: "t2-ec3",
        name: "EC3: Простое нечётное",
        description: "Нечётные простые числа",
        exampleValues: [3, 5, 7, 11, 13],
      },
      {
        id: "t2-ec4",
        name: "EC4: Составное число",
        description: "Числа, которые не являются простыми",
        exampleValues: [4, 6, 8, 9, 10],
      },
      {
        id: "t2-ec5",
        name: "EC5: Большое число",
        description: "Проверка на больших значениях",
        exampleValues: [997, 1000, 7919],
      },
      {
        id: "t2-ec6",
        name: "EC6: n — не число",
        description: "Недопустимый тип",
        exampleValues: [1.5, "abc", null],
      },
    ],
    boundaryValues: [
      { value: 0, description: "Нижняя граница" },
      { value: 1, description: "Не простое" },
      { value: 2, description: "Наименьшее простое" },
      { value: 3, description: "Наименьшее нечётное простое" },
      { value: 4, description: "Наименьшее составное" },
    ],
  },
  {
    id: 3,
    name: "Калькулятор скидки",
    difficulty: "Средне",
    description:
      "Применяет **скидку** к цене. Принимает цену и процент скидки, возвращает итоговую сумму со скидкой. Скидка округляется до 2 знаков.",
    signature: "applyDiscount(price: number, discountPercent: number): number",
    topics: [
      "Классы эквивалентности",
      "Граничные значения",
      "Многофакторное тестирование",
    ],
    params: [
      { name: "price", type: "number", description: "Цена товара (> 0)" },
      {
        name: "discountPercent",
        type: "number",
        description: "Процент скидки (0–100)",
      },
    ],
    returnType: "number",
    code: `function applyDiscount(price: number, discountPercent: number): number {
  if (typeof price !== 'number' || typeof discountPercent !== 'number' || isNaN(price) || isNaN(discountPercent))
    throw new Error("Аргументы должны быть числами");
  if (price < 0) throw new Error("Цена не может быть отрицательной");
  if (discountPercent < 0) throw new Error("Скидка не может быть отрицательной");
  if (discountPercent > 100) throw new Error("Скидка не может превышать 100%");
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}`,
    equivalenceClasses: [
      {
        id: "t3-ec1",
        name: "EC1: Без скидки",
        description: "price > 0, discountPercent = 0",
        exampleValues: [[100, 0]],
      },
      {
        id: "t3-ec2",
        name: "EC2: Частичная скидка",
        description: "price > 0, 0 < discountPercent < 100",
        exampleValues: [[100, 25], [500, 50]],
      },
      {
        id: "t3-ec3",
        name: "EC3: Бесплатно",
        description: "price > 0, discountPercent = 100",
        exampleValues: [[100, 100]],
      },
      {
        id: "t3-ec4",
        name: "EC4: price = 0",
        description: "Нулевая цена",
        exampleValues: [[0, 50]],
      },
      {
        id: "t3-ec5",
        name: "EC5: price < 0",
        description: "Недопустимая цена",
        exampleValues: [[-100, 10]],
      },
      {
        id: "t3-ec6",
        name: "EC6: discountPercent < 0",
        description: "Отрицательная скидка",
        exampleValues: [[100, -10]],
      },
      {
        id: "t3-ec7",
        name: "EC7: discountPercent > 100",
        description: "Скидка больше 100%",
        exampleValues: [[100, 150]],
      },
      {
        id: "t3-ec8",
        name: "EC8: Нечисловые аргументы",
        description: "Неверный тип аргументов",
        exampleValues: [["abc", 10], [100, "abc"]],
      },
    ],
    boundaryValues: [
      { value: [0.01, 0], description: "Минимальная цена, без скидки" },
      { value: [0, 0], description: "Нулевая цена" },
      { value: [100, 0], description: "Скидка 0%" },
      { value: [100, 1], description: "Минимальная скидка" },
      { value: [100, 99], description: "Максимальная частичная скидка" },
      { value: [100, 100], description: "Полная скидка" },
      { value: [100, 101], description: "Скидка > 100%" },
    ],
  },
  {
    id: 4,
    name: "Високосный год",
    difficulty: "Легко",
    description:
      "Проверяет, является ли год **високосным**. Год високосный, если он делится на `4`, но не на `100`, за исключением годов, делящихся на `400`.",
    signature: "isLeapYear(year: number): boolean",
    topics: ["Классы эквивалентности", "Граничные значения", "Логические условия"],
    params: [
      { name: "year", type: "number", description: "Год (положительное целое число)" },
    ],
    returnType: "boolean",
    code: `function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) throw new Error("Год должен быть целым числом");
  if (year <= 0) throw new Error("Год должен быть положительным");
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}`,
    equivalenceClasses: [
      {
        id: "t4-ec1",
        name: "EC1: Делится на 400",
        description: "Високосный год (правило 400)",
        exampleValues: [1600, 2000, 2400],
      },
      {
        id: "t4-ec2",
        name: "EC2: Делится на 100, но не на 400",
        description: "Не високосный год (исключение 100)",
        exampleValues: [1700, 1800, 1900, 2100],
      },
      {
        id: "t4-ec3",
        name: "EC3: Делится на 4, но не на 100",
        description: "Високосный год (правило 4)",
        exampleValues: [2004, 2008, 2024, 2028],
      },
      {
        id: "t4-ec4",
        name: "EC4: Не делится на 4",
        description: "Обычный год",
        exampleValues: [2023, 2025, 2026],
      },
      {
        id: "t4-ec5",
        name: "EC5: year ≤ 0",
        description: "Недопустимое значение",
        exampleValues: [0, -1, -100],
      },
      {
        id: "t4-ec6",
        name: "EC6: Нечисловой аргумент",
        description: "Недопустимый тип",
        exampleValues: [1.5, "2024", null],
      },
    ],
    boundaryValues: [
      { value: 1600, description: "Високосный (÷400)" },
      { value: 1700, description: "Не високосный (÷100, не ÷400)" },
      { value: 2000, description: "Високосный (÷400)" },
      { value: 2004, description: "Високосный (÷4, не ÷100)" },
      { value: 2024, description: "Високосный (÷4, не ÷100)" },
      { value: 2025, description: "Не високосный" },
      { value: 2100, description: "Не високосный (÷100, не ÷400)" },
    ],
  },
  {
    id: 5,
    name: "Треугольник",
    difficulty: "Сложно",
    description:
      "Определяет **тип треугольника** по трём сторонам. Возвращает `«равносторонний»`, `«равнобедренный»`, `«разносторонний»` или `«не треугольник»`.",
    signature: "triangleType(a: number, b: number, c: number): string",
    topics: [
      "Классы эквивалентности",
      "Граничные значения",
      "Комбинаторное тестирование",
    ],
    params: [
      { name: "a", type: "number", description: "Первая сторона" },
      { name: "b", type: "number", description: "Вторая сторона" },
      { name: "c", type: "number", description: "Третья сторона" },
    ],
    returnType: "string",
    code: `function triangleType(a: number, b: number, c: number): string {
  if ([a, b, c].some(v => typeof v !== 'number' || isNaN(v))) throw new Error("Стороны должны быть числами");
  if (a <= 0 || b <= 0 || c <= 0) throw new Error("Стороны должны быть положительными");
  if (a + b <= c || a + c <= b || b + c <= a) return "не треугольник";
  if (a === b && b === c) return "равносторонний";
  if (a === b || b === c || a === c) return "равнобедренный";
  return "разносторонний";
}`,
    equivalenceClasses: [
      {
        id: "t5-ec1",
        name: "EC1: Равносторонний",
        description: "Все три стороны равны",
        exampleValues: [[3, 3, 3], [5, 5, 5]],
      },
      {
        id: "t5-ec2",
        name: "EC2: Равнобедренный",
        description: "Две стороны равны",
        exampleValues: [[2, 2, 3], [5, 5, 8]],
      },
      {
        id: "t5-ec3",
        name: "EC3: Разносторонний",
        description: "Все стороны разные",
        exampleValues: [[3, 4, 5], [5, 7, 9]],
      },
      {
        id: "t5-ec4",
        name: "EC4: Не треугольник",
        description: "Не выполняется неравенство треугольника",
        exampleValues: [[1, 1, 3], [1, 2, 10]],
      },
      {
        id: "t5-ec5",
        name: "EC5: Сторона ≤ 0",
        description: "Недопустимые значения",
        exampleValues: [[-1, 2, 3], [0, 0, 0]],
      },
      {
        id: "t5-ec6",
        name: "EC6: Вырожденный",
        description: "Сумма двух сторон равна третьей",
        exampleValues: [[1, 2, 3], [2, 3, 5]],
      },
      {
        id: "t5-ec7",
        name: "EC7: Нечисловые аргументы",
        description: "Неверный тип аргументов",
        exampleValues: [["a", 2, 3], [1, null, 3]],
      },
    ],
    boundaryValues: [
      { value: [1, 1, 1], description: "Равносторонний" },
      { value: [2, 2, 3], description: "Равнобедренный" },
      { value: [3, 4, 5], description: "Разносторонний" },
      { value: [1, 2, 3], description: "Вырожденный (не треугольник)" },
      { value: [1, 1, 3], description: "Не треугольник" },
    ],
  },
  {
    id: 6,
    name: "Валидация пароля",
    difficulty: "Сложно",
    description:
      "Проверяет пароль на соответствие **требованиям безопасности**:\n\n- Минимум `8` символов\n- Хотя бы одна **заглавная** буква\n- Хотя бы одна **строчная** буква\n- Хотя бы одна **цифра**\n- Хотя бы один **спецсимвол**",
    signature:
      "validatePassword(password: string): { valid: boolean; errors: string[] }",
    topics: [
      "Классы эквивалентности",
      "Комбинаторное тестирование",
      "Проверка форматов",
    ],
    params: [
      {
        name: "password",
        type: "string",
        description: "Пароль для валидации",
      },
    ],
    returnType: "{ valid: boolean; errors: string[] }",
    code: `function validatePassword(password: string): { valid: boolean; errors: string[] } {
  if (typeof password !== 'string') throw new Error("Пароль должен быть строкой");
  const errors: string[] = [];
  if (password.length < 8) errors.push("Минимум 8 символов");
  if (!/[A-ZА-ЯЁ]/.test(password)) errors.push("Хотя бы одна заглавная буква");
  if (!/[a-zа-яё]/.test(password)) errors.push("Хотя бы одна строчная буква");
  if (!/[0-9]/.test(password)) errors.push("Хотя бы одна цифра");
  if (!/[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/\\?]/.test(password)) errors.push("Хотя бы один спецсимвол");
  return { valid: errors.length === 0, errors };
}`,
    equivalenceClasses: [
      {
        id: "t6-ec1",
        name: "EC1: Валидный пароль",
        description: "Соответствует всем требованиям",
        exampleValues: ["Abc123!@", "MyPass99#"],
      },
      {
        id: "t6-ec2",
        name: "EC2: Длина < 8",
        description: "Слишком короткий",
        exampleValues: ["Ab1!", "A1!a"],
      },
      {
        id: "t6-ec3",
        name: "EC3: Нет заглавных",
        description: "Отсутствуют заглавные буквы",
        exampleValues: ["abcdef12!"],
      },
      {
        id: "t6-ec4",
        name: "EC4: Нет строчных",
        description: "Отсутствуют строчные буквы",
        exampleValues: ["ABCDEF12!"],
      },
      {
        id: "t6-ec5",
        name: "EC5: Нет цифр",
        description: "Отсутствуют цифры",
        exampleValues: ["Abcdefgh!"],
      },
      {
        id: "t6-ec6",
        name: "EC6: Нет спецсимволов",
        description: "Отсутствуют спецсимволы",
        exampleValues: ["Abcdef12"],
      },
      {
        id: "t6-ec7",
        name: "EC7: Комбинации нарушений",
        description: "Несколько нарушений одновременно",
        exampleValues: ["abc", "ABC", "12345678"],
      },
      {
        id: "t6-ec8",
        name: "EC8: Пустая строка",
        description: "Пустой пароль",
        exampleValues: [""],
      },
      {
        id: "t6-ec9",
        name: "EC9: Не строковый тип",
        description: "Неверный тип",
        exampleValues: [123, null, undefined],
      },
    ],
    boundaryValues: [
      { value: "Abcdefg1!", description: "Минимальный валидный (8 символов)" },
      { value: "Abcdef1!", description: "7 символов (недостаточно)" },
      { value: "", description: "Пустая строка" },
      { value: "ABCDEFG1!", description: "Нет строчных" },
      { value: "abcdefg1!", description: "Нет заглавных" },
      { value: "Abcdefgh!", description: "Нет цифр" },
      { value: "Abcdefg12", description: "Нет спецсимволов" },
    ],
  },
  {
    id: 7,
    name: "Строковые операции",
    difficulty: "Средне",
    description:
      "Выполняет **конкатенацию** двух строк и извлечение **подстроки** из первой строки. Если начальная позиция больше длины строки, возвращается просто конкатенация.",
    signature: "stringTransform(str1: string, str2: string, start: number, length: number): string",
    topics: ["Классы эквивалентности", "Граничные значения", "Многофакторное тестирование"],
    params: [
      { name: "str1", type: "string", description: "Первая строка (источник подстроки)" },
      { name: "str2", type: "string", description: "Вторая строка (добавляется)" },
      { name: "start", type: "number", description: "Начальная позиции подстроки (≥ 0)" },
      { name: "length", type: "number", description: "Длина подстроки (≥ 0)" },
    ],
    returnType: "string",
    code: `function stringTransform(str1: string, str2: string, start: number, length: number): string {
  if (typeof str1 !== "string" || typeof str2 !== "string")
    throw new Error("Аргументы должны быть строками");
  if (!Number.isInteger(start)) throw new Error("Начало должно быть целым числом");
  if (!Number.isInteger(length)) throw new Error("Длина должна быть целым числом");
  if (start < 0) throw new Error("Начало не может быть отрицательным");
  if (length < 0) throw new Error("Длина не может быть отрицательной");
  if (start >= str1.length) return str1 + str2;
  const actualLength = Math.min(length, str1.length - start);
  const substring = str1.substring(start, start + actualLength);
  return str1 + str2 + substring;
}`,
    equivalenceClasses: [
      {
        id: "t7-ec1",
        name: "EC1: Нормальная подстрока",
        description: "start в пределах строки, length корректна",
        exampleValues: [["hello", " world", 0, 3]],
      },
      {
        id: "t7-ec2",
        name: "EC2: start = 0",
        description: "Подстрока с начала строки",
        exampleValues: [["abc", "def", 0, 2]],
      },
      {
        id: "t7-ec3",
        name: "EC3: start ≥ str1.length",
        description: "Позиция за пределами строки — возвращается конкатенация",
        exampleValues: [["ab", "cd", 5, 2]],
      },
      {
        id: "t7-ec4",
        name: "EC4: length = 0",
        description: "Нулевая длина подстроки",
        exampleValues: [["abc", "def", 1, 0]],
      },
      {
        id: "t7-ec5",
        name: "EC5: length > остатка строки",
        description: "Длина обрезается до конца строки",
        exampleValues: [["abc", "def", 1, 10]],
      },
      {
        id: "t7-ec6",
        name: "EC6: Пустая str1",
        description: "Первая строка пустая",
        exampleValues: [["", "abc", 0, 1]],
      },
      {
        id: "t7-ec7",
        name: "EC7: Пустая str2",
        description: "Вторая строка пустая",
        exampleValues: [["abc", "", 0, 2]],
      },
      {
        id: "t7-ec8",
        name: "EC8: start < 0",
        description: "Недопустимая позиция",
        exampleValues: [["abc", "def", -1, 2]],
      },
      {
        id: "t7-ec9",
        name: "EC9: length < 0",
        description: "Недопустимая длина",
        exampleValues: [["abc", "def", 0, -1]],
      },
      {
        id: "t7-ec10",
        name: "EC10: Нестроковые аргументы",
        description: "Неверный тип строк",
        exampleValues: [[123, "def", 0, 1], ["abc", 456, 0, 1]],
      },
    ],
    boundaryValues: [
      { value: ["a", "b", 0, 1], description: "Минимальные строки" },
      { value: ["", "", 0, 0], description: "Пустые строки и нули" },
      { value: ["abc", "def", 0, 3], description: "start=0, length=длина" },
      { value: ["abc", "def", 2, 1], description: "Последний символ" },
      { value: ["abc", "def", 3, 1], description: "start за границей" },
      { value: ["abc", "def", -1, 1], description: "start < 0" },
      { value: ["abc", "def", 0, -1], description: "length < 0" },
    ],
  },
  {
    id: 8,
    name: "Валидация даты",
    difficulty: "Средне",
    description:
      "Проверяет корректность **даты** (день, месяц, год). Учитывает високосные годы и количество дней в каждом месяце.",
    signature: "validateDate(day: number, month: number, year: number): { valid: boolean; reason?: string }",
    topics: ["Классы эквивалентности", "Граничные значения", "Логические условия"],
    params: [
      { name: "day", type: "number", description: "День месяца (1–31)" },
      { name: "month", type: "number", description: "Месяц (1–12)" },
      { name: "year", type: "number", description: "Год (1–9999)" },
    ],
    returnType: "{ valid: boolean; reason?: string }",
    code: `function validateDate(day: number, month: number, year: number): { valid: boolean; reason?: string } {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year))
    throw new Error("День, месяц и год должны быть целыми числами");
  if (year < 1 || year > 9999) return { valid: false, reason: "Год должен быть от 1 до 9999" };
  if (month < 1 || month > 12) return { valid: false, reason: "Месяц должен быть от 1 до 12" };
  if (day < 1) return { valid: false, reason: "День не может быть меньше 1" };
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return { valid: false, reason: \`В месяце \${month} не более \${daysInMonth[month - 1]} дней\` };
  return { valid: true };
}`,
    equivalenceClasses: [
      {
        id: "t8-ec1",
        name: "EC1: Валидная дата",
        description: "Корректные день, месяц, год",
        exampleValues: [[15, 6, 2024], [1, 1, 2000]],
      },
      {
        id: "t8-ec2",
        name: "EC2: 29 февраля високосного года",
        description: "Валидный високосный год",
        exampleValues: [[29, 2, 2024], [29, 2, 2000]],
      },
      {
        id: "t8-ec3",
        name: "EC3: 29 февраля невисокосного года",
        description: "Невалидный день для февраля",
        exampleValues: [[29, 2, 2023], [29, 2, 1900]],
      },
      {
        id: "t8-ec4",
        name: "EC4: 31 день в месяце с 30 днями",
        description: "Превышение дней в месяце",
        exampleValues: [[31, 4, 2024], [31, 6, 2024]],
      },
      {
        id: "t8-ec5",
        name: "EC5: month < 1 или month > 12",
        description: "Недопустимый месяц",
        exampleValues: [[15, 0, 2024], [15, 13, 2024]],
      },
      {
        id: "t8-ec6",
        name: "EC6: day < 1",
        description: "Недопустимый день",
        exampleValues: [[0, 6, 2024], [-1, 6, 2024]],
      },
      {
        id: "t8-ec7",
        name: "EC7: year < 1 или year > 9999",
        description: "Недопустимый год",
        exampleValues: [[15, 6, 0], [15, 6, 10000]],
      },
      {
        id: "t8-ec8",
        name: "EC8: Нечисловые аргументы",
        description: "Неверный тип",
        exampleValues: [["15", 6, 2024], [15, null, 2024]],
      },
    ],
    boundaryValues: [
      { value: [1, 1, 1], description: "Минимальная дата" },
      { value: [31, 12, 9999], description: "Максимальная дата" },
      { value: [1, 1, 2024], description: "Первый день года" },
      { value: [31, 1, 2024], description: "31 января" },
      { value: [28, 2, 2024], description: "28 февраля високосного" },
      { value: [29, 2, 2024], description: "29 февраля високосного" },
      { value: [29, 2, 2023], description: "29 февраля невисокосного" },
      { value: [30, 2, 2024], description: "30 февраля — ошибка" },
      { value: [31, 4, 2024], description: "31 апреля — ошибка" },
      { value: [0, 6, 2024], description: "День = 0" },
      { value: [15, 0, 2024], description: "Месяц = 0" },
      { value: [15, 6, 0], description: "Год = 0" },
    ],
  },
  {
    id: 9,
    name: "Сортировка и фильтрация массива",
    difficulty: "Сложно",
    description:
      "Принимает массив чисел, **отфильтровывает** отрицательные и NaN значения, затем **сортирует** по возрастанию. Пустой массив возвращает пустой массив.",
    signature: "sortAndFilter(arr: number[]): number[]",
    topics: ["Классы эквивалентности", "Граничные значения", "Проверка коллекций"],
    params: [
      { name: "arr", type: "number[]", description: "Массив чисел (макс. 1000 элементов)" },
    ],
    returnType: "number[]",
    code: `function sortAndFilter(arr: number[]): number[] {
  if (!Array.isArray(arr))
    throw new Error("Аргумент должен быть массивом");
  if (arr.length === 0) return [];
  for (const item of arr) {
    if (typeof item !== "number" || isNaN(item))
      throw new Error("Все элементы должны быть числами");
  }
  if (arr.length > 1000) throw new Error("Массив слишком большой (макс. 1000 элементов)");
  return arr.filter(n => n >= 0).sort((a, b) => a - b);
}`,
    equivalenceClasses: [
      {
        id: "t9-ec1",
        name: "EC1: Массив с положительными числами",
        description: "Все элементы ≥ 0",
        exampleValues: [[5, 3, 1, 4, 2]],
      },
      {
        id: "t9-ec2",
        name: "EC2: Массив с отрицательными",
        description: "Смешанные — отрицательные отфильтровываются",
        exampleValues: [[-3, 5, -1, 2, 0]],
      },
      {
        id: "t9-ec3",
        name: "EC3: Пустой массив",
        description: "Возвращает пустой массив",
        exampleValues: [[]],
      },
      {
        id: "t9-ec4",
        name: "EC4: Один элемент",
        description: "Одиночный элемент",
        exampleValues: [[42], [-5], [0]],
      },
      {
        id: "t9-ec5",
        name: "EC5: Все отрицательные",
        description: "Результат — пустой массив",
        exampleValues: [[-1, -2, -3]],
      },
      {
        id: "t9-ec6",
        name: "EC6: Дубликаты",
        description: "Массив с повторяющимися элементами",
        exampleValues: [[3, 1, 3, 2, 1]],
      },
      {
        id: "t9-ec7",
        name: "EC7: Содержит NaN",
        description: "Недопустимый элемент",
        exampleValues: [[1, NaN, 3]],
      },
      {
        id: "t9-ec8",
        name: "EC8: Не массив",
        description: "Неверный тип",
        exampleValues: ["not an array", 42, null],
      },
      {
        id: "t9-ec9",
        name: "EC9: Массив > 1000 элементов",
        description: "Превышение размера",
        exampleValues: [Array(1001).fill(1)],
      },
    ],
    boundaryValues: [
      { value: [[]], description: "Пустой массив" },
      { value: [[1]], description: "Один элемент" },
      { value: [[0]], description: "Ноль" },
      { value: [[-1]], description: "Один отрицательный" },
      { value: [[1, 2, 3]], description: "Уже отсортирован" },
      { value: [[3, 2, 1]], description: "Обратный порядок" },
      { value: [[-1, 0, 1]], description: "Смешанный с нулём" },
    ],
  },
  {
    id: 10,
    name: "Валидация email",
    difficulty: "Легко",
    description:
      "Проверяет корректность **email адреса** по формату:\n\n- Наличие `@`\n- Непустая локальная часть\n- Корректный домен с точкой\n- Домен верхнего уровня ≥ 2 символов\n- Максимальная длина 254 символа",
    signature: "validateEmail(email: string): { valid: boolean; reason?: string }",
    topics: ["Классы эквивалентности", "Проверка форматов"],
    params: [
      { name: "email", type: "string", description: "Email адрес для проверки" },
    ],
    returnType: "{ valid: boolean; reason?: string }",
    code: `function validateEmail(email: string): { valid: boolean; reason?: string } {
  if (typeof email !== "string")
    throw new Error("Email должен быть строкой");
  if (email.length === 0) return { valid: false, reason: "Пустая строка" };
  if (email.length > 254) return { valid: false, reason: "Слишком длинный email (макс. 254 символа)" };
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    if (!email.includes("@")) return { valid: false, reason: "Отсутствует символ @" };
    const [local, domain] = email.split("@");
    if (!local || local.length === 0) return { valid: false, reason: "Пустая локальная часть" };
    if (!domain || !domain.includes(".")) return { valid: false, reason: "Некорректный домен" };
    const parts = domain.split(".");
    if (parts[parts.length - 1].length < 2) return { valid: false, reason: "Домен верхнего уровня слишком короткий" };
    return { valid: false, reason: "Некорректный формат email" };
  }
  return { valid: true };
}`,
    equivalenceClasses: [
      {
        id: "t10-ec1",
        name: "EC1: Валидный email",
        description: "Корректный формат",
        exampleValues: ["user@example.com", "test.user@domain.org"],
      },
      {
        id: "t10-ec2",
        name: "EC2: Пустая строка",
        description: "Пустой email",
        exampleValues: [""],
      },
      {
        id: "t10-ec3",
        name: "EC3: Слишком длинный",
        description: "Длина > 254 символа",
        exampleValues: ["a".repeat(250) + "@example.com"],
      },
      {
        id: "t10-ec4",
        name: "EC4: Без @",
        description: "Отсутствует символ @",
        exampleValues: ["userexample.com", "user.example.com"],
      },
      {
        id: "t10-ec5",
        name: "EC5: Пустая локальная часть",
        description: "@ в начале",
        exampleValues: ["@example.com"],
      },
      {
        id: "t10-ec6",
        name: "EC6: Нет точки в домене",
        description: "Домен без TLD",
        exampleValues: ["user@example"],
      },
      {
        id: "t10-ec7",
        name: "EC7: TLD короче 2 символов",
        description: "Однобуквенный домен верхнего уровня",
        exampleValues: ["user@example.c"],
      },
      {
        id: "t10-ec8",
        name: "EC8: Спецсимволы в локальной части",
        description: "Недопустимые символы до @",
        exampleValues: ["user name@example.com", "user#name@example.com"],
      },
      {
        id: "t10-ec9",
        name: "EC9: Не строковый тип",
        description: "Неверный тип",
        exampleValues: [123, null, undefined],
      },
    ],
    boundaryValues: [
      { value: "a@b.co", description: "Минимальный валидный" },
      { value: "user@example.com", description: "Стандартный email" },
      { value: "test.user+tag@sub.domain.org", description: "Сложный валидный" },
      { value: "", description: "Пустая строка" },
      { value: "no-at-sign.com", description: "Без @" },
      { value: "@domain.com", description: "Пустая локальная часть" },
      { value: "user@domain", description: "Без точки в домене" },
      { value: "user@domain.c", description: "TLD из 1 символа" },
    ],
  },
  {
    id: 11,
    name: "Калькулятор силы пароля",
    difficulty: "Средне",
    description:
      "Оценивает **силу пароля** по шкале от 0 до 100. Учитывает длину, разнообразие символов и наличие повторяющихся паттернов.\n\n- Длина до 4 символов: 0 баллов\n- 4-7 символов: база 20 баллов\n- 8-11 символов: база 40 баллов\n- 12+ символов: база 60 баллов\n- +10 за заглавные, +10 за строчные, +10 за цифры, +10 за спецсимволы",
    signature: "passwordStrength(password: string): number",
    topics: ["Классы эквивалентности", "Граничные значения", "Проверка форматов"],
    params: [
      { name: "password", type: "string", description: "Пароль для оценки" },
    ],
    returnType: "number",
    code: `function passwordStrength(password: string): number {
  if (typeof password !== "string") throw new Error("Пароль должен быть строкой");
  if (password.length === 0) return 0;
  if (password.length > 128) throw new Error("Пароль слишком длинный (макс. 128 символов)");
  let score = 0;
  if (password.length >= 12) score = 60;
  else if (password.length >= 8) score = 40;
  else if (password.length >= 4) score = 20;
  if (/[A-ZА-ЯЁ]/.test(password)) score += 10;
  if (/[a-zа-яё]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Zа-яА-ЯёЁ0-9]/.test(password)) score += 10;
  return Math.min(score, 100);
}`,
    equivalenceClasses: [
      { id: "t11-ec1", name: "EC1: Пустой пароль", description: "Нулевая сила", exampleValues: [""] },
      { id: "t11-ec2", name: "EC2: Очень короткий (1-3)", description: "Минимальная длина, без бонусов", exampleValues: ["a", "ab", "abc"] },
      { id: "t11-ec3", name: "EC3: Короткий (4-7)", description: "База 20 баллов", exampleValues: ["abcd", "abcde12"] },
      { id: "t11-ec4", name: "EC4: Средний (8-11)", description: "База 40 баллов", exampleValues: ["abcdefgh", "Abc123!@"] },
      { id: "t11-ec5", name: "EC5: Длинный (12+)", description: "База 60 баллов", exampleValues: ["Abcdefgh12!@", "MyP@ssw0rd2024"] },
      { id: "t11-ec6", name: "EC6: Максимальный балл", description: "Все критерии выполнены, 12+ символов", exampleValues: ["Abc123!@xyz#"] },
      { id: "t11-ec7", name: "EC7: Только строчные", description: "Нет заглавных, цифр, спецсимволов", exampleValues: ["abcdefgh"] },
      { id: "t11-ec8", name: "EC8: Только заглавные", description: "Нет строчных, цифр, спецсимволов", exampleValues: ["ABCDEFGH"] },
      { id: "t11-ec9", name: "EC9: Только цифры", description: "Нет букв и спецсимволов", exampleValues: ["12345678"] },
      { id: "t11-ec10", name: "EC10: Не строковый тип", description: "Неверный тип", exampleValues: [123, null, undefined] },
      { id: "t11-ec11", name: "EC11: Превышение длины", description: "> 128 символов", exampleValues: ["a".repeat(129)] },
    ],
    boundaryValues: [
      { value: "", description: "Пустой пароль" },
      { value: "a", description: "1 символ" },
      { value: "abcd", description: "4 символа (порог базы)" },
      { value: "abcdefg", description: "7 символов (нижняя граница среднего)" },
      { value: "abcdefgh", description: "8 символов (средний)" },
      { value: "abcdefghijk", description: "11 символов (верхняя граница среднего)" },
      { value: "Abcdefgh12!@", description: "12 символов (длинный)" },
      { value: "a".repeat(128), description: "Максимальная длина" },
    ],
  },
  {
    id: 12,
    name: "Расчёт доставки",
    difficulty: "Средне",
    description:
      "Рассчитывает **стоимость доставки** на основе веса и расстояния. Использует阶梯 pricing:\n\n- До 1 кг: 100₽ базовая\n- 1-5 кг: 100 + (вес-1) × 50₽\n- 5-20 кг: 300 + (вес-5) × 30₽\n- 20+ кг: 750 + (вес-20) × 20₽\n- Расстояние до 10 км: коэффициент 1.0\n- 10-50 км: коэффициент 1.5\n- 50+ км: коэффициент 2.0",
    signature: "calculateShipping(weight: number, distance: number): number",
    topics: ["Классы эквивалентности", "Граничные значения", "Таблицы решений"],
    params: [
      { name: "weight", type: "number", description: "Вес посылки в кг (> 0)" },
      { name: "distance", type: "number", description: "Расстояние в км (> 0)" },
    ],
    returnType: "number",
    code: `function calculateShipping(weight: number, distance: number): number {
  if (typeof weight !== "number" || typeof distance !== "number" || isNaN(weight) || isNaN(distance))
    throw new Error("Аргументы должны быть числами");
  if (weight <= 0) throw new Error("Вес должен быть положительным");
  if (distance <= 0) throw new Error("Расстояние должно быть положительным");
  if (weight > 100) throw new Error("Вес не может превышать 100 кг");
  if (distance > 5000) throw new Error("Расстояние не может превышать 5000 км");
  let baseCost: number;
  if (weight <= 1) baseCost = 100;
  else if (weight <= 5) baseCost = 100 + (weight - 1) * 50;
  else if (weight <= 20) baseCost = 300 + (weight - 5) * 30;
  else baseCost = 750 + (weight - 20) * 20;
  let distanceMultiplier: number;
  if (distance <= 10) distanceMultiplier = 1.0;
  else if (distance <= 50) distanceMultiplier = 1.5;
  else distanceMultiplier = 2.0;
  return Math.round(baseCost * distanceMultiplier * 100) / 100;
}`,
    equivalenceClasses: [
      { id: "t12-ec1", name: "EC1: Лёгкая (≤1 кг)", description: "Базовая стоимость 100₽", exampleValues: [[0.5, 5], [1, 10]] },
      { id: "t12-ec2", name: "EC2: Средняя (1-5 кг)", description: "Линейный рост веса", exampleValues: [[2, 10], [5, 20]] },
      { id: "t12-ec3", name: "EC3: Тяжёлая (5-20 кг)", description: "Умеренный рост", exampleValues: [[10, 30], [20, 50]] },
      { id: "t12-ec4", name: "EC4: Очень тяжёлая (20+ кг)", description: "Максимальная категория веса", exampleValues: [[25, 10], [50, 100]] },
      { id: "t12-ec5", name: "EC5: Близкая (≤10 км)", description: "Коэффициент 1.0", exampleValues: [[2, 5], [10, 10]] },
      { id: "t12-ec6", name: "EC6: Средняя (10-50 км)", description: "Коэффициент 1.5", exampleValues: [[2, 25], [50, 50]] },
      { id: "t12-ec7", name: "EC7: Далёкая (50+ км)", description: "Коэффициент 2.0", exampleValues: [[2, 100], [5, 500]] },
      { id: "t12-ec8", name: "EC8: weight ≤ 0", description: "Недопустимый вес", exampleValues: [[0, 10], [-1, 10]] },
      { id: "t12-ec9", name: "EC9: distance ≤ 0", description: "Недопустимое расстояние", exampleValues: [[2, 0], [2, -5]] },
      { id: "t12-ec10", name: "EC10: weight > 100", description: "Превышение веса", exampleValues: [[101, 10]] },
      { id: "t12-ec11", name: "EC11: distance > 5000", description: "Превышение расстояния", exampleValues: [[2, 5001]] },
      { id: "t12-ec12", name: "EC12: Нечисловые аргументы", description: "Неверный тип", exampleValues: [["2", 10], [2, "10"]] },
    ],
    boundaryValues: [
      { value: [0.1, 1], description: "Минимальные значения" },
      { value: [1, 10], description: "Граница лёгкой/близкой" },
      { value: [5, 50], description: "Граница средней/средней" },
      { value: [20, 10], description: "Граница тяжёлой" },
      { value: [100, 5000], description: "Максимальные допустимые" },
      { value: [101, 10], description: "Превышение веса" },
      { value: [2, 5001], description: "Превышение расстояния" },
    ],
  },
  {
    id: 13,
    name: "Валидация номера телефона",
    difficulty: "Легко",
    description:
      "Проверяет корректность **номера телефона** в международном формате:\n\n- Должен начинаться с `+`\n- Содержать только цифры после `+`\n- Длина от 7 до 15 цифр (после `+`)\n- Допустимые разделители: `-`, ` `, `(`, `)`",
    signature: "validatePhone(phone: string): { valid: boolean; reason?: string }",
    topics: ["Классы эквивалентности", "Проверка форматов"],
    params: [
      { name: "phone", type: "string", description: "Номер телефона для проверки" },
    ],
    returnType: "{ valid: boolean; reason?: string }",
    code: `function validatePhone(phone: string): { valid: boolean; reason?: string } {
  if (typeof phone !== "string") throw new Error("Номер должен быть строкой");
  if (phone.length === 0) return { valid: false, reason: "Пустая строка" };
  if (!phone.startsWith("+")) return { valid: false, reason: "Номер должен начинаться с +" };
  const digits = phone.replace(/[\\s\\-()]/g, "");
  if (!/^\\+\\d+$/.test(digits)) return { valid: false, reason: "Разрешены только цифры, пробелы, дефисы и скобки" };
  const digitCount = digits.length - 1;
  if (digitCount < 7) return { valid: false, reason: "Слишком короткий номер (мин. 7 цифр)" };
  if (digitCount > 15) return { valid: false, reason: "Слишком длинный номер (макс. 15 цифр)" };
  return { valid: true };
}`,
    equivalenceClasses: [
      { id: "t13-ec1", name: "EC1: Валидный номер", description: "Корректный международный формат", exampleValues: ["+79991234567", "+12345678901"] },
      { id: "t13-ec2", name: "EC2: Пустая строка", description: "Пустой ввод", exampleValues: [""] },
      { id: "t13-ec3", name: "EC3: Без +", description: "Отсутствует префикс", exampleValues: ["79991234567", "89991234567"] },
      { id: "t13-ec4", name: "EC4: Слишком короткий", description: "Менее 7 цифр", exampleValues: ["+123456", "+7999"] },
      { id: "t13-ec5", name: "EC5: Слишком длинный", description: "Более 15 цифр", exampleValues: ["+1234567890123456"] },
      { id: "t13-ec6", name: "EC6: С разделителями", description: "Валидный с пробелами/скобками", exampleValues: ["+7 (999) 123-45-67", "+1-234-567-8901"] },
      { id: "t13-ec7", name: "EC7: Неверные символы", description: "Буквы или спецсимволы", exampleValues: ["+7999abc1234", "+7999!234567"] },
      { id: "t13-ec8", name: "EC8: Только +", description: "Нет цифр", exampleValues: ["+"] },
      { id: "t13-ec9", name: "EC9: Не строковый тип", description: "Неверный тип", exampleValues: [79991234567, null, undefined] },
    ],
    boundaryValues: [
      { value: "+1234567", description: "Минимальная длина (7 цифр)" },
      { value: "+123456", description: "На 1 цифру меньше минимума" },
      { value: "+79991234567", description: "Стандартный российский номер" },
      { value: "+123456789012345", description: "Максимальная длина (15 цифр)" },
      { value: "+1234567890123456", description: "На 1 цифру больше максимума" },
      { value: "+", description: "Только плюс" },
      { value: "+7 (999) 123-45-67", description: "С разделителями" },
    ],
  },
  {
    id: 14,
    name: "Расчёт оценки",
    difficulty: "Легко",
    description:
      "Преобразует **числовой балл** (0–100) в **буквенную оценку** и **GPA**:\n\n- 90–100: A (4.0)\n- 80–89: B (3.0)\n- 70–79: C (2.0)\n- 60–69: D (1.0)\n- 0–59: F (0.0)",
    signature: "calculateGrade(score: number): { grade: string; gpa: number }",
    topics: ["Классы эквивалентности", "Граничные значения", "Таблицы решений"],
    params: [
      { name: "score", type: "number", description: "Числовой балл (0–100)" },
    ],
    returnType: "{ grade: string; gpa: number }",
    code: `function calculateGrade(score: number): { grade: string; gpa: number } {
  if (typeof score !== "number" || isNaN(score))
    throw new Error("Балл должен быть числом");
  if (score < 0) throw new Error("Балл не может быть отрицательным");
  if (score > 100) throw new Error("Балл не может превышать 100");
  if (score >= 90) return { grade: "A", gpa: 4.0 };
  if (score >= 80) return { grade: "B", gpa: 3.0 };
  if (score >= 70) return { grade: "C", gpa: 2.0 };
  if (score >= 60) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
}`,
    equivalenceClasses: [
      {
        id: "t14-ec1",
        name: "EC1: Отлично (90-100)",
        description: "Высшая оценка A",
        exampleValues: [90, 95, 100],
      },
      {
        id: "t14-ec2",
        name: "EC2: Хорошо (80-89)",
        description: "Оценка B",
        exampleValues: [80, 85, 89],
      },
      {
        id: "t14-ec3",
        name: "EC3: Удовлетворительно (70-79)",
        description: "Оценка C",
        exampleValues: [70, 75, 79],
      },
      {
        id: "t14-ec4",
        name: "EC4: Минимальный проходной (60-69)",
        description: "Оценка D",
        exampleValues: [60, 65, 69],
      },
      {
        id: "t14-ec5",
        name: "EC5: Неудовлетворительно (0-59)",
        description: "Оценка F",
        exampleValues: [0, 30, 59],
      },
      {
        id: "t14-ec6",
        name: "EC6: score < 0",
        description: "Недопустимый балл",
        exampleValues: [-1, -50],
      },
      {
        id: "t14-ec7",
        name: "EC7: score > 100",
        description: "Превышение максимума",
        exampleValues: [101, 150],
      },
      {
        id: "t14-ec8",
        name: "EC8: Нечисловой аргумент",
        description: "Неверный тип",
        exampleValues: ["85", null, undefined],
      },
    ],
    boundaryValues: [
      { value: 0, description: "Минимальный балл (F)" },
      { value: 59, description: "Максимум F" },
      { value: 60, description: "Минимум D (граница)" },
      { value: 69, description: "Максимум D" },
      { value: 70, description: "Минимум C (граница)" },
      { value: 79, description: "Максимум C" },
      { value: 80, description: "Минимум B (граница)" },
      { value: 89, description: "Максимум B" },
      { value: 90, description: "Минимум A (граница)" },
      { value: 100, description: "Максимальный балл" },
    ],
  },
  {
    id: 15,
    name: "Очередь (Queue)",
    difficulty: "Сложно",
    description:
      "Реализует операции **очереди** (FIFO):\n\n- `enqueue` — добавить элемент в конец\n- `dequeue` — удалить элемент из начала\n- `peek` — посмотреть первый элемент\n- `isEmpty` — проверка на пустоту\n- `size` — размер очереди\n\nМаксимальный размер очереди: 100 элементов.",
    signature: "queueOperation(queue: string[], operation: string, item?: string): { queue: string[]; result?: string }",
    topics: ["Классы эквивалентности", "Тестирование состояний", "Проверка коллекций"],
    params: [
      { name: "queue", type: "string[]", description: "Текущее состояние очереди" },
      { name: "operation", type: "string", description: "Операция: enqueue, dequeue, peek, isEmpty, size" },
      { name: "item", type: "string (опционально)", description: "Элемент для enqueue" },
    ],
    returnType: "{ queue: string[]; result?: string }",
    code: `function queueOperation(
  queue: string[],
  operation: string,
  item?: string
): { queue: string[]; result?: string } {
  if (!Array.isArray(queue)) throw new Error("Очередь должна быть массивом");
  if (typeof operation !== "string") throw new Error("Операция должна быть строкой");
  if (queue.length > 100) throw new Error("Очередь слишком большая (макс. 100 элементов)");
  const q = [...queue];
  switch (operation) {
    case "enqueue":
      if (item === undefined) throw new Error("Для enqueue нужен элемент");
      if (q.length >= 100) throw new Error("Очередь заполнена");
      q.push(item);
      return { queue: q };
    case "dequeue":
      if (q.length === 0) throw new Error("Очередь пуста");
      const dequeued = q.shift();
      return { queue: q, result: dequeued };
    case "peek":
      if (q.length === 0) throw new Error("Очередь пуста");
      return { queue: q, result: q[0] };
    case "isEmpty":
      return { queue: q, result: String(q.length === 0) };
    case "size":
      return { queue: q, result: String(q.length) };
    default:
      throw new Error(\`Неизвестная операция: \${operation}\`);
  }
}`,
    equivalenceClasses: [
      {
        id: "t15-ec1",
        name: "EC1: Enqueue в непустую очередь",
        description: "Добавление элемента",
        exampleValues: [[["a", "b"], "enqueue", "c"]],
      },
      {
        id: "t15-ec2",
        name: "EC2: Enqueue в пустую очередь",
        description: "Первый элемент",
        exampleValues: [[[], "enqueue", "first"]],
      },
      {
        id: "t15-ec3",
        name: "EC3: Dequeue из непустой",
        description: "Извлечение элемента",
        exampleValues: [[["a", "b"], "dequeue"]],
      },
      {
        id: "t15-ec4",
        name: "EC4: Dequeue из пустой",
        description: "Ошибка — очередь пуста",
        exampleValues: [[[], "dequeue"]],
      },
      {
        id: "t15-ec5",
        name: "EC5: Peek из непустой",
        description: "Просмотр первого элемента",
        exampleValues: [[["a", "b"], "peek"]],
      },
      {
        id: "t15-ec6",
        name: "EC6: Peek из пустой",
        description: "Ошибка — очередь пуста",
        exampleValues: [[[], "peek"]],
      },
      {
        id: "t15-ec7",
        name: "EC7: isEmpty",
        description: "Проверка на пустоту",
        exampleValues: [[["a"], "isEmpty"], [[], "isEmpty"]],
      },
      {
        id: "t15-ec8",
        name: "EC8: size",
        description: "Получение размера",
        exampleValues: [[["a", "b", "c"], "size"]],
      },
      {
        id: "t15-ec9",
        name: "EC9: Неизвестная операция",
        description: "Ошибка — операция не распознана",
        exampleValues: [[["a"], "unknown"]],
      },
      {
        id: "t15-ec10",
        name: "EC10: Enqueue без элемента",
        description: "Ошибка — отсутствует элемент",
        exampleValues: [[["a"], "enqueue"]],
      },
      {
        id: "t15-ec11",
        name: "EC11: Переполнение очереди",
        description: "Очередь достигла 100 элементов",
        exampleValues: [Array(100).fill("x"), "enqueue", "overflow"],
      },
    ],
    boundaryValues: [
      { value: [[], "enqueue", "first"], description: "Первый элемент в пустую" },
      { value: [["a"], "dequeue"], description: "Последний элемент" },
      { value: [[], "dequeue"], description: "Dequeue из пустой — ошибка" },
      { value: [Array(99).fill("x"), "enqueue", "last"], description: "Предпоследний" },
      { value: [Array(100).fill("x"), "enqueue", "overflow"], description: "Переполнение" },
    ],
  },
  {
    id: 16,
    name: "Бинарный поиск",
    difficulty: "Средне",
    description:
      "Выполняет **бинарный поиск** элемента в отсортированном массиве. Возвращает индекс элемента или `-1`, если элемент не найден.\n\n**Важно:** массив должен быть отсортирован по возрастанию!",
    signature: "binarySearch(arr: number[], target: number): number",
    topics: ["Классы эквивалентности", "Граничные значения", "Проверка коллекций"],
    params: [
      { name: "arr", type: "number[]", description: "Отсортированный массив чисел" },
      { name: "target", type: "number", description: "Искомый элемент" },
    ],
    returnType: "number",
    code: `function binarySearch(arr: number[], target: number): number {
  if (!Array.isArray(arr)) throw new Error("Аргумент должен быть массивом");
  if (typeof target !== "number" || isNaN(target))
    throw new Error("Цель должна быть числом");
  for (const item of arr) {
    if (typeof item !== "number" || isNaN(item))
      throw new Error("Все элементы должны быть числами");
  }
  // Проверка сортировки
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) throw new Error("Массив должен быть отсортирован");
  }
  if (arr.length === 0) return -1;
  if (arr.length > 10000) throw new Error("Массив слишком большой (макс. 10000 элементов)");
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    equivalenceClasses: [
      {
        id: "t16-ec1",
        name: "EC1: Элемент найден",
        description: "Target присутствует в массиве",
        exampleValues: [[[1, 3, 5, 7, 9], 5], [[2, 4, 6, 8], 8]],
      },
      {
        id: "t16-ec2",
        name: "EC2: Элемент не найден",
        description: "Target отсутствует в массиве",
        exampleValues: [[[1, 3, 5, 7], 4], [[10, 20, 30], 25]],
      },
      {
        id: "t16-ec3",
        name: "EC3: Пустой массив",
        description: "Возвращает -1",
        exampleValues: [[[], 5]],
      },
      {
        id: "t16-ec4",
        name: "EC4: Один элемент — найден",
        description: "Массив из 1 элемента, совпадает",
        exampleValues: [[[42], 42]],
      },
      {
        id: "t16-ec5",
        name: "EC5: Один элемент — не найден",
        description: "Массив из 1 элемента, не совпадает",
        exampleValues: [[[42], 10]],
      },
      {
        id: "t16-ec6",
        name: "EC6: Массив не отсортирован",
        description: "Ошибка — нарушение порядка",
        exampleValues: [[[5, 3, 7], 3], [[10, 2, 8], 2]],
      },
      {
        id: "t16-ec7",
        name: "EC7: Target меньше min",
        description: "Цель ниже всех элементов",
        exampleValues: [[[5, 10, 15], 2]],
      },
      {
        id: "t16-ec8",
        name: "EC8: Target больше max",
        description: "Цель выше всех элементов",
        exampleValues: [[[5, 10, 15], 20]],
      },
      {
        id: "t16-ec9",
        name: "EC9: Дубликаты в массиве",
        description: "Массив с повторяющимися элементами",
        exampleValues: [[[2, 2, 2, 5, 5], 2]],
      },
    ],
    boundaryValues: [
      { value: [[1, 2, 3], 1], description: "Первый элемент" },
      { value: [[1, 2, 3], 3], description: "Последний элемент" },
      { value: [[1, 2, 3], 2], description: "Средний элемент" },
      { value: [[], 1], description: "Пустой массив" },
      { value: [[5], 5], description: "Один элемент — найден" },
      { value: [[5], 3], description: "Один элемент — не найден" },
      { value: [[1, 3, 5, 7, 9], 0], description: "Ниже минимума" },
      { value: [[1, 3, 5, 7, 9], 10], description: "Выше максимума" },
    ],
  },
  {
    id: 17,
    name: "Анализ текста",
    difficulty: "Средне",
    description:
      "Анализирует **текстовую строку** и возвращает статистику:\n\n- Количество слов\n- Количество предложений\n- Средняя длина слова\n\nРазделители слов: пробелы. Разделители предложений: `.`, `!`, `?`.",
    signature: "analyzeText(text: string): { words: number; sentences: number; avgWordLength: number }",
    topics: ["Классы эквивалентности", "Проверка форматов", "Обработка строк"],
    params: [
      { name: "text", type: "string", description: "Текст для анализа (макс. 10000 символов)" },
    ],
    returnType: "{ words: number; sentences: number; avgWordLength: number }",
    code: `function analyzeText(text: string): {
  words: number;
  sentences: number;
  avgWordLength: number;
} {
  if (typeof text !== "string") throw new Error("Текст должен быть строкой");
  if (text.length === 0) return { words: 0, sentences: 0, avgWordLength: 0 };
  if (text.length > 10000) throw new Error("Текст слишком длинный (макс. 10000 символов)");
  const trimmed = text.trim();
  if (trimmed.length === 0) return { words: 0, sentences: 0, avgWordLength: 0 };
  const words = trimmed.split(/\\s+/).filter((w) => w.length > 0);
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const totalWordLength = words.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = words.length > 0 ? Math.round((totalWordLength / words.length) * 100) / 100 : 0;
  return {
    words: words.length,
    sentences: sentences.length,
    avgWordLength,
  };
}`,
    equivalenceClasses: [
      {
        id: "t17-ec1",
        name: "EC1: Обычный текст",
        description: "Несколько предложений с словами",
        exampleValues: ["Hello world. This is a test!"],
      },
      {
        id: "t17-ec2",
        name: "EC2: Пустая строка",
        description: "Нулевой результат",
        exampleValues: [""],
      },
      {
        id: "t17-ec3",
        name: "EC3: Строка из пробелов",
        description: "Только whitespace",
        exampleValues: ["   ", "\t\n"],
      },
      {
        id: "t17-ec4",
        name: "EC4: Одно слово",
        description: "Без предложений",
        exampleValues: ["Hello"],
      },
      {
        id: "t17-ec5",
        name: "EC5: Одно предложение",
        description: "Завершается точкой",
        exampleValues: ["Hello world."],
      },
      {
        id: "t17-ec6",
        name: "EC6: Множество предложений",
        description: "Разные разделители",
        exampleValues: ["Hi! How are you? I'm fine."],
      },
      {
        id: "t17-ec7",
        name: "EC7: Текст без знаков препинания",
        description: "Только слова",
        exampleValues: ["hello world foo bar"],
      },
      {
        id: "t17-ec8",
        name: "EC8: Текст с лишними пробелами",
        description: "Множественные пробелы между словами",
        exampleValues: ["Hello   world.  Test."],
      },
      {
        id: "t17-ec9",
        name: "EC9: Превышение длины",
        description: "Текст > 10000 символов",
        exampleValues: ["a".repeat(10001)],
      },
      {
        id: "t17-ec10",
        name: "EC10: Не строковый тип",
        description: "Неверный тип",
        exampleValues: [123, null, undefined],
      },
    ],
    boundaryValues: [
      { value: "", description: "Пустая строка" },
      { value: "a", description: "Один символ" },
      { value: "Hello", description: "Одно слово" },
      { value: "Hello.", description: "Одно слово с точкой" },
      { value: "A B C.", description: "Короткие слова" },
      { value: "One. Two! Three?", description: "Три предложения" },
      { value: "  Hello  World.  ", description: "С пробелами по краям" },
    ],
  },
];

export function runReferenceFunction(
  taskId: number,
  args: unknown[]
): { result: unknown; error: string | null } {
  const fn = referenceFunctions[taskId];
  if (!fn) return { result: undefined, error: "Функция не найдена" };
  try {
    const result = fn(args);
    return { result, error: null };
  } catch (e) {
    return { result: undefined, error: (e as Error).message };
  }
}
