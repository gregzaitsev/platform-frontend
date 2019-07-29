export function tid(id: string, rest?: string): string {
  return `[data-test-id="${id}"]` + (rest ? ` ${rest}` : "");
}

export function formFieldErrorMessage(key: string): string {
  return tid(`form.${key}.error-message`);
}

export function formField(name: string): string {
  return `[name="${name}"], ${tid(name)}, ${tid(`form.name.${name}`)}`;
}

export function formFieldValue(name: string, value: string): string {
  return `[value="${value}"], ${tid(value)}, ${tid(`form.name.${name}.${value}`)}`;
}
