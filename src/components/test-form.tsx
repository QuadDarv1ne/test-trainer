"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus } from "lucide-react";
import type { Task, TestCaseCategory } from "@/lib/tasks";
import { useLocale } from "@/lib/i18n.client";

const categoryKeys: TestCaseCategory[] = [
  "Нормальное значение",
  "Граничное значение",
  "Исключение",
  "Недопустимый тип",
];

const categoryI18nKeys: Record<TestCaseCategory, string> = {
  "Нормальное значение": "cat_normal",
  "Граничное значение": "cat_boundary",
  "Исключение": "cat_exception",
  "Недопустимый тип": "cat_invalid_type",
};

const categoryColorKeys: Record<TestCaseCategory, string> = {
  "Нормальное значение": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Граничное значение": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Исключение": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  "Недопустимый тип": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export { categoryColorKeys as categoryColors, categoryI18nKeys };

interface TestFormProps {
  task: Task;
  onAdd: (inputs: string[], expected: string, category: TestCaseCategory, comment: string) => void;
}

export function TestForm({ task, onAdd }: TestFormProps) {
  const { t } = useLocale();

  const formSchema = useMemo(() => z.object({
    inputs: z.array(z.string().min(1, "Поле обязательно")).length(task.params.length),
    expected: z.string().min(1, "Ожидаемый результат обязателен"),
    category: z.enum(["Нормальное значение", "Граничное значение", "Исключение", "Недопустимый тип"] as const),
    comment: z.string().optional(),
  }), [task.params.length]);

  const defaultInputs = useMemo(() => task.params.map(() => ""), [task.params.length]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: defaultInputs,
      expected: "",
      category: "Нормальное значение",
      comment: "",
    },
  });

  // Reset form when task changes
  useEffect(() => {
    form.reset({
      inputs: task.params.map(() => ""),
      expected: "",
      category: "Нормальное значение",
      comment: "",
    });
  }, [task.id, form]);

  const getPlaceholder = (paramType: string) => {
    if (paramType === "string") return t("form_placeholder_string");
    if (paramType === "boolean") return t("form_placeholder_boolean");
    return t("form_placeholder_number");
  };

  const getReturnPlaceholder = (returnType: string) => {
    if (returnType === "boolean") return t("form_placeholder_boolean");
    if (returnType === "string") return t("form_placeholder_return_string");
    if (returnType.startsWith("{")) return t("form_placeholder_return_object");
    return t("form_placeholder_return_number");
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAdd(values.inputs, values.expected, values.category, values.comment ?? "");
    form.reset({
      inputs: task.params.map(() => ""),
      expected: "",
      category: "Нормальное значение",
      comment: "",
    });
    // Focus first input
    requestAnimationFrame(() => {
      const firstInput = document.querySelector('input[type="text"], input:not([type])') as HTMLInputElement;
      firstInput?.focus();
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4 text-emerald-600" />
          {t("form_add_title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {task.params.map((param, idx) => (
              <FormField
                key={param.name}
                control={form.control}
                name={`inputs.${idx}`}
                render={({ field }) => {
                  const inputValue = field.value;
                  const typeWarning =
                    param.type === "number" &&
                    inputValue !== "" &&
                    isNaN(Number(inputValue.trim())) &&
                    inputValue.trim() !== "";
                  return (
                    <FormItem>
                      <FormLabel>
                        {param.name}
                        <span className="text-muted-foreground ml-1">
                          ({param.type})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={getPlaceholder(param.type)}
                          {...field}
                          className="h-9 text-sm"
                        />
                      </FormControl>
                      {typeWarning && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          {t("form_type_warning").replace("{value}", inputValue)}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ))}

            <FormField
              control={form.control}
              name="expected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form_expected")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={getReturnPlaceholder(task.returnType)}
                      {...field}
                      className="h-9 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form_category")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryKeys.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                cat === "Нормальное значение"
                                  ? "bg-emerald-500"
                                  : cat === "Граничное значение"
                                    ? "bg-amber-500"
                                    : cat === "Исключение"
                                      ? "bg-rose-500"
                                      : "bg-purple-500"
                              }`}
                            />
                            {t(categoryI18nKeys[cat])}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form_comment")}{" "}
                    <span className="text-muted-foreground">{t("form_comment_optional")}</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form_comment_placeholder")}
                      {...field}
                      className="text-sm min-h-[60px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("form_add_button")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
