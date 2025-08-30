
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const serveDocs = (app) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Mini Leave Management System API",
        version: "1.0.0",
        description: "API documentation for the Mini LMS backend"
      },
      servers: [
        { url: "http://localhost:4000/api" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      security: [{ bearerAuth: [] }]
    },
    apis: []
  };

  const swaggerSpec = swaggerJsdoc(options);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  console.log("Swagger docs available at /api/docs");
};
