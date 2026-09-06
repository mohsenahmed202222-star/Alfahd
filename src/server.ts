import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { timingSafeEqual, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SERVICE_LANDING_PAGES } from './app/seo/service-pages.data';

interface GalleryRecord {
  id: string;
  title: string;
  category: string;
  url: string;
  objectName?: string;
}

interface UploadBody {
  title?: unknown;
  category?: unknown;
  dataUrl?: unknown;
}

const browserDistFolder = join(import.meta.dirname, '../browser');
const uploadsFolder = join(process.cwd(), 'public', 'uploads');
const galleryFile = process.env['GALLERY_DATA_FILE'] || join(process.cwd(), 'data', 'gallery.json');

const app = express();
const angularApp = new AngularNodeAppEngine();

function getPublicSiteUrl(): string | null {
  const configuredUrl = process.env['SITE_URL'];
  if (!configuredUrl) return null;
  try {
    const parsedUrl = new URL(configuredUrl);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') return null;
    return parsedUrl.origin;
  } catch {
    return null;
  }
}

app.get('/robots.txt', (_request, response) => {
  const siteUrl = getPublicSiteUrl();
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Allow: /api/gallery-media/',
    'Disallow: /admin',
    'Disallow: /api/',
  ];
  if (siteUrl) lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  response.type('text/plain').send(`${lines.join('\n')}\n`);
});

app.get('/sitemap.xml', (_request, response) => {
  const siteUrl = getPublicSiteUrl();
  if (!siteUrl) {
    response.status(503).type('text/plain').send('Set SITE_URL to the public website origin.');
    return;
  }
  const paths = ['/', ...SERVICE_LANDING_PAGES.map((page) => `/services/${page.slug}`)];
  const urls = paths.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`).join('');
  response
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
    );
});

app.use(express.json({ limit: '9mb' }));

async function getGoogleAccessToken(): Promise<string> {
  const configuredToken = process.env['GCS_ACCESS_TOKEN'];
  if (configuredToken) return configuredToken;

  const response = await fetch(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    { headers: { 'Metadata-Flavor': 'Google' }, signal: AbortSignal.timeout(3000) }
  );
  if (!response.ok) throw new Error('Unable to get Google Cloud access token');
  const token = (await response.json()) as { access_token?: string };
  if (!token.access_token) throw new Error('Google Cloud access token is missing');
  return token.access_token;
}

function storageEndpoint(objectName: string): string {
  const bucket = process.env['GALLERY_BUCKET'];
  if (!bucket) throw new Error('GALLERY_BUCKET is not configured');
  const query = new URLSearchParams({ uploadType: 'media', name: objectName });
  return `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(
    bucket
  )}/o?${query}`;
}

async function readGallery(): Promise<GalleryRecord[]> {
  const bucket = process.env['GALLERY_BUCKET'];
  if (bucket) {
    const token = await getGoogleAccessToken();
    const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
      bucket
    )}/o/gallery.json?alt=media`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 404) return [];
    if (!response.ok) throw new Error('Unable to read gallery from Google Cloud Storage');
    return (await response.json()) as GalleryRecord[];
  }

  try {
    return JSON.parse(await readFile(galleryFile, 'utf8')) as GalleryRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeGallery(images: GalleryRecord[]): Promise<void> {
  const bucket = process.env['GALLERY_BUCKET'];
  const body = JSON.stringify(images, null, 2);
  if (bucket) {
    const token = await getGoogleAccessToken();
    const response = await fetch(storageEndpoint('gallery.json'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    });
    if (!response.ok) throw new Error('Unable to save gallery to Google Cloud Storage');
    return;
  }

  await mkdir(dirname(galleryFile), { recursive: true });
  await writeFile(galleryFile, body, 'utf8');
}

async function uploadObject(objectName: string, contentType: string, data: Buffer): Promise<void> {
  const bucket = process.env['GALLERY_BUCKET'];
  if (bucket) {
    const token = await getGoogleAccessToken();
    const response = await fetch(storageEndpoint(objectName), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
      body: Uint8Array.from(data),
    });
    if (!response.ok) throw new Error('Unable to upload image to Google Cloud Storage');
    return;
  }

  const localFile = join(uploadsFolder, objectName);
  await mkdir(dirname(localFile), { recursive: true });
  await writeFile(localFile, data, { flag: 'wx' });
}

