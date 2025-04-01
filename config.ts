export const config = {
    port: process.env.PORT || 3100,
    databaseUrl: process.env.MONGODB_AWS || 'mongodb+srv://<username+password>@cluster0.8yfhgmb.mongodb.net/IoT?retryWrites=true&w=majority'
};