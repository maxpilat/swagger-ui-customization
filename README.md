# Swagger UI Customization

Customizes the Swagger UI with a version selector and allows you to track API version changes by adding colored tags to operations. Also automatically expands spoilers for convenience.

### Usage

To apply the customization, follow these two steps:

1. Import `setupSwaggerCustomization` in the Swagger configuration file (usually `setup-app.ts`):

   ```typescript
   import setupSwaggerCustomization, {
     Versions,
   } from 'swagger-ui-customization';
   ```

2. Call `setupSwaggerCustomization` in the `onComplete` configuration of Swagger:

   ```typescript
   swaggerOptions: {
       onComplete: () => {
           setupSwaggerCustomization(window, {
               '1': Versions.V1,
               '2': Versions.V2,
               '-': Versions.ALL
           });
       },
   },
   ```

Pass the `window` object and an `object with versions` to `setupSwaggerCustomization` to define which API versions will be displayed in the version selector.
