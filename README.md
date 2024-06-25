# Swagger UI Customization

Customizes the Swagger UI with a version selector and allows you to track API version changes by adding colored tags to operations. Also automatically expands spoilers for convenience.

### Usage

To apply the customization, follow these two steps:

1. Import `setupSwaggerCustomization` in the Swagger configuration file:

   ```typescript
   import setupSwaggerCustomization from 'swagger-ui-customization';
   ```

2. Specify the array of versions in swaggerOptions to define which API versions will be displayed in the version selector. Set the `setupSwaggerCustomization` function to the `onComplete` configuration of Swagger:

   ```typescript
   swaggerOptions: {
       versions: [1, 2, 3]
       onComplete: setupSwaggerCustomization,
     },
   ```
