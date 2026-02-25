const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const jwt        = require('jsonwebtoken');
const admin      = require('../config/firebase');
const UserModel  = require('../models/user.model');
const { AuthError, ConflictError } = require('../utils/errors');

/**
 * Verify a Firebase ID token and either sign up or sign in the user.
 * Returns a signed JWT for subsequent API calls.
 */
async function loginWithFirebase(firebaseToken) {
  // 1. Verify the Firebase token is legitimate
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(firebaseToken);
  } catch {
    throw new AuthError('Firebase token is invalid or expired');
  }

  const { uid, email, name } = decoded;

  // 2. Find or auto-provision user in our DB
  let user = await UserModel.findByFirebaseUid(uid);
  if (!user) {
    // First-time login – create the user with default STAFF role
    const created = await UserModel.create({ firebaseUid: uid, email, fullName: name });
    await UserModel.assignRole(created.id, 'STAFF');
    user = await UserModel.findByFirebaseUid(uid);
  }

  if (!user.is_active) {
    throw new AuthError('Your account has been deactivated. Contact an administrator.');
  }

  // 3. Issue our own JWT
  const token = jwt.sign(
    { sub: user.id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      id:         user.id,
      email:      user.email,
      fullName:   user.full_name,
      department: user.department,
      roles:      user.roles,
    },
  };
}

module.exports = { loginWithFirebase };
