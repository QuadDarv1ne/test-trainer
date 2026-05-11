"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useKeyboardShortcuts() {
  const activeTab = useAppStore((s) => s.activeTab);
  const selectedTask = useAppStore((s) => s.selectedTask);
  const testCases = useAppStore((s) => s.testCases);
  const removeTestCase = useAppStore((s) => s.removeTestCase);
  const clearTestCases = useAppStore((s) => s.clearTestCases);
  const setEvaluationResult = useAppStore((s) => s.setEvaluationResult);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "trainer" && selectedTask && testCases.length > 0) {
          window.dispatchEvent(new CustomEvent("test-submit"));
        }
      }
      // Ctrl+Z to remove last test case
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (activeTab === "trainer" && testCases.length > 0) {
          e.preventDefault();
          const lastCase = testCases[testCases.length - 1];
          removeTestCase(lastCase.id);
        }
      }
      // Escape to reset
      if (e.key === "Escape") {
        if (activeTab === "trainer" && testCases.length > 0) {
          e.preventDefault();
          clearTestCases();
          setEvaluationResult(null);
          setActiveTab("trainer");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, selectedTask, testCases, removeTestCase, clearTestCases, setEvaluationResult, setActiveTab]);
}
