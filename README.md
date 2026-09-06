# AlFahd

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Image administration

Open `/admin` to add project photos to the public gallery. Set `ADMIN_PASSWORD` on the server before starting it; uploads and deletions require this password.

For local development, build the SSR application and start its Express server in PowerShell:

```powershell
npm run build
$env:ADMIN_PASSWORD = 'choose-a-long-password'
$env:NG_ALLOWED_HOSTS = 'localhost,127.0.0.1'
$env:SITE_URL = 'https://your-real-domain.example'
node dist/Al-Fahd/server/server.mjs
```

The local server stores gallery metadata in `data/gallery.json` and uploaded files in `public/uploads`. These local files are not persistent on Cloud Run.

For Cloud Run, set `ADMIN_PASSWORD`, `GALLERY_BUCKET`, `NG_ALLOWED_HOSTS`, and `SITE_URL` as service environment variables. Set `SITE_URL` to the final HTTPS domain without a trailing path (for example, `https://example.com`). Add the deployed hostname (and any custom domain) to `NG_ALLOWED_HOSTS`, separated by commas. The same `SITE_URL` drives canonical URLs, Open Graph URLs, and the sitemap. Grant the Cloud Run service account permission to read and write objects in that bucket (for example, `roles/storage.objectUser`). The server uses the Cloud Run service identity to store private images and gallery metadata in Cloud Storage. No public bucket access is required. `GCS_ACCESS_TOKEN` is only needed when running outside Google Cloud with an access token available.

After deployment, submit `https://your-real-domain.example/sitemap.xml` in Google Search Console and verify the domain. The homepage targets natural Egyptian Arabic searches around marble installation, natural stone facades, ceramic and porcelain installation, aluminum windows and doors, painting, and interior finishing. Add the real service city/address and Google Business Profile details when available; do not publish guessed location data.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
