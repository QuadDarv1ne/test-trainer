import {
  type Task,
  type TestCaseCategory,
  runReferenceFunction,
} from "./tasks";

export interface TestCase {
  id: string;
  inputs: string[];
  expectedOutput: string;
  category: TestCaseCategory;
  comment: string;
}

export interface TestCaseResult {
  testCase: TestCase;
  actualOutput: string;
  isCorrect: boolean;
  coveredClasses: string[];
  coveredBoundaries: string[];
}

export interface EvaluationResult {
  task: Task;
  results: TestCaseResult[];
  ecCoverage: number;
  boundaryCoverage: number;
  correctnessScore: number;
  overallScore: number;
  coveredEcIds: string[];
  uncoveredEcIds: string[];
  coveredBvDescriptions: string[];
  uncoveredBvDescriptions: string[];
  totalEcs: number;
  totalBvs: number;
  coveredEcsCount: number;
  coveredBvsCount: number;
}

function normalizeValue(val: unknown): string {
  if (val === undefined || val === null) return String(val);
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function parseInputValue(raw: string): unknown {
  const trimmed = raw.trim();

  // Handle special strings
  if (trimmed === "null") return null;
  if (trimmed === "undefined") return undefined;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // Handle Russian boolean words
  if (trimmed === "да" || trimmed === "верно") return true;
  if (trimmed === "нет" || trimmed === "неверно") return false;

  // Try parsing as number — allow leading zeros, decimals, negatives
  const num = Number(trimmed);
  if (trimmed !== "" && !isNaN(num)) {
    return num;
  }

  // Try parsing as JSON (for objects, arrays)
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" || Array.isArray(parsed)) return parsed;
  } catch {
    // Not JSON
  }

  // Return as string
  return trimmed;
}

function matchBoundaryValue(
  inputs: unknown[],
  boundaryValue: unknown
): boolean {
  const bv = boundaryValue;

  // If boundary is array, compare with inputs array
  if (Array.isArray(bv)) {
    if (inputs.length !== bv.length) return false;
    return bv.every((val, i) => {
      const parsed = inputs[i];
      return normalizeValue(parsed) === normalizeValue(val);
    });
  }

  // Single value — compare with first input
  if (inputs.length === 1) {
    return normalizeValue(inputs[0]) === normalizeValue(bv);
  }

  return false;
}

