/**
 * Generates a unique booking reference
 * Format: 3 letters + 5 alphanumeric (e.g., CUE8X9Z2P)
 */
export function generateBookingReference(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // First 3 letters
  let reference = '';
  for (let i = 0; i < 3; i++) {
    reference += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Next 5 alphanumeric characters
  for (let i = 0; i < 5; i++) {
    reference += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }

  return reference;
}

