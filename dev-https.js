const https = require("https");
const httpProxy = require("http-proxy");
const selfsigned = require("selfsigned");

const PORT = parseInt(process.env.HTTPS_PORT || "3443", 10);
const TARGET = process.env.HTTP_TARGET || "http://localhost:3000";

const attrs = [{ name: "commonName", value: "lvh.me" }];
const pems = selfsigned.generate(attrs, {
  days: 7,
  keySize: 2048,
  extensions: [
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "lvh.me" },
        { type: 2, value: "*.lvh.me" },
        { type: 7, ip: "127.0.0.1" },
        { type: 2, value: "localhost" },
      ],
    },
  ],
});

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  xfwd: true,
  ws: true,
});

proxy.on("error", (err) => {
  console.error("Proxy error:", err.message);
});

const server = https.createServer(
  {
    key: pems.private,
    cert: pems.cert,
  },
  (req, res) => {
    req.headers["x-forwarded-proto"] = "https";
    proxy.web(req, res);
  }
);

server.on("upgrade", (req, socket, head) => {
  req.headers["x-forwarded-proto"] = "https";
  proxy.ws(req, socket, head);
});

server.listen(PORT, () => {
  console.log(`HTTPS dev proxy listening on https://lvh.me:${PORT} → ${TARGET}`);
  console.log(`Try: https://ultimatestore.lvh.me:${PORT}/`);
});
