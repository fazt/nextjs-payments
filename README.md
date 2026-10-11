# Next Payments

Tienda online con suscripciones hecha con **Next.js 16** que integra tres pasarelas de pago: **Stripe**, **PayPal** y **Mercado Pago**. Incluye catálogo, carrito, checkout, suscripciones mensuales, webhooks y un panel de administración.

Es un proyecto de ejemplo para aprender a integrar pagos reales (en modo de prueba) en una app full stack con App Router, Prisma y PostgreSQL.

## Funcionalidades

- **Tienda**: catálogo de productos con categorías, stock e imágenes; carrito persistente (localStorage) con cantidades.
- **Checkout con tres pasarelas**:
  - Stripe Checkout (pago único y suscripción).
  - PayPal con el SDK JS v6: pago único (crear orden + capturar en el servidor) y suscripciones.
  - Mercado Pago Checkout Pro (redirección o Wallet Brick).
- **Webhooks** con verificación de firma para las tres pasarelas. Registran el pedido, su detalle y el pago, y descuentan el stock en una transacción. Son idempotentes: un webhook repetido no duplica pedidos.
- **Suscripciones** mensuales (Stripe y PayPal) con planes guardados en la base de datos, cancelación desde el perfil y sincronización de planes con PayPal desde el panel.
- **Autenticación** con email y contraseña (next-auth, JWT). Roles `user` y `admin`.
- **Panel** (`/dashboard`):
  - Resumen: ventas, pedidos y suscripciones activas; el usuario ve sus pedidos.
  - Productos: crear, editar y eliminar, con editor de texto enriquecido y subida de imágenes a Cloudinary.
  - Categorías, usuarios y planes (solo admin).
  - Perfil con la suscripción activa.
- **Sin credenciales también funciona**: si falta la configuración de una pasarela, la app arranca igual y esa pasarela aparece como "no disponible" (sus endpoints responden `503`).
- El servidor recalcula precios y stock: el carrito del navegador solo envía ids y cantidades.

## Stack

| Área          | Tecnología                                                         | Versión               |
| ------------- | ------------------------------------------------------------------ | --------------------- |
| Framework     | Next.js (App Router, Turbopack)                                    | 16.4                  |
| UI            | React                                                              | 19.3                  |
| Lenguaje      | TypeScript                                                         | 5.9                   |
| Estilos       | Tailwind CSS · Headless UI · Heroicons                             | 4.3 · 2.2 · 2.2       |
| Base de datos | PostgreSQL (Docker)                                                | 17                    |
| ORM           | Prisma ORM con `@prisma/adapter-pg`                                | 7.10                  |
| Auth          | next-auth (Credentials + JWT)                                      | 4.24                  |
| Formularios   | react-hook-form · zod · @hookform/resolvers                        | 7.90 · 4.6 · 5.9      |
| Estado        | zustand                                                            | 5.0                   |
| Tablas        | TanStack Table                                                     | 9.2                   |
| Stripe        | `stripe` (API `2026-09-30.endive`)                                 | 23.0                  |
| PayPal        | `@paypal/paypal-server-sdk` · `@paypal/react-paypal-js` (SDK v6)   | 2.5 · 10.6            |
| Mercado Pago  | `mercadopago` · `@mercadopago/sdk-react`                           | 3.6 · 1.0             |
| Imágenes      | Cloudinary                                                         | 2.11                  |
| Calidad       | ESLint (flat config) · Jest · Testing Library · Husky              | 10 · 30 · 16 · 9      |

## Requisitos

