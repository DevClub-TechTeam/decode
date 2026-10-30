const server = Bun.serve({
    hostname: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT || 3000),

    async fetch(req) {
        const url = new URL(req.url);
        const pathname = decodeURIComponent(url.pathname);

        const publicDir = `${import.meta.dir}/public`;
        const filePath = `${publicDir}${pathname}`;

        // Serve requested frontend asset
        if (pathname !== "/") {
            const file = Bun.file(filePath);

            if (await file.exists()) {
                return new Response(file);
            }

            // Don't return index.html for missing assets
            if (pathname.startsWith("/assets/")) {
                return new Response("Not Found", { status: 404 });
            }
        }

        // Serve Vue application
        return new Response(Bun.file(`${publicDir}/index.html`));
    },
});

console.log(`Server running on port ${server.port}`);