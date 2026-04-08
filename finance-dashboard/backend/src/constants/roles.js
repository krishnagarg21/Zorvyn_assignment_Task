/**
 * Application-wide role constants.
 * Frozen to prevent accidental mutation at runtime.
 */
const ROLES = Object.freeze({
  VIEWER: 'VIEWER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
});

/** Ordered list of all valid roles for enum validation. */
const ROLE_LIST = Object.values(ROLES);

module.exports = { ROLES, ROLE_LIST };
