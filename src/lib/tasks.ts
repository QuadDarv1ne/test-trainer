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
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
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
        id: "ec1",
        name: "EC1: n = 0",
        description: "Граничное значение — факториал 0 равен 1",
        exampleValues: [0],
      },
      {
        id: "ec2",
        name: "EC2: 1 ≤ n ≤ 20",
        description: "Нормальные значения",
        exampleValues: [1, 5, 10, 20],
      },
      {
        id: "ec3",
        name: "EC3: n < 0",
        description: "Недопустимые — ошибка",
        exampleValues: [-1, -5],
      },
      {
        id: "ec4",
        name: "EC4: n > 20",
        description: "Переполнение",
        exampleValues: [21, 100],
      },
      {
        id: "ec5",
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
        id: "ec1",
        name: "EC1: n ≤ 1",
        description: "Недопустимые — не являются простыми",
        exampleValues: [0, 1, -3],
      },
      {
        id: "ec2",
        name: "EC2: n = 2",
        description: "Единственное чётное простое число",
        exampleValues: [2],
      },
      {
        id: "ec3",
        name: "EC3: Простое нечётное",
        description: "Нечётные простые числа",
        exampleValues: [3, 5, 7, 11, 13],
      },
      {
        id: "ec4",
        name: "EC4: Составное число",
        description: "Числа, которые не являются простыми",
        exampleValues: [4, 6, 8, 9, 10],
      },
      {
        id: "ec5",
        name: "EC5: Большое число",
        description: "Проверка на больших значениях",
        exampleValues: [997, 1000, 7919],
      },
      {
        id: "ec6",
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
        id: "ec1",
        name: "EC1: Без скидки",
        description: "price > 0, discountPercent = 0",
        exampleValues: [[100, 0]],
      },
      {
        id: "ec2",
        name: "EC2: Частичная скидка",
        description: "price > 0, 0 < discountPercent < 100",
        exampleValues: [[100, 25], [500, 50]],
      },
      {
        id: "ec3",
        name: "EC3: Бесплатно",
        description: "price > 0, discountPercent = 100",
        exampleValues: [[100, 100]],
      },
      {
        id: "ec4",
        name: "EC4: price = 0",
        description: "Нулевая цена",
        exampleValues: [[0, 50]],
      },
      {
        id: "ec5",
        name: "EC5: price < 0",
        description: "Недопустимая цена",
        exampleValues: [[-100, 10]],
      },
      {
        id: "ec6",
        name: "EC6: discountPercent < 0",
        description: "Отрицательная скидка",
        exampleValues: [[100, -10]],
      },
      {
        id: "ec7",
        name: "EC7: discountPercent > 100",
        description: "Скидка больше 100%",
        exampleValues: [[100, 150]],
      },
      {
        id: "ec8",
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
        id: "ec1",
        name: "EC1: Делится на 400",
        description: "Високосный год (правило 400)",
        exampleValues: [1600, 2000, 2400],
      },
      {
        id: "ec2",
        name: "EC2: Делится на 100, но не на 400",
        description: "Не високосный год (исключение 100)",
        exampleValues: [1700, 1800, 1900, 2100],
      },
      {
        id: "ec3",
        name: "EC3: Делится на 4, но не на 100",
        description: "Високосный год (правило 4)",
        exampleValues: [2004, 2008, 2024, 2028],
      },
      {
        id: "ec4",
        name: "EC4: Не делится на 4",
        description: "Обычный год",
        exampleValues: [2023, 2025, 2026],
      },
      {
        id: "ec5",
        name: "EC5: year ≤ 0",
        description: "Недопустимое значение",
        exampleValues: [0, -1, -100],
      },
      {
        id: "ec6",
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
        id: "ec1",
        name: "EC1: Равносторонний",
        description: "Все три стороны равны",
        exampleValues: [[3, 3, 3], [5, 5, 5]],
      },
      {
        id: "ec2",
        name: "EC2: Равнобедренный",
        description: "Две стороны равны",
        exampleValues: [[2, 2, 3], [5, 5, 8]],
      },
      {
        id: "ec3",
        name: "EC3: Разносторонний",
        description: "Все стороны разные",
        exampleValues: [[3, 4, 5], [5, 7, 9]],
      },
      {
        id: "ec4",
        name: "EC4: Не треугольник",
        description: "Не выполняется неравенство треугольника",
        exampleValues: [[1, 1, 3], [1, 2, 10]],
      },
      {
        id: "ec5",
        name: "EC5: Сторона ≤ 0",
        description: "Недопустимые значения",
        exampleValues: [[-1, 2, 3], [0, 0, 0]],
      },
      {
        id: "ec6",
        name: "EC6: Вырожденный",
        description: "Сумма двух сторон равна третьей",
        exampleValues: [[1, 2, 3], [2, 3, 5]],
      },
      {
        id: "ec7",
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
        id: "ec1",
        name: "EC1: Валидный пароль",
        description: "Соответствует всем требованиям",
        exampleValues: ["Abc123!@", "MyPass99#"],
      },
      {
        id: "ec2",
        name: "EC2: Длина < 8",
        description: "Слишком короткий",
        exampleValues: ["Ab1!", "A1!a"],
      },
      {
        id: "ec3",
        name: "EC3: Нет заглавных",
        description: "Отсутствуют заглавные буквы",
        exampleValues: ["abcdef12!"],
      },
      {
        id: "ec4",
        name: "EC4: Нет строчных",
        description: "Отсутствуют строчные буквы",
        exampleValues: ["ABCDEF12!"],
      },
      {
        id: "ec5",
        name: "EC5: Нет цифр",
        description: "Отсутствуют цифры",
        exampleValues: ["Abcdefgh!"],
      },
      {
        id: "ec6",
        name: "EC6: Нет спецсимволов",
        description: "Отсутствуют спецсимволы",
        exampleValues: ["Abcdef12"],
      },
      {
        id: "ec7",
        name: "EC7: Комбинации нарушений",
        description: "Несколько нарушений одновременно",
        exampleValues: ["abc", "ABC", "12345678"],
      },
      {
        id: "ec8",
        name: "EC8: Пустая строка",
        description: "Пустой пароль",
        exampleValues: [""],
      },
      {
        id: "ec9",
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
        id: "ec1",
        name: "EC1: Нормальная подстрока",
        description: "start в пределах строки, length корректна",
        exampleValues: [["hello", " world", 0, 3]],
      },
      {
        id: "ec2",
        name: "EC2: start = 0",
        description: "Подстрока с начала строки",
        exampleValues: [["abc", "def", 0, 2]],
      },
      {
        id: "ec3",
        name: "EC3: start ≥ str1.length",
        description: "Позиция за пределами строки — возвращается конкатенация",
        exampleValues: [["ab", "cd", 5, 2]],
      },
      {
        id: "ec4",
        name: "EC4: length = 0",
        description: "Нулевая длина подстроки",
        exampleValues: [["abc", "def", 1, 0]],
      },
      {
        id: "ec5",
        name: "EC5: length > остатка строки",
        description: "Длина обрезается до конца строки",
        exampleValues: [["abc", "def", 1, 10]],
      },
      {
        id: "ec6",
        name: "EC6: Пустая str1",
        description: "Первая строка пустая",
        exampleValues: [["", "abc", 0, 1]],
      },
      {
        id: "ec7",
        name: "EC7: Пустая str2",
        description: "Вторая строка пустая",
        exampleValues: [["abc", "", 0, 2]],
      },
      {
        id: "ec8",
        name: "EC8: start < 0",
        description: "Недопустимая позиция",
        exampleValues: [["abc", "def", -1, 2]],
      },
      {
        id: "ec9",
        name: "EC9: length < 0",
        description: "Недопустимая длина",
        exampleValues: [["abc", "def", 0, -1]],
      },
      {
        id: "ec10",
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
        id: "ec1",
        name: "EC1: Валидная дата",
        description: "Корректные день, месяц, год",
        exampleValues: [[15, 6, 2024], [1, 1, 2000]],
      },
      {
        id: "ec2",
        name: "EC2: 29 февраля високосного года",
        description: "Валидный високосный год",
        exampleValues: [[29, 2, 2024], [29, 2, 2000]],
      },
      {
        id: "ec3",
        name: "EC3: 29 февраля невисокосного года",
        description: "Невалидный день для февраля",
        exampleValues: [[29, 2, 2023], [29, 2, 1900]],
      },
      {
        id: "ec4",
        name: "EC4: 31 день в месяце с 30 днями",
        description: "Превышение дней в месяце",
        exampleValues: [[31, 4, 2024], [31, 6, 2024]],
      },
      {
        id: "ec5",
        name: "EC5: month < 1 или month > 12",
        description: "Недопустимый месяц",
        exampleValues: [[15, 0, 2024], [15, 13, 2024]],
      },
      {
        id: "ec6",
        name: "EC6: day < 1",
        description: "Недопустимый день",
        exampleValues: [[0, 6, 2024], [-1, 6, 2024]],
      },
      {
        id: "ec7",
        name: "EC7: year < 1 или year > 9999",
        description: "Недопустимый год",
        exampleValues: [[15, 6, 0], [15, 6, 10000]],
      },
      {
        id: "ec8",
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
        id: "ec1",
        name: "EC1: Массив с положительными числами",
        description: "Все элементы ≥ 0",
        exampleValues: [[5, 3, 1, 4, 2]],
      },
      {
        id: "ec2",
        name: "EC2: Массив с отрицательными",
        description: "Смешанные — отрицательные отфильтровываются",
        exampleValues: [[-3, 5, -1, 2, 0]],
      },
      {
        id: "ec3",
        name: "EC3: Пустой массив",
        description: "Возвращает пустой массив",
        exampleValues: [[]],
      },
      {
        id: "ec4",
        name: "EC4: Один элемент",
        description: "Одиночный элемент",
        exampleValues: [[42], [-5], [0]],
      },
      {
        id: "ec5",
        name: "EC5: Все отрицательные",
        description: "Результат — пустой массив",
        exampleValues: [[-1, -2, -3]],
      },
      {
        id: "ec6",
        name: "EC6: Дубликаты",
        description: "Массив с повторяющимися элементами",
        exampleValues: [[3, 1, 3, 2, 1]],
      },
      {
        id: "ec7",
        name: "EC7: Содержит NaN",
        description: "Недопустимый элемент",
        exampleValues: [[1, NaN, 3]],
      },
      {
        id: "ec8",
        name: "EC8: Не массив",
        description: "Неверный тип",
        exampleValues: ["not an array", 42, null],
      },
      {
        id: "ec9",
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
        id: "ec1",
        name: "EC1: Валидный email",
        description: "Корректный формат",
        exampleValues: ["user@example.com", "test.user@domain.org"],
      },
      {
        id: "ec2",
        name: "EC2: Пустая строка",
        description: "Пустой email",
        exampleValues: [""],
      },
      {
        id: "ec3",
        name: "EC3: Слишком длинный",
        description: "Длина > 254 символа",
        exampleValues: ["a".repeat(250) + "@example.com"],
      },
      {
        id: "ec4",
        name: "EC4: Без @",
        description: "Отсутствует символ @",
        exampleValues: ["userexample.com", "user.example.com"],
      },
      {
        id: "ec5",
        name: "EC5: Пустая локальная часть",
        description: "@ в начале",
        exampleValues: ["@example.com"],
      },
      {
        id: "ec6",
        name: "EC6: Нет точки в домене",
        description: "Домен без TLD",
        exampleValues: ["user@example"],
      },
      {
        id: "ec7",
        name: "EC7: TLD короче 2 символов",
        description: "Однобуквенный домен верхнего уровня",
        exampleValues: ["user@example.c"],
      },
      {
        id: "ec8",
        name: "EC8: Спецсимволы в локальной части",
        description: "Недопустимые символы до @",
        exampleValues: ["user name@example.com", "user#name@example.com"],
      },
      {
        id: "ec9",
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
];

export function getTaskById(id: number): Task | undefined {
  return tasks.find((t) => t.id === id);
}

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
