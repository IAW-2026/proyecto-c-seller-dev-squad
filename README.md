# C-Seller Dev Squad

Aplicación web para la gestión de vendedores, productos y ventas dentro de un marketplace. Los productos del sitio consisten de zapatillas de varias categorías: Running, training, lifestyle, casual, etc. Incluye panel de administración, panel de vendedores, gestión de stock, simulación de compras y procesamiento de pagos mediante integración con servicios externos. Desde el panel de administración se tiene una vista general y panorámica de lo que consiste el dominio de la app. Desde ver los vendedores, productos y ventas, como poder intervenir activando/desactivando vendedores y/o productos. 

## Deploy: 
     https://proyecto-c-seller-dev-squad.vercel.app/

## Funcionalidades
- Gestión de productos y stock.
- Gestión de ventas.
- Simulación de pagos.
- Panel de administración.
- Sistema de reseñas para vendedores.
- Generación de descripciones de productos (mediante el uso de Gemini)

## Integraciones
- Buyer App: exposición del catálogo de productos
- Payment App: procesamiento y confirmación de pagos.
- Feedback App: consulta de reseñas de vendedores.

### Registro de usuarios
Los nuevos usuarios pueden registrarse desde la pantalla de inicio de sesión utilizando una dirección de correo electrónico no registrada previamente.
Los usuarios ya registrados, realizan el sign in utilizando el panel provisto por Clerk, el cual se ubica en la pantalla de inicio. 

## Acceso por tipo de usuario

### Administrador
 Permite:
 - Visualizar y gestionar vendedores y productos

| Usuario | Email | Contraseña |
|----------|----------|----------|
| Administrador | admin+clerk_test@iaw.com | iawuser# |

### Vendedor
  Permite:
  - Publicar zapatillas
  - Consultar ventas realizadas
  - Visualizar reseñas recibidas

| Usuario | Email | Contraseña |
|----------|----------|----------|
| Bart Simpson | bart.simpsonvendedor@gmail.com | BartolomeoSimpson1989 |
| Lady Gaga | lady.gaga.vendedora@gmail.com | G4g4Password |
| Seller User | seller+clerk_test@iaw.com | iawuser# |

## Simulación de compra de productos 

Con el objetivo de probar que el sistema responde frente a la compra de un producto (y recibir desde Payments si el pago fue exitoso (confirmado) o no (Cancelado)): Se accede para comprar un producto mediante -> dashboard/mock-up

Acotaciones: Al intentar comprar un producto, sale una notifiación que indica si fue éxitoso o no. Si no lo fue, marca el por qué. Ante una compra exitosa, hace falta recargar la página para ver que cambie la cantidad del stock.
Si cuando se hace la venta, tenés abierto desde otro lugar el panel de administrador, debes de recargar la página para que se pueda ver la nueva venta. El estado puede ser confirmado o cancelado. El estado pendiente es imperceptible, ya que payments responde de forma casi inmediata. 

## Seguridad

Las comunicaciones entre aplicaciones utilizan una API Key compartida mediante el header: X-API-Key
Las solicitudes que no incluyen una clave válida son rechazadas. Se ve reflejado en api/sales, api/payments/webhook, en la cuestión
de la simulación de un pago.

## Notas generales:
- La asignación de roles se hace mediante publicMetadata.role en Clerk.
- La sidebar se actualiza dependiendo del rol.
- Stock por talle mediante ProductSize en lugar de un único stock global.
- La lógica de stock puede fallar frente a compras simultáneas a un mismo producto que le queda una unidad

## Tecnologías
- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- Clerk
- Vercel