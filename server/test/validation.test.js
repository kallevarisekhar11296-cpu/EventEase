import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRegistrationInput, isAtCapacity } from "../src/validation.js";

test("accepts and normalizes a valid registration", () => {
  assert.deepEqual(normalizeRegistrationInput("  Asha Rao  ", " ASHA@Example.com "), {
    ok: true, studentName: "Asha Rao", email: "asha@example.com"
  });
});

test("rejects an invalid email address", () => {
  assert.equal(normalizeRegistrationInput("Asha Rao", "not-an-email").ok, false);
});

test("rejects a name that is too short", () => {
  assert.equal(normalizeRegistrationInput("A", "asha@example.com").ok, false);
});

test("detects when event capacity is reached", () => {
  assert.equal(isAtCapacity(30, 30), true);
});

test("allows registration while seats remain", () => {
  assert.equal(isAtCapacity(30, 29), false);
});
