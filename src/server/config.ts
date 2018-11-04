interface Config {
    port: string;
    mongodbUrl: string;
}

export const config: Config = {
    port: process.env.PORT || "3000",
    mongodbUrl: process.env.MONGODB_URL || '',
};