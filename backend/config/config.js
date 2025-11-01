module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb+srv://chankey91_db_user:58wRr6h8hMZCk8iI@cluster0.qzn3jgd.mongodb.net/bloodbank?retryWrites=true&w=majority',
  jwtSecret: process.env.JWT_SECRET || 'bloodbank_secret_key_dev_2025_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  port: process.env.PORT || 5000,
  clientURL: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || ''
  }
};

