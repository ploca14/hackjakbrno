# hackjakbrno

## Backend

The backend is a FastAPI application located in the `back/` directory.

### Prerequisites

- [uv](https://docs.astral.sh/uv/) package manager

### Starting the Development Server

```bash
cd back
uv run fastapi dev main.py
```

The server will start at `http://localhost:8000` with auto-reload enabled for local development.

### API Endpoints

- `GET /` - Returns a Hello World message
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)
