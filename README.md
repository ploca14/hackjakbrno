# hackjakbrno

<<<<<<< HEAD
### Running backend
Haven't tried it, but ChatGPT told made me do it
 - pip install -r requirements.txt
 - uvicorn app.main:app --reload
=======
## Quick Start

Download data:

```bash
uv run --with pandas,openpyxl,gdown,py7zr python load_data.py
```

Start everything:

```bash
./start.sh
```

Press `Ctrl+C` to stop all services.

## Manual Setup

### Database (IRIS)

Start the IRIS database with FHIR server:

```bash
cd docker
docker-compose up -d
```

Access:
- Management Portal: http://localhost:32783/csp/sys/UtilHome.csp (username: `_SYSTEM`, password: `ISCDEMO`)
- FHIR API: http://localhost:32783/csp/healthshare/demo/fhir/r4

### Backend

Start the FastAPI server:

```bash
cd back
uv run fastapi dev
```

Server runs at `http://localhost:8000`
>>>>>>> main
