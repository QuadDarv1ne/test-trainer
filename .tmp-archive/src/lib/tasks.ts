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

function toRoman(n: number): string {
  if (!Number.isInteger(n)) throw new Error("Аргумент должен быть целым числом");
  if (n < 1) throw new Error("Число должно быть больше 0");
  if (n > 3999) throw new Error("Число не должно превышать 3999");
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

function isValidDate(day: number, month: number, year: number): boolean {
  if ([day, month, year].some(v => typeof v !== "number" || isNaN(v)))
    throw new Error("Аргументы должны быть числами");
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year))
    throw new Error("Аргументы должны быть целыми числами");
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return false;
  return true;
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

// Map of reference functions
export const referenceFunctions: Record<
  number,
  (...args: unknown[]) => unknown
> = {
  1: (args) => factorial(args[0] as number),
  2: (args) => isPrime(args[0] as number),
  3: (args) => applyDiscount(args[0] as number, args[1] as number),
  4: (args) => isLeapYear(args[0] as number),
  5: (args) => triangleType(args[0] as number, args[1] as number, args[2] as number),
  6: (args) => validatePassword(args[0] as string),
  7: (args) => {
    const str = args[0] as string;
    if (typeof str !== "string") throw new Error("Аргумент должен быть строкой");
    const cleaned = str.toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");
    return cleaned === cleaned.split("").reverse().join("");
  },
  8: (args) => {
    const email = args[0] as string;
    if (typeof email !== "string") throw new Error("Аргумент должен быть строкой");
    const errors: string[] = [];
    if (!email.includes("@")) {
      errors.push("Отсутствует символ @");
    } else if (email.indexOf("@") !== email.lastIndexOf("@")) {
      errors.push("Более одного символа @");
    } else {
      const [local, domain] = email.split("@");
      if (!local || local.length === 0) errors.push("Пустая локальная часть (до @)");
      else if (!/^[a-zA-Z0-9.\-]+$/.test(local)) errors.push("Недопустимые символы в локальной части");
      if (!domain || domain.length === 0) errors.push("Пустая доменная часть (после @)");
      else if (!domain.includes(".")) errors.push("Домен не содержит точку");
      else {
        const parts = domain.split(".");
        const tld = parts[parts.length - 1];
        if (tld.length < 2) errors.push("Домен верхнего уровня слишком короткий (минимум 2 символа)");
        else if (tld.length > 6) errors.push("Домен верхнего уровня слишком длинный (максимум 6 символов)");
        if (!/^[a-zA-Z0-9.\-]+$/.test(domain)) errors.push("Недопустимые символы в домене");
      }
    }
    return { valid: errors.length === 0, errors };
  },
  9: (args) => toRoman(args[0] as number),
  10: (args) => isValidDate(args[0] as number, args[1] as number, args[2] as number),
};