function findCoveredEquivalenceClasses(
  taskId: number,
  inputs: unknown[],
  task: Task
): string[] {
  const covered: string[] = [];

  // Run the function to see the result
  const { result, error } = runReferenceFunction(taskId, inputs);

  for (const ec of task.equivalenceClasses) {
    // Check if any example value matches
    for (const example of ec.exampleValues) {
      if (Array.isArray(example)) {
        if (inputs.length === example.length) {
          const match = example.every(
            (val, i) =>
              normalizeValue(inputs[i]) === normalizeValue(val)
          );
          if (match) {
            covered.push(ec.id);
            break;
          }
        }
      } else {
        if (inputs.length === 1) {
          if (normalizeValue(inputs[0]) === normalizeValue(example)) {
            covered.push(ec.id);
            break;
          }
        }
      }
    }
  }

  // Heuristic: also check by error / result matching
  if (error) {
    // Check if error matches EC descriptions
    for (const ec of task.equivalenceClasses) {
      if (covered.includes(ec.id)) continue;
      const desc = ec.description.toLowerCase();
      if (
        desc.includes("недопустим") ||
        desc.includes("ошибк") ||
        desc.includes("переполнен") ||
        desc.includes("неверный тип")
      ) {
        // If we get an error and there's an error-related EC, cover it
        // But only if the input is in a reasonable range for that EC
        if (
          (desc.includes("отрицательн") && inputs[0] !== undefined && Number(inputs[0]) < 0) ||
          (desc.includes("не число") && !Number.isInteger(inputs[0]) && typeof inputs[0] !== "number") ||
          (desc.includes("переполнен") && Number(inputs[0]) > 20) ||
          (desc.includes("превышает") && Number(inputs[1]) > 100) ||
          (desc.includes("отрицательн") && Number(inputs[1]) !== undefined && Number(inputs[1]) < 0)
        ) {
          covered.push(ec.id);
        }
      }
    }
  }

  // Heuristic for specific tasks based on result
  for (const ec of task.equivalenceClasses) {
    if (covered.includes(ec.id)) continue;

    if (taskId === 1) {
      // Factorial
      if (ec.id === "t1-ec1" && inputs[0] === 0) covered.push(ec.id);
      if (
        ec.id === "t1-ec2" &&
        Number.isInteger(inputs[0]) &&
        Number(inputs[0]) >= 1 &&
        Number(inputs[0]) <= 20
      )
        covered.push(ec.id);
    }

    if (taskId === 2) {
      // isPrime
      if (ec.id === "t2-ec1" && Number(inputs[0]) <= 1) covered.push(ec.id);
      if (ec.id === "t2-ec2" && Number(inputs[0]) === 2) covered.push(ec.id);
      if (
        ec.id === "t2-ec3" &&
        result === true &&
        Number(inputs[0]) > 2
      )
        covered.push(ec.id);
      if (
        ec.id === "t2-ec4" &&
        result === false &&
        Number(inputs[0]) > 1
      )
        covered.push(ec.id);
    }

    if (taskId === 3) {
      // applyDiscount — improved heuristic based on result + input ranges
      const price = Number(inputs[0]);
      const discount = Number(inputs[1]);

      if (ec.id === "t3-ec1" && !error && discount === 0 && price > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec2" && !error && discount > 0 && discount < 100 && price > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec3" && !error && discount === 100 && price > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec4" && !error && price === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec5" && error && typeof price === "number" && !isNaN(price) && price < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec6" && error && typeof discount === "number" && !isNaN(discount) && discount < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec7" && error && typeof discount === "number" && !isNaN(discount) && discount > 100) {
        covered.push(ec.id);
      }
      if (ec.id === "t3-ec8" && error && (typeof inputs[0] !== "number" || typeof inputs[1] !== "number")) {
        covered.push(ec.id);
      }
    }

    if (taskId === 4) {
      // isLeapYear
      if (
        ec.id === "t4-ec1" &&
        Number(inputs[0]) % 400 === 0
      )
        covered.push(ec.id);
      if (
        ec.id === "t4-ec2" &&
        Number(inputs[0]) % 100 === 0 &&
        Number(inputs[0]) % 400 !== 0
      )
        covered.push(ec.id);
      if (
        ec.id === "t4-ec3" &&
        Number(inputs[0]) % 4 === 0 &&
        Number(inputs[0]) % 100 !== 0
      )
        covered.push(ec.id);
      if (
        ec.id === "t4-ec4" &&
        Number(inputs[0]) % 4 !== 0
      )
        covered.push(ec.id);
    }

    if (taskId === 5) {
      // triangle
      if (
        ec.id === "t5-ec1" &&
        result === "равносторонний"
      )
        covered.push(ec.id);
      if (
        ec.id === "t5-ec2" &&
        result === "равнобедренный"
      )
        covered.push(ec.id);
      if (
        ec.id === "t5-ec3" &&
        result === "разносторонний"
      )
        covered.push(ec.id);
      if (
        ec.id === "t5-ec4" &&
        result === "не треугольник"
      )
        covered.push(ec.id);
      if (
        ec.id === "t5-ec6" &&
        result === "не треугольник" &&
        !error
      ) {
        const [a, b, c] = inputs;
        if (typeof a === "number" && typeof b === "number" && typeof c === "number" && (a + b === c || a + c === b || b + c === a))
          covered.push(ec.id);
      }
    }

    if (taskId === 6) {
      // validatePassword — improved heuristic based on result.errors
      if (
        result &&
        typeof result === "object" &&
        "valid" in result &&
        "errors" in result
      ) {
        const res = result as { valid: boolean; errors: string[] };
        const errors = res.errors;
        const inputStr = String(inputs[0]);

        if (ec.id === "t6-ec1" && res.valid) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec2" && errors.includes("Минимум 8 символов") && errors.length === 1) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec3" && errors.some(e => e.includes("заглавну")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec4" && errors.some(e => e.includes("строчну")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec5" && errors.some(e => e.includes("цифр")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec6" && errors.some(e => e.includes("спецсимвол")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec7" && errors.length >= 2 && inputStr !== "" && errors.length < 4) {
          covered.push(ec.id);
        }
        if (ec.id === "t6-ec8" && inputStr === "" && errors.length >= 4) {
          covered.push(ec.id);
        }
      } else if (ec.id === "t6-ec9" && error) {
        covered.push(ec.id);
      }
    }

    if (taskId === 7) {
      // stringTransform
      const s1 = inputs[0];
      const s2 = inputs[1];
      const start = Number(inputs[2]);
      const length = Number(inputs[3]);

      if (ec.id === "t7-ec1" && !error && typeof s1 === "string" && typeof s2 === "string" && start >= 0 && start < s1.length && length > 0 && length <= s1.length - start) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec2" && !error && start === 0 && length > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec3" && !error && typeof s1 === "string" && start >= s1.length) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec4" && !error && length === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec5" && !error && typeof s1 === "string" && length > s1.length - start) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec6" && !error && typeof s1 === "string" && s1 === "") {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec7" && !error && typeof s2 === "string" && s2 === "") {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec8" && error && typeof start === "number" && start < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec9" && error && typeof length === "number" && length < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t7-ec10" && error && (typeof s1 !== "string" || typeof s2 !== "string")) {
        covered.push(ec.id);
      }
    }

    if (taskId === 8) {
      // validateDate
      const day = Number(inputs[0]);
      const month = Number(inputs[1]);
      const _year = Number(inputs[2]);

      if (result && typeof result === "object" && "valid" in result) {
        const res = result as { valid: boolean; reason?: string };

        if (ec.id === "t8-ec1" && res.valid) {
          covered.push(ec.id);
        }
        if (ec.id === "t8-ec2" && res.valid && month === 2 && day === 29) {
          covered.push(ec.id);
        }
        if (ec.id === "t8-ec3" && !res.valid && res.reason?.includes("не более") && month === 2 && day === 29) {
          covered.push(ec.id);
        }
        if (ec.id === "t8-ec4" && !res.valid && res.reason?.includes("не более") && month === 4 && day === 31) {
          covered.push(ec.id);
        }
        if (ec.id === "t8-ec5" && !res.valid && res.reason?.includes("Месяц")) {
          covered.push(ec.id);
        }
        if (ec.id === "t8-ec6" && !res.valid && res.reason?.includes("День")) {
          covered.push(ec.id);
        }
        if (ec.id === "t8-ec7" && !res.valid && res.reason?.includes("Год")) {
          covered.push(ec.id);
        }
      }
      if (ec.id === "t8-ec8" && error) {
        covered.push(ec.id);
      }
    }

    if (taskId === 9) {
      // sortAndFilter
      if (ec.id === "t9-ec1" && !error && Array.isArray(inputs[0]) && (inputs[0] as number[]).every(n => n >= 0)) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec2" && !error && Array.isArray(inputs[0]) && (inputs[0] as number[]).some(n => n < 0) && (inputs[0] as number[]).some(n => n >= 0)) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec3" && !error && Array.isArray(inputs[0]) && (inputs[0] as number[]).length === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec4" && !error && Array.isArray(inputs[0]) && (inputs[0] as number[]).length === 1) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec5" && !error && Array.isArray(inputs[0]) && (inputs[0] as number[]).every(n => n < 0)) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec6" && !error && Array.isArray(inputs[0]) && new Set(inputs[0]).size < (inputs[0] as number[]).length) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec7" && error && Array.isArray(inputs[0]) && (inputs[0] as number[]).some(v => typeof v === "number" && isNaN(v))) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec8" && error && !Array.isArray(inputs[0])) {
        covered.push(ec.id);
      }
      if (ec.id === "t9-ec9" && error && Array.isArray(inputs[0]) && (inputs[0] as number[]).length > 1000) {
        covered.push(ec.id);
      }
    }

    if (taskId === 10) {
      // validateEmail
      if (result && typeof result === "object" && "valid" in result) {
        const res = result as { valid: boolean; reason?: string };
        const email = String(inputs[0]);

        if (ec.id === "t10-ec1" && res.valid) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec2" && !res.valid && res.reason?.includes("Пуст")) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec3" && !res.valid && res.reason?.includes("длинн")) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec4" && !res.valid && res.reason?.includes("@")) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec5" && !res.valid && res.reason?.includes("локальн")) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec6" && !res.valid && res.reason?.includes("домен") && !res.reason?.includes("уровн")) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec7" && !res.valid && res.reason?.includes("уровн")) {
          covered.push(ec.id);
        }
        if (ec.id === "t10-ec8" && !res.valid && email.includes("@") && email.includes(" ")) {
          covered.push(ec.id);
        }
      }
      if (ec.id === "t10-ec9" && error) {
        covered.push(ec.id);
      }
    }
    if (taskId === 11) {
      // passwordStrength
      const pw = String(inputs[0] ?? "");
      if (ec.id === "t11-ec1" && !error && pw === "") {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec2" && !error && pw.length >= 1 && pw.length <= 3) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec3" && !error && pw.length >= 4 && pw.length <= 7) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec4" && !error && pw.length >= 8 && pw.length <= 11) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec5" && !error && pw.length >= 12) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec6" && !error && typeof result === "number" && result === 100) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec7" && !error && pw.length >= 4 && /^[a-zа-яё]+$/.test(pw)) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec8" && !error && pw.length >= 4 && /^[A-ZА-ЯЁ]+$/.test(pw)) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec9" && !error && pw.length >= 4 && /^[0-9]+$/.test(pw)) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec10" && error) {
        covered.push(ec.id);
      }
      if (ec.id === "t11-ec11" && error && typeof inputs[0] === "string" && (inputs[0] as string).length > 128) {
        covered.push(ec.id);
      }
    }

    if (taskId === 12) {
      // calculateShipping
      const weight = Number(inputs[0]);
      const distance = Number(inputs[1]);
      if (ec.id === "t12-ec1" && !error && weight > 0 && weight <= 1) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec2" && !error && weight > 1 && weight <= 5) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec3" && !error && weight > 5 && weight <= 20) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec4" && !error && weight > 20) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec5" && !error && distance > 0 && distance <= 10) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec6" && !error && distance > 10 && distance <= 50) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec7" && !error && distance > 50) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec8" && error && typeof weight === "number" && weight <= 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec9" && error && typeof distance === "number" && distance <= 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec10" && error && typeof weight === "number" && weight > 100) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec11" && error && typeof distance === "number" && distance > 5000) {
        covered.push(ec.id);
      }
      if (ec.id === "t12-ec12" && error && (typeof inputs[0] !== "number" || typeof inputs[1] !== "number")) {
        covered.push(ec.id);
      }
    }

    if (taskId === 13) {
      // validatePhone
      const phone = String(inputs[0] ?? "");
      if (result && typeof result === "object" && "valid" in result) {
        const res = result as { valid: boolean; reason?: string };

        if (ec.id === "t13-ec1" && res.valid) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec2" && !res.valid && res.reason?.includes("Пуст")) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec3" && !res.valid && !phone.startsWith("+")) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec4" && !res.valid && res.reason?.includes("коротк")) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec5" && !res.valid && res.reason?.includes("длинн")) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec6" && res.valid && (phone.includes("-") || phone.includes(" ") || phone.includes("("))) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec7" && !res.valid && res.reason?.includes("Разрешены")) {
          covered.push(ec.id);
        }
        if (ec.id === "t13-ec8" && !res.valid && phone === "+") {
          covered.push(ec.id);
        }
      }
      if (ec.id === "t13-ec9" && error) {
        covered.push(ec.id);
      }
    }

    if (taskId === 14) {
      // calculateGrade
      const score = Number(inputs[0]);
      if (ec.id === "t14-ec1" && !error && result && typeof result === "object" && (result as { grade: string }).grade === "A") {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec2" && !error && result && typeof result === "object" && (result as { grade: string }).grade === "B") {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec3" && !error && result && typeof result === "object" && (result as { grade: string }).grade === "C") {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec4" && !error && result && typeof result === "object" && (result as { grade: string }).grade === "D") {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec5" && !error && result && typeof result === "object" && (result as { grade: string }).grade === "F") {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec6" && error && typeof score === "number" && score < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec7" && error && typeof score === "number" && score > 100) {
        covered.push(ec.id);
      }
      if (ec.id === "t14-ec8" && error && (typeof inputs[0] !== "number" || (typeof inputs[0] === "number" && isNaN(inputs[0] as number)))) {
        covered.push(ec.id);
      }
    }

    if (taskId === 15) {
      // queueOperation
      const op = inputs[1];
      const item = inputs[2];
      const queueLen = Array.isArray(inputs[0]) ? (inputs[0] as unknown[]).length : 0;
      if (ec.id === "t15-ec1" && !error && op === "enqueue" && item && queueLen > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec2" && !error && op === "enqueue" && item && queueLen === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec3" && !error && op === "dequeue" && queueLen > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec4" && error && op === "dequeue" && queueLen === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec5" && !error && op === "peek" && queueLen > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec6" && error && op === "peek" && queueLen === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec7" && !error && op === "isEmpty") {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec8" && !error && op === "size") {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec9" && error && op !== "enqueue" && op !== "dequeue" && op !== "peek" && op !== "isEmpty" && op !== "size") {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec10" && error && op === "enqueue" && !item) {
        covered.push(ec.id);
      }
      if (ec.id === "t15-ec11" && error && op === "enqueue" && queueLen >= 100) {
        covered.push(ec.id);
      }
    }

    if (taskId === 16) {
      // binarySearch
      if (!Array.isArray(inputs[0])) {
        if (ec.id === "t16-ec6" && error) covered.push(ec.id);
      } else {
        const arr = inputs[0] as number[];
        const target = inputs[1];
        const isSorted = arr.every((v, i) => i === 0 || arr[i - 1] <= v);
        if (ec.id === "t16-ec1" && !error && typeof result === "number" && result >= 0) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec2" && !error && result === -1 && isSorted) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec3" && !error && arr.length === 0 && result === -1) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec4" && !error && arr.length === 1 && result === 0) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec5" && !error && arr.length === 1 && result === -1) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec6" && error && !isSorted) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec7" && !error && result === -1 && isSorted && typeof target === "number" && target < arr[0]) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec8" && !error && result === -1 && isSorted && typeof target === "number" && target > arr[arr.length - 1]) {
          covered.push(ec.id);
        }
        if (ec.id === "t16-ec9" && !error && isSorted && new Set(arr).size < arr.length) {
          covered.push(ec.id);
        }
      }
    }

    if (taskId === 17) {
      // analyzeText
      const text = inputs[0];
      if (ec.id === "t17-ec1" && !error && typeof text === "string" && text.includes(".") && text.trim().split(/\s+/).length > 2) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec2" && !error && text === "") {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec3" && !error && typeof text === "string" && text.trim().length === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec4" && !error && typeof text === "string" && !/[.!?]/.test(text) && text.trim().split(/\s+/).length === 1) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec5" && !error && typeof text === "string" && text.trim().split(/\s+/).length > 0 && /[.!?]/.test(text)) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec6" && !error && typeof text === "string" && /[.!?]/.test(text) && (text.match(/[.!?]/g) || []).length >= 2) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec7" && !error && typeof text === "string" && !/[.!?]/.test(text) && text.trim().split(/\s+/).length > 1) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec8" && !error && typeof text === "string" && /\s{2,}/.test(text)) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec9" && error && typeof text === "string" && text.length > 10000) {
        covered.push(ec.id);
      }
      if (ec.id === "t17-ec10" && error && typeof text !== "string") {
        covered.push(ec.id);
      }
    }
  }

  return [...new Set(covered)];
}

