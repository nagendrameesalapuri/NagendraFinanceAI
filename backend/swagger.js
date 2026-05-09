const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nagendra's Finance AI API",
      version: "1.0.0",
      description: "REST API for personal finance management — transactions, budgets, goals, subscriptions, and user management.",
    },
    servers: [
      { url: process.env.RENDER_EXTERNAL_URL || "http://localhost:5000", description: "Server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token from /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            full_name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            currency: { type: "string", example: "INR" },
            is_admin: { type: "integer", example: 0 },
            created_at: { type: "string" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            title: { type: "string" },
            amount: { type: "number" },
            type: { type: "string", enum: ["income", "expense"] },
            category: { type: "string" },
            date: { type: "string", example: "2026-05-09" },
            note: { type: "string" },
            linked_goal_id: { type: "integer", nullable: true },
          },
        },
        Goal: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            target_amount: { type: "number" },
            saved: { type: "number" },
            icon: { type: "string" },
            color: { type: "string" },
          },
        },
        Budget: {
          type: "object",
          properties: {
            id: { type: "integer" },
            category: { type: "string" },
            limit_amount: { type: "number" },
            spent: { type: "number" },
            icon: { type: "string" },
          },
        },
        Subscription: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            amount: { type: "number" },
            due_date: { type: "string" },
            icon: { type: "string" },
            color: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Register and login" },
      { name: "Transactions", description: "Income and expense transactions" },
      { name: "Goals", description: "Savings goals" },
      { name: "Budgets", description: "Category budgets" },
      { name: "Subscriptions", description: "Recurring subscriptions" },
      { name: "Profile", description: "User profile and password" },
      { name: "Preferences", description: "App preferences" },
      { name: "Admin", description: "Admin-only user management" },
    ],
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["full_name", "email", "password"],
                  properties: {
                    full_name: { type: "string", example: "Nagendra" },
                    email: { type: "string", example: "nagendra@example.com" },
                    password: { type: "string", example: "secret123" },
                    phone: { type: "string", example: "9989966207" },
                    currency: { type: "string", example: "INR" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
            400: { description: "Missing fields", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "nagendra@example.com" },
                    password: { type: "string", example: "secret123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/transactions": {
        get: {
          tags: ["Transactions"],
          summary: "Get all transactions",
          parameters: [
            { name: "type", in: "query", schema: { type: "string", enum: ["all", "income", "expense"] } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 200 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: { 200: { description: "List of transactions", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Transaction" } } } } } },
        },
        post: {
          tags: ["Transactions"],
          summary: "Add a transaction",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "amount", "type", "date"],
                  properties: {
                    title: { type: "string", example: "Salary" },
                    amount: { type: "number", example: 50000 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string", example: "salary" },
                    date: { type: "string", example: "2026-05-01" },
                    note: { type: "string" },
                    linked_goal_id: { type: "integer", nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Transaction created", content: { "application/json": { schema: { $ref: "#/components/schemas/Transaction" } } } },
            400: { description: "Missing fields" },
          },
        },
      },
      "/api/transactions/{id}": {
        put: {
          tags: ["Transactions"],
          summary: "Update a transaction",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Transaction" } } } },
          responses: { 200: { description: "Updated transaction" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Transactions"],
          summary: "Delete a transaction",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } },
        },
      },
      "/api/goals": {
        get: { tags: ["Goals"], summary: "Get all savings goals", responses: { 200: { description: "List of goals", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Goal" } } } } } } },
        post: {
          tags: ["Goals"],
          summary: "Create a savings goal",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "target_amount"], properties: { name: { type: "string" }, target_amount: { type: "number" }, icon: { type: "string" }, color: { type: "string" } } } } } },
          responses: { 201: { description: "Goal created" } },
        },
      },
      "/api/goals/{id}": {
        put: { tags: ["Goals"], summary: "Update a goal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Goal" } } } }, responses: { 200: { description: "Updated" }, 404: { description: "Not found" } } },
        delete: { tags: ["Goals"], summary: "Delete a goal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } } },
      },
      "/api/budgets": {
        get: { tags: ["Budgets"], summary: "Get all budgets with current month spending", responses: { 200: { description: "List of budgets", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Budget" } } } } } } },
        post: { tags: ["Budgets"], summary: "Create a budget", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["category", "limit_amount"], properties: { category: { type: "string" }, limit_amount: { type: "number" }, icon: { type: "string" } } } } } }, responses: { 201: { description: "Budget created" }, 409: { description: "Budget already exists for category" } } },
      },
      "/api/budgets/{id}": {
        put: { tags: ["Budgets"], summary: "Update a budget", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Budget" } } } }, responses: { 200: { description: "Updated" } } },
        delete: { tags: ["Budgets"], summary: "Delete a budget", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Deleted" } } },
      },
      "/api/subscriptions": {
        get: { tags: ["Subscriptions"], summary: "Get all subscriptions", responses: { 200: { description: "List", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Subscription" } } } } } } },
        post: { tags: ["Subscriptions"], summary: "Add a subscription", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "amount", "due_date"], properties: { name: { type: "string" }, amount: { type: "number" }, due_date: { type: "string" }, icon: { type: "string" }, color: { type: "string" } } } } } }, responses: { 201: { description: "Created" } } },
      },
      "/api/subscriptions/{id}": {
        put: { tags: ["Subscriptions"], summary: "Update a subscription", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Subscription" } } } }, responses: { 200: { description: "Updated" } } },
        delete: { tags: ["Subscriptions"], summary: "Delete a subscription", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Deleted" } } },
      },
      "/api/profile": {
        get: { tags: ["Profile"], summary: "Get current user profile", responses: { 200: { description: "User profile", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } } },
        put: { tags: ["Profile"], summary: "Update profile", requestBody: { content: { "application/json": { schema: { type: "object", properties: { full_name: { type: "string" }, phone: { type: "string" }, currency: { type: "string" } } } } } }, responses: { 200: { description: "Updated profile" } } },
      },
      "/api/profile/password": {
        put: { tags: ["Profile"], summary: "Change password", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["current_password", "new_password"], properties: { current_password: { type: "string" }, new_password: { type: "string" } } } } } }, responses: { 200: { description: "Password changed" }, 401: { description: "Wrong current password" } } },
      },
      "/api/preferences": {
        get: { tags: ["Preferences"], summary: "Get user preferences", responses: { 200: { description: "Preferences object" } } },
        put: { tags: ["Preferences"], summary: "Update preferences", requestBody: { content: { "application/json": { schema: { type: "object", properties: { dark_mode: { type: "boolean" }, budget_alerts: { type: "boolean" }, weekly_reports: { type: "boolean" }, ai_insights: { type: "boolean" } } } } } }, responses: { 200: { description: "Updated preferences" } } },
      },
      "/api/admin/users": {
        get: { tags: ["Admin"], summary: "Get all users (admin only)", responses: { 200: { description: "List of all users" }, 403: { description: "Admin access required" } } },
      },
      "/api/admin/users/{id}": {
        delete: { tags: ["Admin"], summary: "Delete a user (admin only)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Deleted" }, 400: { description: "Cannot delete yourself" }, 403: { description: "Admin access required" } } },
      },
      "/api/health": {
        get: { tags: ["Auth"], summary: "Health check", security: [], responses: { 200: { description: "Server is running" } } },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
