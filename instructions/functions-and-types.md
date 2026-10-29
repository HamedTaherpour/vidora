# Functions and Types

Read this file when creating or reviewing TypeScript functions, exported APIs, React component props, or shared types.

The goal is consistent, readable types without type-file boilerplate.

---

# 1. TypeScript Strictness

Use strict TypeScript.

Do not use:

```ts
any;
```

as a shortcut.

At untyped boundaries prefer:

```ts
unknown;
```

and narrow explicitly.

Do not use:

```ts
@ts-ignore
```

or broad type/lint suppression to avoid fixing a real issue.

---

# 2. Let TypeScript Infer Obvious Types

Do not annotate values whose type is obvious and useful inference already exists.

Prefer:

```ts
const count = items.length;
```

over:

```ts
const count: number = items.length;
```

Add explicit types when they improve contracts, correctness, or readability.

---

# 3. Public Function Parameters

For exported functions with structured inputs, prefer a descriptive named parameter type.

Example:

```ts
type CreateOrderParams = {
  userId: string;
  footageId: string;
};

export async function createOrder({ userId, footageId }: CreateOrderParams) {
  // ...
}
```

Avoid generic names such as:

```text
Input
Data
Payload
Info
Options
```

when a domain-specific name is possible.

---

# 4. Small Private Functions

Do not create a named parameter type for every private helper.

This is fine:

```ts
function formatPrice(amount: number) {
  // ...
}
```

For several ambiguous arguments, prefer an object:

```ts
function createRange({
  min,
  max,
  step,
}: {
  min: number;
  max: number;
  step: number;
}) {
  // ...
}
```

Extract the type when it becomes reused, exported, or complex.

---

# 5. Type Placement

Keep types local by default.

Extract to a companion file when the type is:

- reused across multiple files;
- exported as part of a module contract;
- complex enough to distract from implementation;
- shared by multiple implementations.

Do not create `*.types.ts` automatically for every component or function.

---

# 6. Domain Types Stay With the Domain

Place Footage types near Footage code.

Place Order types near Order code.

Do not create a global dumping ground such as:

```text
src/types/
```

for unrelated domain types.

True cross-domain primitives may be shared when justified.

---

# 7. React Props

For application-owned reusable components, follow `instructions/components.md`:

- use a named `*Props` type;
- place public component props in a companion `*.types.ts` file;
- accept props through a named `props` parameter and destructure inside the body.

This convention is scoped to reusable UI components. It does not impose companion
type files or a props-parameter style on unrelated backend functions or small private
helpers.

Example:

```tsx
type FootageCardProps = {
  title: string;
  price: number;
  previewUrl: string;
};

export function FootageCard(props: FootageCardProps) {
  const { title, price, previewUrl } = props;
  // ...
}
```

Small private local components may use concise inline props when that improves
readability. Generated shadcn primitives are intentional exceptions.

Do not force every private helper type into a separate file or mass-refactor existing
components solely to apply this convention.

---

# 8. React `FC`

Do not require `React.FC`.

Prefer ordinary function components:

```tsx
export function FootageCard(props: FootageCardProps) {
  // ...
}
```

Using `React.FC` is not forbidden when a specific integration genuinely benefits from it, but it is not the project default.

---

# 9. Function Declarations vs Arrow Functions

Do not enforce one notation universally.

Prefer function declarations for ordinary named module functions when natural:

```ts
export async function createOrder() {}
```

Use arrow functions when:

- required by an API;
- used as callbacks;
- local functional expressions;
- lexical `this` behavior matters.

Consistency within a local module matters more than mechanical conversion.

---

# 10. Return Types

Allow inference for clear local functions.

Use explicit return types when:

- defining an important public module contract;
- preventing accidental contract widening;
- complex async behavior benefits from clarity;
- framework/provider integration expects a defined shape.

Do not annotate every function automatically.

---

# 11. Discriminated Unions