function compareOutputs(expected: string, actual: unknown): boolean {
  const normalizedExpected = expected.trim().toLowerCase();
  const normalizedActual = normalizeValue(actual).trim().toLowerCase();

  if (normalizedExpected === normalizedActual) return true;

  // Handle "true"/"false" comparisons — including Russian variants
  const trueValues = ["true", "да", "верно"];
  const falseValues = ["false", "нет", "неверно"];

  if (trueValues.includes(normalizedExpected) && (actual === true || normalizedActual === "true")) {
    return true;
  }
  if (falseValues.includes(normalizedExpected) && (actual === false || normalizedActual === "false")) {
    return true;
  }

  // Handle JSON comparison for validatePassword — if expected starts with { parse as JSON
  const trimmedExpected = expected.trim();
  if (trimmedExpected.startsWith("{")) {
    try {
      const expectedObj = JSON.parse(trimmedExpected);
      if (typeof actual === "object" && actual !== null) {
        return JSON.stringify(expectedObj) === JSON.stringify(actual);
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Handle "Error:" prefix matching better
  if (normalizedExpected.includes("ошибк") || normalizedExpected.includes("исключен") || normalizedExpected.startsWith("error:")) {
    // Strip error prefixes from both expected and actual for comparison
    const strippedExpected = normalizedExpected
      .replace(/^error:\s*/i, "")
      .replace(/^ошибка:\s*/, "");
    const strippedActual = normalizedActual
      .replace(/^error:\s*/i, "")
      .replace(/^ошибка:\s*/, "");
    if (strippedActual.includes(strippedExpected) || strippedExpected.includes(strippedActual)) {
      return true;
    }
    return normalizedActual.includes(normalizedExpected) || normalizedExpected.includes(normalizedActual);
  }

  // Handle { valid: true, errors: [] } — compare by parsing expected as JSON
  if (trimmedExpected.includes("valid") && trimmedExpected.includes("errors")) {
    try {
      const expectedObj = JSON.parse(trimmedExpected);
      if (typeof actual === "object" && actual !== null) {
        // Deep compare valid and errors fields
        const act = actual as { valid?: boolean; errors?: unknown[] };
        if (expectedObj.valid !== undefined && expectedObj.errors !== undefined) {
          if (expectedObj.valid === act.valid && JSON.stringify(expectedObj.errors) === JSON.stringify(act.errors)) {
            return true;
          }
        }
      }
    } catch {
      // Not valid JSON
    }
  }

  return false;
}

export function evaluateTestCases(
  task: Task,
  testCases: TestCase[]
): EvaluationResult {
  const results: TestCaseResult[] = [];
  const allCoveredEcs = new Set<string>();
  const allCoveredBvs = new Set<string>();

  for (const tc of testCases) {
    const parsedInputs = tc.inputs.map(parseInputValue);
    const { result, error } = runReferenceFunction(task.id, parsedInputs);

    let actualOutput: string;
    if (error) {
      actualOutput = `Ошибка: ${error}`;
    } else {
      actualOutput = normalizeValue(result);
    }

    // Compare expected with actual
    const isCorrect = compareOutputs(tc.expectedOutput, error ? `Ошибка: ${error}` : result);

    // Find covered ECs
    const coveredClasses = findCoveredEquivalenceClasses(
      task.id,
      parsedInputs,
      task
    );
    coveredClasses.forEach((id) => allCoveredEcs.add(id));

    // Find covered boundary values
    const coveredBoundaries: string[] = [];
    for (const bv of task.boundaryValues) {
      if (matchBoundaryValue(parsedInputs, bv.value)) {
        const desc = bv.description;
        coveredBoundaries.push(desc);
        allCoveredBvs.add(desc);
      }
    }

    results.push({
      testCase: tc,
      actualOutput,
      isCorrect,
      coveredClasses,
      coveredBoundaries,
    });
  }

  // Calculate scores
  const totalEcs = task.equivalenceClasses.length;
  const coveredEcsCount = allCoveredEcs.size;
  const ecCoverage = totalEcs > 0 ? (coveredEcsCount / totalEcs) * 100 : 0;

  const totalBvs = task.boundaryValues.length;
  const coveredBvsCount = allCoveredBvs.size;
  const boundaryCoverage = totalBvs > 0 ? (coveredBvsCount / totalBvs) * 100 : 0;

  const totalTests = results.length;
  const correctTests = results.filter((r) => r.isCorrect).length;
  const correctnessScore =
    totalTests > 0 ? (correctTests / totalTests) * 100 : 0;

  // Weighted average: EC 40%, Boundary 30%, Correctness 30%
  const overallScore =
    ecCoverage * 0.4 + boundaryCoverage * 0.3 + correctnessScore * 0.3;

  // Determine uncovered items
  const coveredEcIds = Array.from(allCoveredEcs);
  const uncoveredEcIds = task.equivalenceClasses
    .filter((ec) => !allCoveredEcs.has(ec.id))
    .map((ec) => ec.id);

  const coveredBvDescriptions = Array.from(allCoveredBvs);
  const uncoveredBvDescriptions = task.boundaryValues
    .filter((bv) => !allCoveredBvs.has(bv.description))
    .map((bv) => bv.description);

  return {
    task,
    results,
    ecCoverage: Math.round(ecCoverage),
    boundaryCoverage: Math.round(boundaryCoverage),
    correctnessScore: Math.round(correctnessScore),
    overallScore: Math.round(overallScore),
    coveredEcIds,
    uncoveredEcIds,
    coveredBvDescriptions,
    uncoveredBvDescriptions,
    totalEcs,
    totalBvs,
    coveredEcsCount,
    coveredBvsCount,
  };
}
