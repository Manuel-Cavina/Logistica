# Logistica

## Desarrollo

```sh
pnpm dev
```

## Admin mock de desarrollo

Para habilitar una cuenta admin mockeada solo en local/dev:

```env
AUTH_MOCK_ADMIN_ENABLED="true"
AUTH_MOCK_ADMIN_EMAIL="admin@example.com"
AUTH_MOCK_ADMIN_PASSWORD="secret123"
```

Con esa configuración, el login normal en `/login` acepta esas credenciales y crea una sesión `ADMIN` de desarrollo sin requerir un usuario persistido en base de datos. En producción queda deshabilitado aunque la variable exista.
