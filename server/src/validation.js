export function normalizeRegistrationInput(studentName, email) {
  const normalizedName = String(studentName ?? "").trim();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    return { ok: false, message: "Enter a name between 2 and 100 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, message: "Enter a valid name and email address." };
  }
  return { ok: true, studentName: normalizedName, email: normalizedEmail };
}

export function isAtCapacity(capacity, registeredCount) {
  return Number(registeredCount) >= Number(capacity);
}
