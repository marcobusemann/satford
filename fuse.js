const {
    FuseBox,
    WebIndexPlugin,
    CSSPlugin,
    QuantumPlugin
} = require("fuse-box");

const isDebug = process.env.NODE_ENV !== "production";

const fuseServer = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    sourceMaps: true
});

const fuseClient = FuseBox.init({
    homeDir: "src",
    output: "dist/public/$name.js",
    sourceMaps: true,
    plugins: [
        CSSPlugin(),
        WebIndexPlugin({
            template: "src/client/index.html",
            target: "index.html",
            path: "/public/",
            bundles: ["bundle"]
        }),
        !isDebug &&
            QuantumPlugin({
                uglify: false,
                css: {
                    path: "styles.min.css"
                },
                bakeApiIntoBundle: "bundle",
                treeshake: false,
                api: (core) => {
                    core.solveComputed("moment/moment.js", {
                        mapping: "moment/locale**",
                        fn: statement => {
                            statement.setExpression(`"moment/locale/" + name + ".js"`)
                        }
                    });
                }
            })
    ]
});

if (isDebug) {
    fuseServer.dev({
        port: 4444,
        httpServer: false
    });
}

const serverBundle = fuseServer
    .bundle("server")
    .target("server@esnext")
    .instructions(" > [server/index.ts]");

if (isDebug)
    serverBundle.watch("server/**").completed(proc => {
        proc.start();
    });

const clientBundle = fuseClient
    .bundle("bundle")
    .target("browser");

if (isDebug) clientBundle.hmr().watch("client/**");

clientBundle.instructions(" > client/index.tsx");

fuseServer.run();
fuseClient.run();
