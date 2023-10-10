import { AbstractControl } from '@angular/forms';
export function ValidateEmail(
  control: AbstractControl
): { invalidEmail: boolean } | null {
  const EMAIL_REGEXP = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
  return !EMAIL_REGEXP.test(control.value) ? { invalidEmail: true } : null;
} // ValidateEmail
