# TCMS Content

Хранилище тест кейсов для [TCMS](https://tcms.yurifedorov.com/)


## Database Synchronization

To synchronize your database using the schema from the `@yurifyodorov/tcms-data-sync` package, you can use the following command:

⚠️ **Warning:** This will drop all existing data and recreate the database structure from the schema.

```shell
npx prisma db push --schema=node_modules/@yurifyodorov/tcms-data-sync/prisma/schema.prisma --force-reset
```

### Generating Prisma Types

To generate the Prisma client and types for your project, use the following command:

```shell
npx prisma generate --schema=node_modules/@yurifyodorov/tcms-data-sync/prisma/schema.prisma
```