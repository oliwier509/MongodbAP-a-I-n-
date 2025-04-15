export const config = {
    port: process.env.PORT || 3100,
    socketPort: process.env.PORT || 3000,
    databaseUrl: process.env.MONGODB_AWS || 'mongodb+srv://admin:@cluster0.8yfhgmb.mongodb.net/IoT?retryWrites=true&w=majority'
};