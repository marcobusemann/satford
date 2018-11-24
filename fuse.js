const { FuseBox, WebIndexPlugin, CSSPlugin } = require("fuse-box");

const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    sourceMaps: true,
    plugins: [
        CSSPlugin(),
        WebIndexPlugin({
            template: "src/client/index.html",
            target: "public/index.html",
            bundles: ["public/bundle"]
        })
    ]
});

fuse.dev({
    port: 4445,
    httpServer: false
});

fuse.bundle("server")
    .watch("server/**")
    .target("server@esnext")
    .instructions(" > [server/index.ts]")
    .completed(proc => {
        proc.start();
    });

fuse.bundle("public/bundle")
    .watch("client/**")
    .target("browser")
    .hmr()
    .instructions(" > client/index.tsx");

fuse.run();
