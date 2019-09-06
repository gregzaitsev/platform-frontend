export function isPromise<T = any>(value: any): value is Promise<T> {
  return !!(value && value.then && value.catch);
}
