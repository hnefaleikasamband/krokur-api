import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
  const SALT_FACTOR = 12;
  const salt = await bcrypt.genSalt(SALT_FACTOR);
  return bcrypt.hash(password, salt);
};

export default { hashPassword };