Prefer discriminated unions for finite application states when they improve correctness.

Example:

```ts
type PaymentVerificationResult =
  | { status: "verified"; referenceId: string }
  | { status: "failed"; reason: string };
```

Prefer this over loosely related nullable fields.

---

# 12. Avoid Boolean Parameter Ambiguity

Avoid:

```ts
createInvoice(order, true, false);
```

Prefer descriptive object parameters or clearer functions.

Boolean flags are acceptable when meaning remains obvious.

---

# 13. Avoid Boolean State Explosion

When multiple booleans represent mutually exclusive states, consider a union.

Avoid:

```ts
isLoading;
isSuccess;
isFailed;
```

when an explicit state better expresses the invariant.

Do not introduce elaborate state machines for simple UI.

---

# 14. External Types

Do not expose provider-specific SDK types through application/domain boundaries unless that coupling is intentionally part of the boundary.

Normalize provider responses to application-owned types.

Examples include:

- payment provider;
- SMS provider;
- object storage SDK.

---

# 15. Prisma Types

Prisma types may be useful inside database-facing implementation.

Avoid making raw Prisma model/payload types the public contract of unrelated UI/business modules when doing so creates unnecessary persistence coupling.

Do not create mapping layers solely for theoretical purity.

Introduce domain-owned types when the separation provides real value.

---

# 16. Schema-Derived Types

When Zod or another approved validation schema defines the runtime boundary, derive TypeScript types from the schema where practical instead of manually duplicating the shape.

Keep one source of truth for the validated structure.

---

# 17. Enums

Do not create enums for open-ended data.

Examples such as media variant labels should remain data-driven where the product allows future values.

For small closed application states, prefer the simplest clear representation supported by the stack.

---

# 18. Constants

Keep constants near their owner.

Extract constants when they are:

- reused;
- meaningful business/configuration values;
- easier to maintain centrally.

Do not create a `constants.ts` file merely to move one obvious string out of implementation.

Security/business values such as OTP expiry or signed URL duration must come from approved configuration/policy rather than arbitrary inline numbers.

---

# 19. Naming

Use domain-specific names.

Prefer:

```text
purchaseEntitlement
paymentReference
footageFile
normalizedPhone
```

over:

```text
data
item
object
value
resultData
thing
```

Names should expose intent.

---

# 20. Generic Types

Use generics when multiple types truly share one reusable relationship.

Do not introduce generics to make a single-use function look reusable.

A concrete implementation is often easier to understand and maintain.

---

# 21. Utility Types

Use built-in TypeScript utility types when they clarify intent.

Do not stack complex utility types until a type becomes harder to understand than the data itself.

Prefer readability over type-system cleverness.

---

# 22. Assertions

Avoid unnecessary type assertions:

```ts
value as SomeType;
```

An assertion does not validate runtime data.

At untrusted boundaries, validate instead.

Assertions may be appropriate when framework/library limitations make the type fact known but unexpressed.

---

# 23. Non-Null Assertions

Avoid:

```ts
value!;
```

when nullability represents a real runtime possibility.

Prefer explicit handling.

Use non-null assertions only when an invariant is genuinely guaranteed and clear from surrounding code.

---

# 24. Type Guards

Use type guards or schema validation at unknown external boundaries.

Do not spread unchecked provider/API data deeper into the application.

---

# 25. Export Surface

Export only what consumers need.

Do not export private helper types/functions preemptively for possible future reuse.

Keep module contracts small.

---

# 26. File Size

Do not split a file solely because it crossed an arbitrary line count.

Split when there are identifiable responsibilities that become easier to:

- understand;
- test;
- reuse;
- own independently.

Large files should trigger review, not automatic decomposition.

---

# 27. Core Type Principle

Prefer types that describe real application meaning.

Avoid both extremes:

```text
everything inline and implicit
```

and:

```text
one type alias and one file for every small value
```

Use the smallest amount of type structure that makes the contract clear and safe.
