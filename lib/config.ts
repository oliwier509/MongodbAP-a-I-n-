export const config = {
   port: process.env.PORT || 3100,
   supportedDevicesNum: 17,
   JwtSecret: "secret",
   databaseUrl: process.env.MONGODB_AWS || 'mongodb+srv://<AMELINIUM>:<NIE POMALUJESZ>@cluster0.8yfhgmb.mongodb.net/IoT?retryWrites=true&w=majority'
};