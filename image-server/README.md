# Bhatia self-hosted image server

This is a standalone Node service. It stores product, category, and hero images on its own disk instead of Cloudinary.

## Configure

Set the same values in the store's `.env.local` and in the image-server host environment:

```env
IMAGE_SERVER_URL=http://localhost:4000
IMAGE_SERVER_TOKEN=use-a-unique-32-plus-character-secret-here
```

The image server also accepts these host-specific variables:

```env
IMAGE_SERVER_PORT=4000
IMAGE_SERVER_PUBLIC_URL=http://localhost:4000
IMAGE_SERVER_STORAGE_DIR=/var/lib/bhatia-images
IMAGE_SERVER_ALLOWED_ORIGIN=http://localhost:3001
IMAGE_SERVER_TOKEN=use-the-same-secret-as-the-store
```

## Run locally

From the project root:

```bash
npm run image-server
```

For production, run this process on a persistent VM/container or attach its storage directory to persistent disk. Use HTTPS for `IMAGE_SERVER_PUBLIC_URL` and set `IMAGE_SERVER_ALLOWED_ORIGIN` to the deployed storefront domain.

Images are served at `/images/<type>/<uuid>.<extension>`. Upload and deletion routes are token-protected; the browser never receives the server token.
