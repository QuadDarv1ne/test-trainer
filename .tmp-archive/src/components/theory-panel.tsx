"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Task } from "@/lib/tasks";
import {
  BookOpen,
  Layers,
  GitBranch,
  ArrowRightLeft,
  Lightbulb,
  ShieldCheck,
  LayoutGrid,
  ArrowLeftRight,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export function TheoryPanel({ task }: { task?: Task }) {
  return (
    <motion.div {...fadeIn} className="space-y-4">
      {/* Contextual banner when task is provided */}
      {task && (
        <Card className="border-blue-200 dark:border-blue-800 mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-xs mb-1">
                  Текущее задание: {task.name}
                </p>
                <p className="text-xs">
                  Для этого задания рекомендуем обратить внимание на:
                  {" "}<strong>{task.topics.join(", ")}</strong>
                </p>
                <p className="text-xs mt-1">
                  Всего определено {task.equivalenceClasses.length} классов эквивалентности
                  и {task.boundaryValues.length} граничных значений.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Introduction */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Методы тестирования</h2>
              <p className="text-xs text-muted-foreground">
                Основы чёрного ящика для генерации тест-кейсов
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Тестирование по методу «чёрного ящика» (black-box testing) — это подход,
            при котором тестирование выполняется без знания внутреннего устройства кода.
            Тестировщик анализирует только входы и ожидаемые выходы функции.
          </p>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-3">
        {/* Equivalence Classes */}
        <AccordionItem
          value="ec"
          className="border rounded-lg px-4 data-[state=open]:border-emerald-300 data-[state=open]:bg-emerald-50/50 dark:data-[state=open]:border-emerald-800 dark:data-[state=open]:bg-emerald-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                <Layers className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Классы эквивалентности</h3>
                <p className="text-xs text-muted-foreground">
                  Разделение входных данных на группы
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Классы эквивалентности</strong> — это метод тестирования, при котором
                входные данные разбиваются на группы (классы), внутри которых поведение
                функции одинаковое. Достаточно протестировать одно значение из каждого класса.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  Типы классов
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">●</span>
                    <span>
                      <strong>Валидные классы</strong> — допустимые входные данные, для которых
                      функция должна работать корректно
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">●</span>
                    <span>
                      <strong>Невалидные классы</strong> — недопустимые данные, которые должны
                      вызывать ошибку или исключение
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                <p className="font-medium text-emerald-800 dark:text-emerald-300 text-xs mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Пример
                </p>
                <p className="text-xs">
                  Для функции <code className="font-mono bg-muted px-1 rounded">factorial(n)</code> с условием 0 ≤ n ≤ 20:
                </p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>• n = 0 → отдельный класс (граничный)</li>
                  <li>• 1 ≤ n ≤ 20 → нормальные значения</li>
                  <li>• n &lt; 0 → ошибка</li>
                  <li>• n &gt; 20 → переполнение</li>
                  <li>• n — не целое число → ошибка типа</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Boundary Values */}
        <AccordionItem
          value="bv"
          className="border rounded-lg px-4 data-[state=open]:border-amber-300 data-[state=open]:bg-amber-50/50 dark:data-[state=open]:border-amber-800 dark:data-[state=open]:bg-amber-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Граничные значения</h3>
                <p className="text-xs text-muted-foreground">
                  Тестирование на границах диапазонов
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Анализ граничных значений</strong> — это метод, основанный на том, что
                ошибки чаще всего возникают на границах диапазонов допустимых значений.
                Для каждого диапазона тестируются значения на границах и рядом с ними.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  Правила выбора граничных значений
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>Минимальное и максимальное допустимое значение</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>Значение «чуть ниже» минимума и «чуть выше» максимума</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>Особые точки: ноль, пустая строка, null</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>Точки перехода между логическими условиями</span>
                  </li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <p className="font-medium text-amber-800 dark:text-amber-300 text-xs mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Пример
                </p>
                <p className="text-xs">
                  Для диапазона 1 ≤ n ≤ 10:
                </p>
                <div className="flex gap-2 mt-1 text-xs flex-wrap">
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-rose-200 dark:border-rose-800 text-rose-700">0 (недо)</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">1 (min)</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">2 (min+1)</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">9 (max-1)</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">10 (max)</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-rose-200 dark:border-rose-800 text-rose-700">11 (сверх)</code>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Test Case Categories */}
        <AccordionItem
          value="categories"
          className="border rounded-lg px-4 data-[state=open]:border-purple-300 data-[state=open]:bg-purple-50/50 dark:data-[state=open]:border-purple-800 dark:data-[state=open]:bg-purple-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Категории тест-кейсов</h3>
                <p className="text-xs text-muted-foreground">
                  Как классифицировать тесты
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300 text-xs mb-1">
                    🟢 Нормальное значение
                  </p>
                  <p className="text-xs">
                    Обычные входные данные, находящиеся в допустимом диапазоне.
                    Функция должна корректно обработать и вернуть ожидаемый результат.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <p className="font-medium text-amber-800 dark:text-amber-300 text-xs mb-1">
                    🟡 Граничное значение
                  </p>
                  <p className="text-xs">
                    Значения на границах диапазонов: минимум, максимум, переходные точки.
                    Здесь наиболее вероятны ошибки.
                  </p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3">
                  <p className="font-medium text-rose-800 dark:text-rose-300 text-xs mb-1">
                    🔴 Исключение
                  </p>
                  <p className="text-xs">
                    Входные данные, которые вызывают ошибку или исключение.
                    Проверяется корректная обработка неверных данных.
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <p className="font-medium text-purple-800 dark:text-purple-300 text-xs mb-1">
                    🟣 Недопустимый тип
                  </p>
                  <p className="text-xs">
                    Данные неверного типа: строка вместо числа, null вместо объекта и т.д.
                    Проверяется валидация входных данных.
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tips */}
        <AccordionItem
          value="tips"
          className="border rounded-lg px-4 data-[state=open]:border-teal-300 data-[state=open]:bg-teal-50/50 dark:data-[state=open]:border-teal-800 dark:data-[state=open]:bg-teal-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Советы</h3>
                <p className="text-xs text-muted-foreground">
                  Лучшие практики тестирования
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">1.</span>
                  <span>
                    <strong>Покройте все классы эквивалентности</strong> — для каждого класса
                    создайте хотя бы один тест-кейс
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">2.</span>
                  <span>
                    <strong>Не забывайте о граничных значениях</strong> — тестируйте границы и
                    значения рядом с ними
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">3.</span>
                  <span>
                    <strong>Тестируйте невалидные данные</strong> — проверьте, как функция
                    обрабатывает ошибки
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">4.</span>
                  <span>
                    <strong>Проверяйте типы</strong> — передайте данные неверного типа и
                    убедитесь, что функция корректно обработает это
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">5.</span>
                  <span>
                    <strong>Используйте осмысленные комментарии</strong> — записывайте, почему
                    выбран конкретный тест-кейс
                  </span>
                </li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Decision Tables */}
        <AccordionItem
          value="decision-tables"
          className="border rounded-lg px-4 data-[state=open]:border-orange-300 data-[state=open]:bg-orange-50/50 dark:data-[state=open]:border-orange-800 dark:data-[state=open]:bg-orange-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Таблицы решений</h3>
                <p className="text-xs text-muted-foreground">
                  Систематический подход к логическим условиям
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Таблица решений</strong> — это метод, который систематизирует все комбинации
                логических условий и определяет ожидаемый результат для каждой комбинации. Это особенно
                полезно когда функция содержит сложные условные конструкции с несколькими ветвями.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  Шаги создания таблицы решений
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 shrink-0">1.</span>
                    <span>Определите все условия (логические выражения) и их возможные значения (истина/ложь)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 shrink-0">2.</span>
                    <span>Составьте все возможные комбинации значений условий</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 shrink-0">3.</span>
                    <span>Для каждой комбинации определите ожидаемое действие или результат</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 shrink-0">4.</span>
                    <span>Создайте тест-кейс для каждой уникальной комбинации (минимум одно правило из каждого класса эквивалентности комбинаций)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="font-medium text-orange-800 dark:text-orange-300 text-xs mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Пример: Високосный год
                </p>
                <p className="text-xs">
                  Для isLeapYear(year) условия: year%4==0, year%100==0, year%400==0.
                  Комбинации: (T,T,T)→високосный, (T,T,F)→не високосный, (T,F,*)→високосный, (F,*,*)→не високосный.
                  Вместо 8 комбинаций достаточно 4 теста.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Pairwise Testing */}
        <AccordionItem
          value="pairwise"
          className="border rounded-lg px-4 data-[state=open]:border-indigo-300 data-[state=open]:bg-indigo-50/50 dark:data-[state=open]:border-indigo-800 dark:data-[state=open]:bg-indigo-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Попарное тестирование</h3>
                <p className="text-xs text-muted-foreground">
                  Сокращение комбинаций с гарантированным покрытием пар
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Попарное тестирование (Pairwise Testing)</strong> — это техника создания тест-кейсов,
                при которой каждая пара параметров тестируется во всех возможных комбинациях значений.
                Это позволяет существенно сократить количество тестов по сравнению с полным перебором.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  Когда использовать
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5 shrink-0">●</span>
                    <span>Функция принимает 3 и более параметров</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5 shrink-0">●</span>
                    <span>Каждый параметр имеет несколько классов эквивалентности</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5 shrink-0">●</span>
                    <span>Полный перебор всех комбинаций слишком дорог (экспоненциальный рост)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                <p className="font-medium text-indigo-800 dark:text-indigo-300 text-xs mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Пример
                </p>
                <p className="text-xs">
                  Функция с 3 параметрами, каждый с 3 значениями: 3×3×3 = 27 комбинаций.
                  Попарное покрытие гарантирует, что каждая пара значений появится хотя бы раз —
                  это требует всего 9 тестов вместо 27.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  Популярные инструменты
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>PICT</strong> (Microsoft) — генератор попарных тестов</li>
                  <li>• <strong>AllPairs</strong> — онлайн-генератор</li>
                  <li>• <strong>Pairwise Wizard</strong> — визуальный инструмент</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}
