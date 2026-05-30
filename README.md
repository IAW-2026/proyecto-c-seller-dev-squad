# C-Seller Dev Squad

Aplicación web para la gestión de vendedores, productos y ventas dentro de un marketplace. Incluye panel de administración, panel de vendedores, gestión de stock, simulación de compras y procesamiento de pagos mediante integración con servicios externos.

## Deploy: 
     https://proyecto-c-seller-dev-squad.vercel.app/

## Funcionalidades
- Gestión de productos y stock.
- Gestión de ventas.
- Simulación de pagos.
- Panel de administración.
- Sistema de reseñas para vendedores.

## Integraciones
- Payment App: procesamiento y confirmación de pagos.
- Feedback App: consulta de reseñas de vendedores.

## Acceso por tipo de usuario

### Administrador

| Usuario | Email | Contraseña |
|----------|----------|----------|
| Administrador | zapasya.clerk@gmail.com | ZapasYa11@ |

### Vendedor

| Usuario | Email | Contraseña |
|----------|----------|----------|
| Bart Simpson | bart.simpsonvendedor@gmail.com | BartolomeoSimpson1989 |
| Lady Gaga | lady.gaga.vendedora@gmail.com | G4g4Password |


### Registro de nuevos usuarios
Los nuevos usuarios pueden registrarse desde la pantalla de inicio de sesión utilizando una dirección de correo electrónico no registrada previamente.


## Simulación de compra de productos 

Con el objetivo de probar que el sistema responde frente a la compra de un producto (y recibir desde Payments si el pago fue exitoso (confirmado) o no (Cancelado)): Se accede para comprar un producto mediante -> dashboard/mock-up

## Tecnologías
- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- Clerk
- Vercel