# Implementation Steps

## S001 — Create package.json

**Intent:** Establish Node.js project metadata and scripts.

**Work:**
- Create `package.json` with:
  - `name`: "hello-world-test"
  - `version`: "0.1.0"
  - `type`: "module"
  - `scripts`: `build` (runs `tsc`) and `start` (runs `node dist/index.js`)
  - `devDependencies`: empty object (dependencies added in later step)

**Done when:** `package.json` exists and contains all required fields.

---

## S002 — Create tsconfig.json

**Intent:** Configure TypeScript compiler with strict settings.

**Work:**
- Create `tsconfig.json` with:
  - `compilerOptions.strict`: true
  - `compilerOptions.target`: "ES2022"
  - `compilerOptions.module`: "NodeNext"
  - `compilerOptions.moduleResolution`: "NodeNext"
  - `compilerOptions.outDir`: "dist"
  - `compilerOptions.rootDir`: "src"
  - `include`: ["src/**/*"]

**Done when:** `tsconfig.json` exists with all required compiler options.

---

## S003 — Create src/index.ts

**Intent:** Implement the minimal "Hello World" entry point.

**Work:**
- Create `src/` directory
- Create `src/index.ts` containing a single statement that outputs "Hello from the PHU stack!" to stdout
- Use `console.log()` for output (style allows console.log in this fixture)

**Done when:** `src/index.ts` exists and contains the hello message output.

---

## S004 — Install TypeScript tooling

**Intent:** Add TypeScript compiler and Node.js type definitions.

**Work:**
- Run `npm install --save-dev typescript @types/node`
- Verify `node_modules/` and `package-lock.json` are created
- Verify `devDependencies` in `package.json` now lists `typescript` and `@types/node`

**Done when:** Both packages are installed and listed in `package.json` devDependencies.

---

## S005 — Verify build succeeds

**Intent:** Confirm the TypeScript toolchain compiles the code successfully.

**Work:**
- Run `npm run build`
- Verify `dist/index.js` is created
- Verify no compilation errors or warnings

**Done when:** Build completes successfully and `dist/index.js` exists.

---

## S006 — Verify runtime execution

**Intent:** Confirm the compiled code runs and produces expected output.

**Work:**
- Run `npm start` (which runs `node dist/index.js` after build)
- Verify stdout contains "Hello from the PHU stack!"
- Verify exit code is 0 (success)

**Done when:** Running the compiled code produces the expected output without errors.
