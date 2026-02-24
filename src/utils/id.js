// src/utils/id.js

/**
 * Genera un ID único con prefijo: "txn_a1b2c3" o "goal_x9y8z7"
 * @param {'txn' | 'goal'} prefix
 * @returns {string}
 */
export function generateId(prefix = 'item') {
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${random}`;
}
