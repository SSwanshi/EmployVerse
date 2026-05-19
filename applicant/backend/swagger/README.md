## Applicant Swagger (OpenAPI)

This folder is intentionally **separate** from `backend/` and `frontend/`.

### What you get

- **Swagger UI**: `GET /api/docs`
- **OpenAPI JSON**: `GET /api/docs.json`

### How to use for API testing

1. Start the applicant backend.
2. Open `http://localhost:3000/api/docs`
3. Login via `POST /api/auth/login`
4. Copy the `token`, then click **Authorize** and paste:

`Bearer <token>`

Now you can use **Try it out** for all secured endpoints.

