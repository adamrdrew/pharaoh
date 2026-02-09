const VERSION = "0.1.0";

function greet(name: string): string {
  return `Hello, ${name}! Welcome to the PHU stack.`;
}

function farewell(name: string): string {
  return `Goodbye, ${name}! See you next time.`;
}

function timestamp(): string {
  return new Date().toISOString();
}

console.log(`v${VERSION}`);
console.log(timestamp());
console.log(greet("World"));
console.log(farewell("World"));
