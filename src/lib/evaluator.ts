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

  // Try parsing as number — improved to handle decimals and negatives better
  const num = Number(trimmed);
  if (trimmed !== "" && !isNaN(num)) {
    // Check that it looks like a number (allow negatives, decimals)
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return num;
    }
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
      if (ec.id === "ec1" && inputs[0] === 0) covered.push(ec.id);
      if (
        ec.id === "ec2" &&
        Number.isInteger(inputs[0]) &&
        Number(inputs[0]) >= 1 &&
        Number(inputs[0]) <= 20
      )
        covered.push(ec.id);
    }

    if (taskId === 2) {
      // isPrime
      if (ec.id === "ec1" && Number(inputs[0]) <= 1) covered.push(ec.id);
      if (ec.id === "ec2" && Number(inputs[0]) === 2) covered.push(ec.id);
      if (
        ec.id === "ec3" &&
        result === true &&
        Number(inputs[0]) > 2
      )
        covered.push(ec.id);
      if (
        ec.id === "ec4" &&
        result === false &&
        Number(inputs[0]) > 1
      )
        covered.push(ec.id);
    }

    if (taskId === 3) {
      // applyDiscount — improved heuristic based on result + input ranges
      const price = Number(inputs[0]);
      const discount = Number(inputs[1]);

      if (ec.id === "ec1" && !error && discount === 0 && price > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "ec2" && !error && discount > 0 && discount < 100 && price > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "ec3" && !error && discount === 100 && price > 0) {
        covered.push(ec.id);
      }
      if (ec.id === "ec4" && !error && price === 0) {
        covered.push(ec.id);
      }
      if (ec.id === "ec5" && error && typeof price === "number" && !isNaN(price) && price < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "ec6" && error && typeof discount === "number" && !isNaN(discount) && discount < 0) {
        covered.push(ec.id);
      }
      if (ec.id === "ec7" && error && typeof discount === "number" && !isNaN(discount) && discount > 100) {
        covered.push(ec.id);
      }
      if (ec.id === "ec8" && error && (typeof inputs[0] !== "number" || typeof inputs[1] !== "number")) {
        covered.push(ec.id);
      }
    }

    if (taskId === 4) {
      // isLeapYear
      if (
        ec.id === "ec1" &&
        Number(inputs[0]) % 400 === 0
      )
        covered.push(ec.id);
      if (
        ec.id === "ec2" &&
        Number(inputs[0]) % 100 === 0 &&
        Number(inputs[0]) % 400 !== 0
      )
        covered.push(ec.id);
      if (
        ec.id === "ec3" &&
        Number(inputs[0]) % 4 === 0 &&
        Number(inputs[0]) % 100 !== 0
      )
        covered.push(ec.id);
      if (
        ec.id === "ec4" &&
        Number(inputs[0]) % 4 !== 0
      )
        covered.push(ec.id);
    }

    if (taskId === 5) {
      // triangle
      if (
        ec.id === "ec1" &&
        result === "равносторонний"
      )
        covered.push(ec.id);
      if (
        ec.id === "ec2" &&
        result === "равнобедренный"
      )
        covered.push(ec.id);
      if (
        ec.id === "ec3" &&
        result === "разносторонний"
      )
        covered.push(ec.id);
      if (
        ec.id === "ec4" &&
        result === "не треугольник"
      )
        covered.push(ec.id);
      if (
        ec.id === "ec6" &&
        result === "не треугольник" &&
        !error
      ) {
        const [a, b, c] = inputs as number[];
        if (a + b === c || a + c === b || b + c === a)
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

        if (ec.id === "ec1" && res.valid) {
          covered.push(ec.id);
        }
        if (ec.id === "ec2" && errors.includes("Минимум 8 символов") && errors.length === 1) {
          covered.push(ec.id);
        }
        if (ec.id === "ec3" && errors.some(e => e.includes("заглавную")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "ec4" && errors.some(e => e.includes("строчную")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "ec5" && errors.some(e => e.includes("цифр")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "ec6" && errors.some(e => e.includes("спецсимвол")) && !errors.includes("Минимум 8 символов") && errors.length <= 2) {
          covered.push(ec.id);
        }
        if (ec.id === "ec7" && errors.length >= 2 && inputStr !== "" && errors.length < 4) {
          covered.push(ec.id);
        }
        if (ec.id === "ec8" && inputStr === "" && errors.length >= 4) {
          covered.push(ec.id);
        }
        if (ec.id === "ec9" && error) {
          covered.push(ec.id);
        }
      } else if (ec.id === "ec9" && error) {
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
    // Strip "Error:" prefix if present and compare message content
    let strippedExpected = normalizedExpected;
    if (strippedExpected.startsWith("error:")) {
      strippedExpected = strippedExpected.slice(6).trim();
    }
    let strippedActual = normalizedActual;
    if (strippedActual.startsWith("ошибка:")) {
      strippedActual = strippedActual.slice(7).trim();
    }
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
