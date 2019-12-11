export default {
  krokurWeb: process.env.KROKUR_WEB,
  port: process.env.PORT || 3000,
  database: process.env.DB_URI || 'postgres://postgres:docker@localhost:5432/postgres',
  secret: process.env.JWT_SECRET || 'b7025001-67b2-4eb6-9d0b-297040f72d3e',
  googleId: process.env.GOOGLE_ID,
  googleSecret: process.env.GOOGLE_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/redirect',
};