async function deleteObject(image: GalleryRecord): Promise<void> {
  const bucket = process.env['GALLERY_BUCKET'];
  if (bucket && image.objectName) {
    const token = await getGoogleAccessToken();
    const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
      bucket
    )}/o/${encodeURIComponent(image.objectName)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok && response.status !== 404)
      throw new Error('Unable to delete image from Google Cloud Storage');
  } else if (image.objectName) {
    try {
      await unlink(join(uploadsFolder, image.objectName));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

function isAuthorized(request: express.Request, response: express.Response): boolean {
  const adminPassword = process.env['ADMIN_PASSWORD'];
  if (!adminPassword) {
    response.status(503).json({ message: 'Image administration is not configured' });
    return false;
  }

  const suppliedPassword = request.header('x-admin-password') ?? '';
  const supplied = Buffer.from(suppliedPassword);
  const expected = Buffer.from(adminPassword);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    response.status(401).json({ message: 'Invalid admin password' });
    return false;
  }
  return true;
}

app.get('/api/gallery', async (_request, response, next) => {
  try {
    response.json(await readGallery());
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery-media/:id', async (request, response, next) => {
  try {
    const image = (await readGallery()).find((item) => item.id === request.params['id']);
    if (!image?.objectName) {
      response.sendStatus(404);
      return;
    }

    const bucket = process.env['GALLERY_BUCKET'];
    let imageData: Buffer;
    let contentType: string | undefined;
    if (bucket) {
      const token = await getGoogleAccessToken();
      const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
        bucket
      )}/o/${encodeURIComponent(image.objectName)}?alt=media`;
      const storedImage = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!storedImage.ok) {
        response.sendStatus(storedImage.status === 404 ? 404 : 502);
        return;
      }
      contentType = storedImage.headers.get('content-type') ?? undefined;
      imageData = Buffer.from(await storedImage.arrayBuffer());
    } else {
      imageData = await readFile(join(uploadsFolder, image.objectName));
    }

    response.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    if (contentType) response.type(contentType);
    response.send(imageData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      response.sendStatus(404);
      return;
    }
    next(error);
  }
});

app.post('/api/gallery', async (request, response, next) => {
  if (!isAuthorized(request, response)) return;
  try {
    const { title, category, dataUrl } = request.body as UploadBody;
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.length > 120 ||
      typeof category !== 'string' ||
      !category.trim() ||
      category.length > 60 ||
      typeof dataUrl !== 'string'
    ) {
      response.status(400).json({ message: 'Invalid image details' });
      return;
    }

    const match = /^data:(image\/(?:jpeg|png|webp|avif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      response.status(400).json({ message: 'Unsupported image format' });
      return;
    }

    const contentType = match[1];
    const imageData = Buffer.from(match[2], 'base64');
    if (imageData.length === 0 || imageData.length > 6 * 1024 * 1024) {
      response.status(413).json({ message: 'Image exceeds the 6 MB limit' });
      return;
    }

    const extensionByType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/avif': '.avif',
    };
    const id = randomUUID();
    const objectName = `uploads/${id}${extensionByType[contentType]}`;
    await uploadObject(objectName, contentType, imageData);
    const url = `/api/gallery-media/${id}`;
    const image: GalleryRecord = { id, title: title.trim(), category, url, objectName };
    await writeGallery([image, ...(await readGallery())]);
    response.status(201).json(image);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/gallery/:id', async (request, response, next) => {
  if (!isAuthorized(request, response)) return;
  try {
    const images = await readGallery();
    const image = images.find((item) => item.id === request.params['id']);
    if (!image) {
      response.sendStatus(404);
      return;
    }
    await deleteObject(image);
    await writeGallery(images.filter((item) => item.id !== image.id));
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.use(
  '/api',
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Gallery API error:', error);
    response.status(500).json({ message: 'Gallery request failed' });
  }
);

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
