import { AbstractControl } from '@angular/forms';
export function ValidatePostalCode(
  control: AbstractControl
): { invalidPostalCode: boolean } | null {
  const POSTALCODE_REGEXP = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return !POSTALCODE_REGEXP.test(control.value)
    ? { invalidPostalCode: true }
    : null;
} // ValidatePostalCode
