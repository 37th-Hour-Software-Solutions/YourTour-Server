const loginSchema = {
  email: {
    isEmail: true,
    optional: false,
  },
  password: {
    optional: false,
  },
};

module.exports = { loginSchema };