import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.IMAGE_SERVER_PORT || 4000);
const publicUrl = (process.env.IMAGE_SERVER_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, "");
const uploadRoot = path.resolve(process.env.IMAGE_SERVER_STORAGE_DIR || path.join(moduleDirectory, "uploads"));
const serverToken = process.env.IMAGE_SERVER_TOKEN;
const allowedOrigin = process.env.IMAGE_SERVER_ALLOWED_ORIGIN || "http://localhost:3001";
const assetFolders = { product: "products", hero: "heroes", category: "categories" };
const extensionByMimeType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

if (!serverToken || serverToken.length < 32) {
  throw new Error("IMAGE_SERVER_TOKEN must be a unique secret of at least 32 characters.");
}

function secureEquals(value) {
  const expected = Buffer.from(serverToken);
  const received = Buffer.from(value || "");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function requireServerToken(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!secureEquals(token)) return response.status(401).json({ error: "Unauthorized" });
  next();
}

function isImage(buffer, mimeType) {
  if (mimeType === "image/jpeg") return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
}

function safeAssetPath(assetId) {
  if (typeof assetId !== "string" || !/^(products|heroes|categories)\/[a-f0-9-]+\.(jpg|png|webp)$/.test(assetId)) return null;
  const result = path.resolve(uploadRoot, assetId);
  return result.startsWith(`${uploadRoot}${path.sep}`) ? result : null;
}

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigin, methods: ["GET", "POST", "DELETE"], allowedHeaders: ["Authorization", "Content-Type"] }));
app.use(express.json({ limit: "8kb" }));
app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use("/images", express.static(uploadRoot, { fallthrough: false, maxAge: "30d", immutable: true, index: false }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
app.post("/v1/images", requireServerToken, upload.single("file"), async (request, response) => {
  const assetType = request.body.assetType;
  const folder = assetFolders[assetType];
  const file = request.file;
  if (!folder || !file || !extensionByMimeType[file.mimetype] || !isImage(file.buffer, file.mimetype)) return response.status(400).json({ error: "Upload a JPG, PNG, or WebP image under 5 MB." });
  const extension = extensionByMimeType[file.mimetype];
  const fileName = `${randomUUID()}.${extension}`;
  const assetId = `${folder}/${fileName}`;
  const directory = path.join(uploadRoot, folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), file.buffer, { flag: "wx" });
  response.status(201).json({ imageUrl: `${publicUrl}/images/${assetId}`, imagePublicId: assetId });
});

app.delete("/v1/images", requireServerToken, async (request, response) => {
  const imagePath = safeAssetPath(request.body?.assetId);
  if (!imagePath) return response.status(400).json({ error: "Invalid asset ID" });
  if (existsSync(imagePath)) await rm(imagePath);
  response.status(204).end();
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) return response.status(400).json({ error: "Upload one image smaller than 5 MB." });
  console.error("Image server error:", error);
  response.status(500).json({ error: "Image server error" });
});

await mkdir(uploadRoot, { recursive: true });
app.listen(port, () => console.log(`Bhatia image server listening on ${publicUrl}`));