export const tasks: Task[] = [
  {
    id: 1,
    name: "Факториал",
    difficulty: "Легко",
    description:
      "Вычисляет факториал целого неотрицательного числа n. Факториал нуля равен 1, для чисел больше 20 происходит переполнение.",
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
      "Проверяет, является ли целое число n простым. Простое число — это натуральное число больше 1, которое делится только на 1 и на себя.",
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
      "Применяет скидку к цене. Принимает цену и процент скидки, возвращает итоговую сумму со скидкой. Скидка округляется до 2 знаков.",
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
      "Проверяет, является ли год високосным. Год високосный, если он делится на 4, но не на 100, за исключением годов, делящихся на 400.",
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
      "Определяет тип треугольника по трём сторонам. Возвращает «равносторонний», «равнобедренный», «разносторонний» или «не треугольник».",
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
      "Проверяет пароль на соответствие требованиям безопасности: минимум 8 символов, хотя бы одна заглавная и одна строчная буква, хотя бы одна цифра и один спецсимвол.",
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
    name: "Палиндром",
    difficulty: "Средне",
    description: "Функция проверяет, является ли строка палиндромом (читается одинаково слева направо и справа налево). Учитываются только буквы и цифры, регистр игнорируется. Пустая строка считается палиндромом.",
    signature: "isPalindrome(str: string): boolean",
    topics: ["Классы эквивалентности", "Граничные значения", "Обработка строк"],
    params: [
      { name: "str", type: "string", description: "Проверяемая строка" }
    ],
    returnType: "boolean",
    code: `function isPalindrome(str: string): boolean {
  if (typeof str !== "string") {
    throw new Error("Аргумент должен быть строкой");
  }
  const cleaned = str.toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");
  return cleaned === cleaned.split("").reverse().join("");
}`,
    equivalenceClasses: [
      { id: "ec1", name: "EC1: Палиндром (латиница)", description: "Строка-палиндром из латинских букв", exampleValues: ["aba", "racecar"] },
      { id: "ec2", name: "EC2: Палиндром (кириллица)", description: "Строка-палиндром из русских букв", exampleValues: ["Анна", "казак"] },
      { id: "ec3", name: "EC3: Не палиндром", description: "Строка, не являющаяся палиндромом", exampleValues: ["hello", "тест"] },
      { id: "ec4", name: "EC4: Палиндром с пробелами/знаками", description: "Палиндром с пробелами, знаками препинания или цифрами", exampleValues: ["A man a plan a canal Panama", "12321", "Madam, I'm Adam"] },
      { id: "ec5", name: "EC5: Пустая строка", description: "Пустая строка (считается палиндромом)", exampleValues: [""] },
      { id: "ec6", name: "EC6: Один символ", description: "Строка из одного символа (всегда палиндром)", exampleValues: ["a", "Я"] },
      { id: "ec7", name: "EC7: Недопустимый тип", description: "Аргумент не является строкой", exampleValues: [123, null] },
    ],
    boundaryValues: [
      { value: "", description: "Пустая строка (нижняя граница длины)" },
      { value: "a", description: "Один символ (минимальная длина)" },
      { value: "aa", description: "Два одинаковых символа" },
      { value: "ab", description: "Два разных символа (минимальный не-палиндром)" },
      { value: "A", description: "Один символ, верхний регистр" },
      { value: "a b a", description: "Палиндром с пробелом" },
      { value: "12321", description: "Числовой палиндром" },
    ],
  },
  {
    id: 8,
    name: "Валидация email",
    difficulty: "Сложно",
    description: "Функция проверяет корректность email-адреса по следующим правилам: содержит ровно один символ @, локальная часть (до @) не пустая и содержит только буквы, цифры, точки и дефисы, доменная часть (после @) содержит хотя бы одну точку, домен верхнего уровня — от 2 до 6 букв.",
    signature: "validateEmail(email: string): { valid: boolean; errors: string[] }",
    topics: ["Классы эквивалентности", "Граничные значения", "Комбинаторное тестирование", "Формат проверок"],
    params: [
      { name: "email", type: "string", description: "Проверяемый email-адрес" }
    ],
    returnType: "{ valid: boolean; errors: string[] }",
    code: `function validateEmail(email: string): { valid: boolean; errors: string[] } {
  if (typeof email !== "string") {
    throw new Error("Аргумент должен быть строкой");
  }
  const errors: string[] = [];

  if (!email.includes("@")) {
    errors.push("Отсутствует символ @");
  } else if (email.indexOf("@") !== email.lastIndexOf("@")) {
    errors.push("Более одного символа @");
  } else {
    const [local, domain] = email.split("@");
    if (!local || local.length === 0) {
      errors.push("Пустая локальная часть (до @)");
    } else if (!/^[a-zA-Z0-9.\-]+$/.test(local)) {
      errors.push("Недопустимые символы в локальной части");
    }
    if (!domain || domain.length === 0) {
      errors.push("Пустая доменная часть (после @)");
    } else if (!domain.includes(".")) {
      errors.push("Домен не содержит точку");
    } else {
      const parts = domain.split(".");
      const tld = parts[parts.length - 1];
      if (tld.length < 2) {
        errors.push("Домен верхнего уровня слишком короткий (минимум 2 символа)");
      } else if (tld.length > 6) {
        errors.push("Домен верхнего уровня слишком длинный (максимум 6 символов)");
      }
      if (!/^[a-zA-Z0-9.\-]+$/.test(domain)) {
        errors.push("Недопустимые символы в домене");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}`,
    equivalenceClasses: [
      { id: "ec1", name: "EC1: Валидный email", description: "Корректный email-адрес", exampleValues: ["user@example.com", "test.name@domain.org"] },
      { id: "ec2", name: "EC2: Нет символа @", description: "Строка без символа @", exampleValues: ["userexample.com", "plaintext"] },
      { id: "ec3", name: "EC3: Несколько символов @", description: "Более одного @ в строке", exampleValues: ["user@@example.com", "a@b@c.com"] },
      { id: "ec4", name: "EC4: Пустая локальная часть", description: "Локальная часть до @ пустая", exampleValues: ["@example.com"] },
      { id: "ec5", name: "EC5: Недопустимые символы в локальной части", description: "Локальная часть содержит недопустимые символы", exampleValues: ["user name@test.com", "user+tag@test.com"] },
      { id: "ec6", name: "EC6: Пустая доменная часть", description: "Доменная часть после @ пустая", exampleValues: ["user@"] },
      { id: "ec7", name: "EC7: Домен без точки", description: "Домен не содержит точки", exampleValues: ["user@localhost", "user@example"] },
      { id: "ec8", name: "EC8: Слишком короткий TLD", description: "Домен верхнего уровня менее 2 символов", exampleValues: ["user@example.c", "user@example.a"] },
      { id: "ec9", name: "EC9: Слишком длинный TLD", description: "Домен верхнего уровня более 6 символов", exampleValues: ["user@example.abcdefg"] },
      { id: "ec10", name: "EC10: Пустая строка", description: "Пустая строка вместо email", exampleValues: [""] },
      { id: "ec11", name: "EC11: Недопустимый тип", description: "Аргумент не является строкой", exampleValues: [123, null, undefined] },
    ],
    boundaryValues: [
      { value: "a@b.cd", description: "Минимально возможный валидный email" },
      { value: "a@b.c", description: "TLD из 1 символа (слишком короткий)" },
      { value: "a@b.cdefgh", description: "TLD из 6 символов (максимальный)" },
      { value: "a@b.cdefghi", description: "TLD из 7 символов (слишком длинный)" },
      { value: "@example.com", description: "Пустая локальная часть" },
      { value: "user@", description: "Пустая доменная часть" },
      { value: "a b@example.com", description: "Пробел в локальной части" },
      { value: "", description: "Пустая строка" },
    ],
  },
  {
    id: 9,
    name: "Римские цифры",
    difficulty: "Средне",
    description:
      "Преобразует целое число в строку римских цифр. Поддерживает числа от 1 до 3999. Для некорректных входных данных выбрасывает исключение.",
    signature: "toRoman(n: number): string",
    topics: ["Классы эквивалентности", "Граничные значения", "Обработка строк"],
    params: [
      { name: "n", type: "number", description: "Целое число от 1 до 3999" },
    ],
    returnType: "string",
    code: `function toRoman(n: number): string {
  if (!Number.isInteger(n)) throw new Error("Аргумент должен быть целым числом");
  if (n < 1) throw new Error("Число должно быть больше 0");
  if (n > 3999) throw new Error("Число не должно превышать 3999");
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}`,
    equivalenceClasses: [
      {
        id: "ec1",
        name: "EC1: n = 1",
        description: "Минимальное значение",
        exampleValues: [1],
      },
      {
        id: "ec2",
        name: "EC2: 2 ≤ n ≤ 3998",
        description: "Нормальные значения",
        exampleValues: [2, 5, 42, 3998],
      },
      {
        id: "ec3",
        name: "EC3: n = 3999",
        description: "Максимальное значение",
        exampleValues: [3999],
      },
      {
        id: "ec4",
        name: "EC4: n < 1",
        description: "Недопустимые — слишком маленькое",
        exampleValues: [0, -5],
      },
      {
        id: "ec5",
        name: "EC5: n > 3999",
        description: "Недопустимые — слишком большое",
        exampleValues: [4000, 5000],
      },
      {
        id: "ec6",
        name: "EC6: n — не целое число",
        description: "Недопустимый тип",
        exampleValues: [1.5, "abc", null],
      },
    ],
    boundaryValues: [
      { value: 1, description: "Минимальное число (I)" },
      { value: 4, description: "IV — специальный символ вычитания" },
      { value: 5, description: "V — базовый символ" },
      { value: 9, description: "IX — вычитание" },
      { value: 10, description: "X — базовый символ" },
      { value: 3999, description: "Максимальное число (MMMCMXCIX)" },
      { value: 4000, description: "Превышение максимума" },
      { value: 0, description: "Ниже минимума" },
    ],
  },
  {
    id: 10,
    name: "Валидация даты",
    difficulty: "Сложно",
    description:
      "Проверяет, является ли заданная дата корректной с учётом високосных годов, количества дней в месяцах и т.д. Принимает день, месяц и год.",
    signature: "isValidDate(day: number, month: number, year: number): boolean",
    topics: [
      "Классы эквивалентности",
      "Граничные значения",
      "Комбинаторное тестирование",
      "Логические условия",
    ],
    params: [
      { name: "day", type: "number", description: "День (1-31)" },
      { name: "month", type: "number", description: "Месяц (1-12)" },
      { name: "year", type: "number", description: "Год" },
    ],
    returnType: "boolean",
    code: `function isValidDate(day: number, month: number, year: number): boolean {
  if ([day, month, year].some(v => typeof v !== "number" || isNaN(v)))
    throw new Error("Аргументы должны быть числами");
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year))
    throw new Error("Аргументы должны быть целыми числами");
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return false;
  return true;
}`,
    equivalenceClasses: [
      {
        id: "ec1",
        name: "EC1: Валидная дата (обычный год)",
        description: "Корректная дата в обычном году",
        exampleValues: [[15, 6, 2023], [1, 1, 2000]],
      },
      {
        id: "ec2",
        name: "EC2: Валидная дата (високосный год, 29 февраля)",
        description: "29 февраля в високосный год",
        exampleValues: [[29, 2, 2024], [29, 2, 2000]],
      },
      {
        id: "ec3",
        name: "EC3: Невалидный день (слишком большой)",
        description: "День превышает количество дней в месяце",
        exampleValues: [[31, 4, 2023], [32, 1, 2023]],
      },
      {
        id: "ec4",
        name: "EC4: Невалидный день (29 февраля не в високосный)",
        description: "29 февраля в обычный год",
        exampleValues: [[29, 2, 2023], [29, 2, 1900]],
      },
      {
        id: "ec5",
        name: "EC5: Невалидный месяц (< 1 или > 12)",
        description: "Месяц вне допустимого диапазона",
        exampleValues: [[1, 0, 2023], [1, 13, 2023]],
      },
      {
        id: "ec6",
        name: "EC6: Невалидный день (day < 1)",
        description: "День меньше 1",
        exampleValues: [[0, 1, 2023], [-5, 6, 2023]],
      },
      {
        id: "ec7",
        name: "EC7: Граничные дни месяца (30, 31)",
        description: "Дни на границе количества дней в месяце",
        exampleValues: [[30, 6, 2023], [31, 12, 2023]],
      },
      {
        id: "ec8",
        name: "EC8: Нечисловые аргументы",
        description: "Неверный тип аргументов",
        exampleValues: [["a", 1, 2023], [1, null, 2023]],
      },
    ],
    boundaryValues: [
      { value: [1, 1, 2023], description: "Минимальные day и month" },
      { value: [31, 12, 2023], description: "Максимальные day и month" },
      { value: [29, 2, 2024], description: "29 февраля в високосный год" },
      { value: [29, 2, 2023], description: "29 февраля в невисокосный год" },
      { value: [28, 2, 2023], description: "28 февраля (максимум в невисокосный)" },
      { value: [30, 2, 2023], description: "30 февраля (невалидно)" },
      { value: [31, 4, 2023], description: "31 апреля (невалидно)" },
      { value: [0, 1, 2023], description: "День = 0" },
      { value: [1, 13, 2023], description: "Месяц > 12" },
      { value: [1, 0, 2023], description: "Месяц < 1" },
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
