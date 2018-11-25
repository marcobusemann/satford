interface Config {
    port: string;
    mongodbUrl: string;
    configFile: string;
}

export const config: Config = {
    port: process.env.PORT || "3000",
    mongodbUrl: process.env.MONGODB_URL || "",
    configFile: process.env.CONFIG_FILE || "config.json"
};