- Node.js **20.19 o superior** (recomendado 24 LTS) y npm.
- Docker (para PostgreSQL).
- Cuentas de prueba en las pasarelas que quieras usar (todas son opcionales).
- Opcional: [Stripe CLI](https://docs.stripe.com/stripe-cli) y un túnel HTTPS (`cloudflared`, `ngrok` o los túneles de VS Code) para recibir webhooks en local.

## Puesta en marcha

```bash
git clone https://github.com/fazt/nextjs-payments.git
cd nextjs-payments

# 1. Variables de entorno
cp .env.example .env          # completa NEXTAUTH_SECRET y las pasarelas que uses

# 2. Base de datos: PostgreSQL 17 en localhost:5463 (contenedor nextjs-payments-db)
docker compose up -d

# 3. Dependencias (postinstall ejecuta `prisma generate`)
npm install

# 4. Migraciones y datos de ejemplo
npx prisma migrate dev
npm run db:seed

# 5. Servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000>. El seed crea:

| Rol     | Email               | Contraseña |
| ------- | ------------------- | ---------- |
| admin   | `admin@example.com` | `admin123` |
| usuario | `user@example.com`  | `user1234` |

También crea 3 categorías, 6 productos (uno sin stock) y 3 planes de suscripción (Básico, Pro y Premium). Puedes ejecutarlo varias veces: no duplica datos.

> Con Prisma 7, `migrate dev` ya no ejecuta el seed ni `prisma generate` de forma automática. Por eso el seed se lanza aparte.

## Configuración de las pasarelas

Todas las URLs de retorno se construyen con `NEXTAUTH_URL`. Para recibir webhooks en local necesitas una URL pública HTTPS, por ejemplo:

```bash
cloudflared tunnel --url http://localhost:3000   # o: ngrok http 3000
```

### Stripe

1. En el [Dashboard de Stripe](https://dashboard.stripe.com/test/apikeys) (modo test) copia la clave secreta `sk_test_...` en `STRIPE_SECRET_KEY`.
2. Webhook en local con Stripe CLI:

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhook
   ```

   La CLI imprime un secreto `whsec_...`: cópialo en `STRIPE_ENDPOINT_SECRET` y reinicia `npm run dev`.
3. En producción crea el endpoint `https://TU-DOMINIO/api/webhook` en *Developers > Webhooks* con los eventos:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Para probar, paga con la tarjeta `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

Las suscripciones no necesitan crear precios en Stripe: Checkout usa `price_data` con el precio del plan. Si prefieres un *Price* propio, guarda su id en `SubscriptionPlan.stripePriceId`.

La integración fija la versión de API `2026-09-30.endive` (la de stripe-node 23). En esa versión `payment_method_types` ya no existe en Checkout: los métodos de pago se activan desde el Dashboard.

### PayPal

1. En [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox) > *Apps & Credentials* (Sandbox) crea una app y copia el **Client ID** y el **Secret** en `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`. `PAYPAL_API_URL` decide el entorno: sandbox (`https://api-m.sandbox.paypal.com`) o producción (`https://api-m.paypal.com`).
2. En *Sandbox accounts* tienes una cuenta **Personal** de prueba: úsala para iniciar sesión en la ventana de PayPal al pagar.
3. **Suscripciones**: entra al panel como admin, ve a *Planes* y pulsa **Sincronizar con PayPal**. Se crean en PayPal un producto y un plan mensual por cada plan local. Después aparece el botón de PayPal en `/subscriptions`.
4. **Webhook**: en la app de PayPal añade un webhook con la URL `https://TU-TUNEL/api/checkout/paypal/webhooks` y los eventos:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `PAYMENT.SALE.COMPLETED`

   Copia el **Webhook ID** en `PAYPAL_WEBHOOK_ID`: sin él el endpoint responde `503` porque no puede verificar la firma.

El pago único no depende del webhook: el botón aprueba la orden y el servidor la captura en `/api/checkout/paypal/capture`, donde se registra el pedido.

### Mercado Pago

1. En [Tus integraciones](https://www.mercadopago.com.pe/developers/panel/app) crea una aplicación (Checkout Pro) y copia las **credenciales de prueba**:
   - El *Access Token* en `MERCADOPAGO_ACCESS_TOKEN`.
   - Opcional: la *Public Key* en `MERCADOPAGO_PUBLIC_KEY`, para mostrar el Wallet Brick. Sin ella se redirige directamente a Checkout Pro.
2. Pon la URL de tu túnel en `MERCADOPAGO_BACKEND_URL`. Mercado Pago solo acepta `auto_return` y `notification_url` con una URL pública HTTPS. Con `localhost` el pago funciona igual, pero sin volver solo a la tienda ni enviar el webhook.
3. **Webhook**: en *Webhooks* configura la URL `https://TU-TUNEL/api/payments/mercadopago/webhook` con el evento **Pagos** y copia la *clave secreta* en `MERCADOPAGO_WEBHOOK_SECRET_KEY`. El servidor valida la cabecera `x-signature` y luego consulta el pago en la API.
4. Para probar, crea usuarios de prueba (comprador y vendedor) en el panel y paga con las [tarjetas de prueba](https://www.mercadopago.com.pe/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards) de tu país:
   - Titular `APRO`: pago aprobado.
   - Titular `OTHE`: pago rechazado.

La moneda de las preferencias es `PEN` (cámbiala con `MERCADOPAGO_CURRENCY`). Stripe y PayPal cobran en USD.

### Cloudinary (opcional)

Las imágenes de productos se suben a Cloudinary. Sin `CLOUDINARY_*` puedes crear productos sin imagen (la subida responde `503`).

## Variables de entorno

| Variable                         | Obligatoria | Descripción                                                                    |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`                   | Sí          | Conexión a PostgreSQL. Con docker compose: `postgresql://fazt:faztpassword@localhost:5463/nextfulldb` |
| `NEXTAUTH_URL`                   | Sí          | URL pública de la app. Se usa en next-auth y en las URLs de retorno             |
| `NEXTAUTH_SECRET`                | Sí          | Secreto para firmar el JWT (`openssl rand -base64 32`)                          |
| `CLOUDINARY_CLOUD_NAME`          | No          | Cloud name de Cloudinary                                                       |
| `CLOUDINARY_API_KEY`             | No          | API key de Cloudinary                                                          |
| `CLOUDINARY_API_SECRET`          | No          | API secret de Cloudinary                                                       |
| `STRIPE_SECRET_KEY`              | No          | Clave secreta de Stripe (`sk_test_...`). Sin ella Stripe aparece como no disponible |
| `STRIPE_ENDPOINT_SECRET`         | No          | Secreto de firma del webhook (`whsec_...`)                                     |
| `PAYPAL_API_URL`                 | No          | API de PayPal. Sandbox por defecto                                             |
| `PAYPAL_CLIENT_ID`               | No          | Client ID de la app de PayPal (también lo usan los botones)                    |
| `PAYPAL_CLIENT_SECRET`           | No          | Secret de la app de PayPal                                                     |
| `PAYPAL_WEBHOOK_ID`              | No          | Id del webhook de PayPal, para verificar las firmas                            |
| `MERCADOPAGO_ACCESS_TOKEN`       | No          | Access token de Mercado Pago                                                   |
| `MERCADOPAGO_WEBHOOK_SECRET_KEY` | No          | Clave secreta de los webhooks de Mercado Pago                                  |
| `MERCADOPAGO_BACKEND_URL`        | No          | URL pública HTTPS para `back_urls`, `auto_return` y el webhook (por defecto `NEXTAUTH_URL`) |
| `MERCADOPAGO_PUBLIC_KEY`         | No          | Public key para el Wallet Brick                                                |
| `MERCADOPAGO_CURRENCY`           | No          | Moneda de las preferencias (`PEN` por defecto)                                 |

## Scripts

| Script               | Qué hace                                                       |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo (Turbopack)                             |
| `npm run build`      | Build de producción (incluye la comprobación de TypeScript)    |
| `npm start`          | Sirve el build de producción                                   |
| `npm run lint`       | ESLint (también lo ejecuta el hook `pre-commit` de Husky)      |
| `npm run typecheck`  | `tsc --noEmit`                                                 |
| `npm test`           | Tests con Jest y Testing Library                               |
| `npm run db:migrate` | `prisma migrate dev`                                           |
| `npm run db:deploy`  | `prisma migrate deploy` (producción / CI)                      |
| `npm run db:seed`    | Carga los datos de ejemplo                                     |
| `npm run db:studio`  | Abre Prisma Studio                                             |

## Estructura

```text
├── prisma/
│   ├── schema.prisma          # modelos (User, Product, Order, Payments, SubscriptionPlan...)
│   ├── migrations/            # historial de migraciones
│   └── seed.ts                # datos de ejemplo
├── prisma.config.ts           # configuración de Prisma 7 (URL, migraciones, seed)
├── src/
│   ├── app/
│   │   ├── (landingLayout)/   # portada, productos, carrito, suscripciones, login y retornos de pago
│   │   ├── (dashboardLayout)/ # panel: resumen, productos, categorías, usuarios, planes, perfil
│   │   └── api/               # route handlers: auth, productos, checkout y webhooks
│   ├── components/            # UI y componentes de productos, categorías, usuarios, auth
│   ├── generated/prisma/      # cliente de Prisma generado (no se versiona)
│   ├── libs/                  # prisma, auth, carrito, pedidos y clientes de cada pasarela
│   ├── schemas/               # validaciones con zod
│   ├── store/                 # carrito (zustand)
│   ├── __tests__/             # tests
│   └── proxy.ts               # protección de /dashboard (antes middleware.ts)
├── docker-compose.yml         # PostgreSQL 17 en el puerto 5463
└── .github/workflows/         # CI (lint, tests, build) y deploy opcional con pm2
```

### Endpoints principales

| Método | Ruta                                          | Descripción                                        |
| ------ | --------------------------------------------- | -------------------------------------------------- |
| POST   | `/api/checkout`                               | Sesión de Stripe Checkout para el carrito           |
| POST   | `/api/checkout/subscription`                  | Sesión de Stripe Checkout para un plan              |
| POST   | `/api/checkout/subscription/cancel`           | Cancela la suscripción (Stripe o PayPal)            |
| POST   | `/api/webhook`                                | Webhook de Stripe                                   |
| POST   | `/api/checkout/paypal`                        | Crea una orden de PayPal                            |
| POST   | `/api/checkout/paypal/capture`                | Captura la orden aprobada y registra el pedido      |
| POST   | `/api/checkout/paypal/subscriptions`          | Crea una suscripción de PayPal                      |
| POST   | `/api/checkout/paypal/subscriptions/activate` | Verifica la suscripción aprobada y la guarda        |
| POST   | `/api/checkout/paypal/webhooks`               | Webhook de PayPal                                   |
| POST   | `/api/payments/paypal/plans/sync`             | Crea en PayPal los planes pendientes (admin)        |
| POST   | `/api/payments/mercadopago/checkout`          | Preferencia de Checkout Pro                         |
| POST   | `/api/payments/mercadopago/webhook`           | Webhook de Mercado Pago                             |
| POST   | `/api/products` · PUT/DELETE `/api/products/:id` | CRUD de productos (autor o admin)                |
| POST   | `/api/categories` · DELETE `/api/categories/:id` | Categorías (admin)                               |
| POST   | `/api/upload`                                 | Sube una imagen a Cloudinary                        |
| POST   | `/api/auth/signup`                            | Registro de usuarios                                |

## Notas técnicas

- **Auth**: se mantiene **next-auth 4.24**, la versión estable que declara compatibilidad con Next 16. Auth.js v5 sigue en beta. El proxy de Next 16 (`src/proxy.ts`) usa `withAuth` y corre en el runtime de Node.
- **Prisma 7**: el cliente se genera en `src/generated/prisma` (generator `prisma-client`) y se conecta con `@prisma/adapter-pg`. La URL de conexión vive en `prisma.config.ts`.
- **ESLint 10** con la flat config de `eslint-config-next`. npm muestra avisos de *peer dependency* de algunos plugins que aún declaran `eslint@^9`, pero funcionan correctamente.
- **TanStack Table 9** y `react-medium-image-zoom` se publican solo como ESM. Por eso están en `transpilePackages`, lo que también permite que Jest los transforme.

## CI y despliegue

El workflow `.github/workflows/nextjs.yml` ejecuta, en cada push a `master` y en cada pull request:

1. `npm ci`.
2. Migraciones y seed sobre un PostgreSQL de servicio.
3. Lint, tests y build (sin credenciales de pasarelas).

El job de despliegue (runner *self-hosted* con pm2) solo se ejecuta si la variable del repositorio `DEPLOY_SELF_HOSTED` vale `true`. Lee los secrets con los mismos nombres que las variables de entorno.
