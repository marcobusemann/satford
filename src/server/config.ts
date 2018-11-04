interface Config {
    port: string;
}

export const config: Config = {
    port: process.env.PORT || "3000",
};