export const config = {
   port: process.env.PORT || 3100,
   supportedDevicesNum: 16,
   JwtSecret: "secret",
   updateIntervalMs: 5000,
   clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
   databaseUrl: process.env.MONGODB_AWS || 'mongodb+srv://<CREDENTIALS>@cluster0.8yfhgmb.mongodb.net/IoT?retryWrites=true&w=majority'
};