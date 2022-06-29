let keyCounter = 1

export function generateRandomKey(): string {
  keyCounter += 1
  return Math.floor(Math.random() * new Date().getTime() * keyCounter).toString(32);
}