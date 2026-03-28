# TypeScript Best Practices and Rules

When working on TypeScript code in this project, adhere to the following best practices and guidelines to ensure type safety, readability, and maintainability.

## 1. Type Safety & Strictness

- **Always enable `strict` mode**: Ensure `"strict": true` in `tsconfig.json`. This enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and other crucial safety checks.
- **Avoid `any`**: Never use `any` unless interacting with a completely untyped third-party library where typing is impossible. If the type is not known a priori, use `unknown` and perform type narrowing (type guards) before acting on it.
- **Avoid `@ts-ignore`**: Do not use `@ts-ignore` to silence compiler warnings. Fix the underlying type issue or use `@ts-expect-error` with a descriptive comment if you are completely certain the compiler is wrong (rare).
- **Strict Null Checks**: Always handle `null` and `undefined` explicitly. Prefer using optional chaining (`?.`) and nullish coalescing (`??`).

## 2. Interfaces vs. Type Aliases

- **Use `interface` for object shapes**: Prefer `interface` when defining the shape of an object, class, or defining public APIs, as they can be merged and produce slightly better error messages.
- **Use `type` for aliases and complex types**: Use `type` for unions (`type Status = "open" | "closed"`), intersections (`type AandB = A & B`), tuples, and mapped types.

## 3. Naming Conventions

- **Types, Interfaces, Classes, and Enums**: Use `PascalCase` (e.g., `UserData`, `PaymentService`, `UserRole`). Always name interfaces starting with a capital letter (do not use the `I` prefix like `IUserData`).
- **Variables, Functions, Methods, and Properties**: Use `camelCase` (e.g., `getUser`, `firstName`, `calculateTotal()`).
- **Constants**: Use `UPPER_SNAKE_CASE` for global constants (e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`).
- **Generics**: Use specific names for generics when possible (e.g., `TRequest`, `TResponse`), or fall back to standard single letters like `T`, `U`, `K`, `V` for simple cases.

## 4. Syntax and Language Features

- **Prefer String Unions over Enums**: Default to string unions (`type Role = 'admin' | 'user'`) over TypeScript `enum`s. String unions are simpler, have no runtime overhead, and bundle cleaner. Use enums only when you strictly need reverse mapping or specific numbered values.
- **Use `readonly` generously**: Use `readonly` modifiers for object properties, arrays (`ReadonlyArray<T>` or `readonly T[]`), and variables that should not be mutated.
- **Let and Const**: Always use `const` by default. Only use `let` if the variable's reference needs to be reassigned. Never use `var`.
- **Async/Await**: Prefer `async/await` syntax over `.then()`/`.catch()` chains for asynchronous operations. It makes code easier to read and debug.

## 5. Functions

- **Explicit Return Types (Optional but recommended)**: While TypeScript is good at inferring return types, explicitly typing the return of complex functions or public API functions can prevent accidental type changes and make the code easier to read.
- **Arrow Functions**: Use arrow functions for anonymous functions and callbacks.
- **Parameter Defaults**: Use default parameter values instead of checking for `undefined` inside the function body.

## 6. Modules and Imports

- **Use ES Modules**: Standardize on `import` and `export` statements. Avoid CommonJS `require` and `module.exports` in TypeScript code targeting modern environments.
- **Absolute Imports**: Configure and prioritize absolute imports (e.g., `import { User } from '@/models/user'`) over deep relative imports (`import { User } from '../../../models/user'`) to make refactoring easier.
- **Avoid Default Exports**: Prefer named exports over default exports. Named exports provide better refactoring support across the IDE and prevent naming inconsistencies.

## 7. Error Handling

- **Type your Errors**: When catching errors in a `try/catch` block, remember that the `error` object is of type `unknown` by default. Narrow it down before interacting with it (e.g., `if (error instanceof Error) { ... }`).
- **Custom Error Classes**: Extend the built-in `Error` class for custom domain-specific errors.

## 8. Exporting Types Automatically

- When passing state/props from parent down to child components or exporting utility shapes, keep your types collocated with the function/component they strictly belong to, and export them implicitly.
