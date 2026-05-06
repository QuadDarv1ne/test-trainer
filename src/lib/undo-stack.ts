/**
 * Generic undo/redo stack for managing snapshots of state.
 * Stores up to `maxSize` entries (default 50).
 */
export class UndoStack<T> {
  private stack: T[] = [];
  private index: number = -1;
  private readonly maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /** Push a new snapshot onto the stack. Trims future states and caps at maxSize. */
  push(snapshot: T): void {
    // Discard any redo-able states
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(snapshot);

    // Trim oldest entries if over maxSize
    if (this.stack.length > this.maxSize) {
      this.stack = this.stack.slice(this.stack.length - this.maxSize);
    }

    this.index = this.stack.length - 1;
  }

  /** Undo: go back one step. Returns the previous snapshot, or null if at the beginning. */
  undo(): T | null {
    if (this.index <= 0) return null;
    this.index--;
    return this.stack[this.index];
  }

  /** Redo: go forward one step. Returns the next snapshot, or null if at the end. */
  redo(): T | null {
    if (this.index >= this.stack.length - 1) return null;
    this.index++;
    return this.stack[this.index];
  }

  /** Whether undo is possible */
  get canUndo(): boolean {
    return this.index > 0;
  }

  /** Whether redo is possible */
  get canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }

  /** Current snapshot */
  get current(): T | null {
    return this.index >= 0 ? this.stack[this.index] : null;
  }

  /** Reset the stack entirely */
  clear(): void {
    this.stack = [];
    this.index = -1;
  }

  /** Number of stored entries */
  get size(): number {
    return this.stack.length;
  }
}
