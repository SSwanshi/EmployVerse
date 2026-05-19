/**
 * OpenAPI spec for Applicant service.
 *
 * Note: kept in /applicant/swagger (separate from /frontend and /backend),
 * and mounted by the backend at:
 * - GET /api/docs (Swagger UI)
 * - GET /api/docs.json (raw OpenAPI JSON)
 */

const spec = {
  openapi: "3.0.3",
  info: {
    title: "GoHire Applicant API",
    version: "1.0.0",
    description:
      "Swagger documentation for the Applicant service (Try-it-out enabled).",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local applicant backend",
    },
  ],
  tags: [
    { name: "Health", description: "Service health check" },
    { name: "Auth", description: "Authentication and account flows" },
    { name: "Applicant", description: "Jobs, internships, applications, dashboard" },
    { name: "Profile", description: "Applicant profile + resume + profile image" },
    { name: "Payment", description: "Premium membership payments" },
    { name: "Files", description: "Download stored files (resume, profile image)" },
    { name: "Upload", description: "Upload files (resume, profile image)" },
    { name: "Search", description: "Search jobs and internships" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Paste the token from `/api/auth/login` as: `Bearer <token>`",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          success: { type: "boolean" },
        },
        additionalProperties: true,
      },
      SignupRequest: {
        type: "object",
        required: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "gender",
          "password",
          "confirmPassword",
        ],
        properties: {
          firstName: { type: "string", example: "Saurabh" },
          lastName: { type: "string", example: "Patil" },
          email: { type: "string", format: "email", example: "user@example.com" },
          phone: { type: "string", example: "9999999999" },
          gender: { type: "string", example: "Male" },
          password: { type: "string", example: "pass1234" },
          confirmPassword: { type: "string", example: "pass1234" },
        },
        additionalProperties: false,
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "pass1234" },
        },
        additionalProperties: false,
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          otp: { type: "string", example: "123456" },
        },
        additionalProperties: false,
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
        },
        additionalProperties: false,
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "newPassword"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          otp: { type: "string", example: "123456" },
          newPassword: { type: "string", example: "newpass1234" },
        },
        additionalProperties: false,
      },
      ApplyWithOptionalResumeRequest: {
        type: "object",
        properties: {
          resumeId: {
            type: "string",
            description:
              "Optional job/internship-specific uploaded resume id (from /apply/resume). If not provided, backend uses default profile resume.",
            example: "64d2f9b19c2a5c2f0f9e3c11",
          },
        },
        additionalProperties: false,
      },
      PaymentIntentRequest: {
        type: "object",
        required: ["amount", "plan"],
        properties: {
          amount: {
            type: "number",
            description: "Amount in dollars",
            example: 9.99,
          },
          plan: {
            type: "string",
            description: "Plan identifier (e.g. monthly/annual)",
            example: "monthly",
          },
        },
        additionalProperties: true,
      },
      ProcessPaymentRequest: {
        type: "object",
        required: ["paymentIntentId", "plan", "amount"],
        properties: {
          paymentIntentId: { type: "string", example: "pi_12345" },
          plan: { type: "string", example: "monthly" },
          amount: { type: "number", example: 9.99 },
        },
        additionalProperties: true,
      },
      ProfileUpdateRequest: {
        type: "object",
        description:
          "All fields are optional. To change password, provide currentPassword, newPassword, confirmNewPassword.",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          gender: { type: "string" },
          currentPassword: { type: "string" },
          newPassword: { type: "string" },
          confirmNewPassword: { type: "string" },
          collegeName: { type: "string" },
          skills: { type: "string" },
          about: { type: "string" },
          linkedinProfile: { type: "string" },
          githubProfile: { type: "string" },
          portfolioWebsite: { type: "string" },
          workExperience: { type: "string" },
          achievements: { type: "string" },
        },
        additionalProperties: true,
      },
      SearchRequest: {
        type: "object",
        required: ["parsedValue"],
        properties: {
          parsedValue: { type: "string", example: "react developer" },
        },
        additionalProperties: false,
      },
    },
    parameters: {
      JobIdParam: {
        name: "jobId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
      InternshipIdParam: {
        name: "internshipId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
      LogoIdParam: {
        name: "logoId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },

    // Auth
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Sign up",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          400: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          500: {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "OK (token or 2FA required)" },
          400: {
            description: "Invalid credentials / validation",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          500: {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/verify-2fa": {
      post: {
        tags: ["Auth"],
        summary: "Verify 2FA OTP",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyOtpRequest" } } },
        },
        responses: {
          200: { description: "OK (returns token)" },
          400: { description: "Invalid/expired OTP" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (client-side token removal)",
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "OK" },
          401: { description: "Not authenticated" },
          404: { description: "User not found" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Send forgot-password OTP",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
        },
        responses: {
          200: { description: "OK" },
          400: { description: "Validation error" },
          404: { description: "User not found" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify forgot-password OTP",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyOtpRequest" } } },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Invalid OTP" }, 500: { description: "Server error" } },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password using OTP",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Validation error" }, 500: { description: "Server error" } },
      },
    },

    // Applicant
    "/api/applicant/jobs": {
      get: {
        tags: ["Applicant"],
        summary: "Get jobs (paged + query filters)",
        parameters: [
          { name: "salaryMin", in: "query", schema: { type: "number" } },
          { name: "expMin", in: "query", schema: { type: "number" } },
          { name: "expMax", in: "query", schema: { type: "number" } },
          { name: "page", in: "query", schema: { type: "number" } },
          { name: "location", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/internships": {
      get: {
        tags: ["Applicant"],
        summary: "Get internships (paged + query filters)",
        parameters: [
          { name: "stipendMin", in: "query", schema: { type: "number" } },
          { name: "durationMin", in: "query", schema: { type: "number" } },
          { name: "durationMax", in: "query", schema: { type: "number" } },
          { name: "page", in: "query", schema: { type: "number" } },
          { name: "location", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/companies": {
      get: {
        tags: ["Applicant"],
        summary: "Get verified companies",
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/jobs/filter": {
      post: {
        tags: ["Applicant"],
        summary: "Filter jobs",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  salary1: { type: "boolean" },
                  salary2: { type: "boolean" },
                  salary3: { type: "boolean" },
                  salary4: { type: "boolean" },
                  exp1: { type: "boolean" },
                  exp2: { type: "boolean" },
                  exp3: { type: "boolean" },
                  exp4: { type: "boolean" },
                  exp5: { type: "boolean" },
                  exp6: { type: "boolean" },
                },
                additionalProperties: true,
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/internships/filter": {
      post: {
        tags: ["Applicant"],
        summary: "Filter internships",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  dur1: { type: "boolean" },
                  dur2: { type: "boolean" },
                  dur3: { type: "boolean" },
                  dur4: { type: "boolean" },
                },
                additionalProperties: true,
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/jobs/{jobId}": {
      get: {
        tags: ["Applicant"],
        summary: "Get job by id",
        parameters: [{ $ref: "#/components/parameters/JobIdParam" }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/internships/{internshipId}": {
      get: {
        tags: ["Applicant"],
        summary: "Get internship by id",
        parameters: [{ $ref: "#/components/parameters/InternshipIdParam" }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/jobs/{jobId}/apply/resume": {
      post: {
        tags: ["Applicant"],
        summary: "Upload job-specific resume (PDF, multipart)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/JobIdParam" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["resume"],
                properties: {
                  resume: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "OK (returns resumeId)" }, 400: { description: "No file/invalid file" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/jobs/{jobId}/apply": {
      post: {
        tags: ["Applicant"],
        summary: "Apply for job (optionally using job-specific resumeId)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/JobIdParam" }],
        requestBody: {
          required: false,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApplyWithOptionalResumeRequest" } } },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Validation error / already applied" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/internships/{internshipId}/apply": {
      get: {
        tags: ["Applicant"],
        summary: "Check internship + whether already applied",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InternshipIdParam" }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
      post: {
        tags: ["Applicant"],
        summary: "Apply for internship (optionally using internship-specific resumeId)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InternshipIdParam" }],
        requestBody: {
          required: false,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApplyWithOptionalResumeRequest" } } },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Validation error / already applied" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/internships/{internshipId}/apply/resume": {
      post: {
        tags: ["Applicant"],
        summary: "Upload internship-specific resume (PDF, multipart)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InternshipIdParam" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["resume"],
                properties: { resume: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 200: { description: "OK (returns resumeId)" }, 400: { description: "No file/invalid file" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/applied-jobs": {
      get: {
        tags: ["Applicant"],
        summary: "Get applied jobs",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/applied-internships": {
      get: {
        tags: ["Applicant"],
        summary: "Get applied internships",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/logo/{logoId}": {
      get: {
        tags: ["Applicant"],
        summary: "Proxy recruiter company logo by id",
        parameters: [{ $ref: "#/components/parameters/LogoIdParam" }],
        responses: { 200: { description: "Image stream" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/applicant/dashboard/stats": {
      get: {
        tags: ["Applicant"],
        summary: "Dashboard stats for current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },

    // Profile
    "/api/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get current profile",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
      put: {
        tags: ["Profile"],
        summary: "Update current profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProfileUpdateRequest" } } },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Validation error" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
      delete: {
        tags: ["Profile"],
        summary: "Delete current profile",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/profile/resume": {
      post: {
        tags: ["Profile"],
        summary: "Upload default resume (PDF, multipart)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["resume"],
                properties: { resume: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 400: { description: "No file/invalid file" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
      get: {
        tags: ["Profile"],
        summary: "Get default resume (PDF stream)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "PDF stream" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
      delete: {
        tags: ["Profile"],
        summary: "Delete default resume",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/profile/image": {
      post: {
        tags: ["Profile"],
        summary: "Upload profile image (multipart)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["profileImage"],
                properties: { profileImage: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 400: { description: "No file/invalid file" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
      get: {
        tags: ["Profile"],
        summary: "Get profile image (image stream)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Image stream" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
      delete: {
        tags: ["Profile"],
        summary: "Delete profile image",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },

    // Payment
    "/api/payment/create-payment-intent": {
      post: {
        tags: ["Payment"],
        summary: "Create Stripe payment intent",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PaymentIntentRequest" } } },
        },
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/payment/payment": {
      get: {
        tags: ["Payment"],
        summary: "Get payment page (API placeholder)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/payment/process-payment": {
      post: {
        tags: ["Payment"],
        summary: "Process payment (expects succeeded intent id)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProcessPaymentRequest" } } },
        },
        responses: { 200: { description: "OK" }, 400: { description: "Bad request / already premium / not succeeded" }, 401: { description: "Unauthorized" }, 404: { description: "User not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/payment/receipt": {
      get: {
        tags: ["Payment"],
        summary: "Get latest receipt for current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/payment/subscription": {
      get: {
        tags: ["Payment"],
        summary: "Get subscription status",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/payment/terms": {
      get: {
        tags: ["Payment"],
        summary: "Get terms text",
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
    "/api/payment/privacy": {
      get: {
        tags: ["Payment"],
        summary: "Get privacy text",
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },

    // Files
    "/api/files/resume": {
      get: {
        tags: ["Files"],
        summary: "Download resume (PDF stream)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "PDF stream" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },
    "/api/files/profile-image": {
      get: {
        tags: ["Files"],
        summary: "Download profile image (image stream)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Image stream" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" }, 500: { description: "Server error" } },
      },
    },

    // Upload
    "/api/upload/resume": {
      post: {
        tags: ["Upload"],
        summary: "Upload resume (PDF, multipart)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["resume"],
                properties: { resume: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 400: { description: "No file/invalid file" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },
    "/api/upload/profile-image": {
      post: {
        tags: ["Upload"],
        summary: "Upload profile image (multipart)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["profileImage"],
                properties: { profileImage: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 400: { description: "No file/invalid file" }, 401: { description: "Unauthorized" }, 500: { description: "Server error" } },
      },
    },

    // Search
    "/api/search": {
      post: {
        tags: ["Search"],
        summary: "Search jobs and internships",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SearchRequest" } } },
        },
        responses: { 200: { description: "OK" }, 500: { description: "Server error" } },
      },
    },
  },
};

module.exports = spec;

