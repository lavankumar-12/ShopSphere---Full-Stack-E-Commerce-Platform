import jwt from 'jsonwebtoken';

/**
 * Generate JWT and attach it as an HTTP-only cookie
 */
export const generateTokenAndSetCookie = (user, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);

  return token;
};
