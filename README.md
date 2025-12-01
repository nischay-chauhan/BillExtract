# Receipt Scanner Backend

## Setup

### Local Development

1. Create virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. Run the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Docker Deployment

1. Copy environment file:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

2. Start services:
```bash
docker-compose up -d
```

3. Stop services:
```bash
docker-compose down
```

## API Endpoints

### Receipts
- `POST /receipts/upload_receipt` - Upload and process receipt image
- `GET /receipts/receipt/{id}` - Get single receipt by ID
- `GET /receipts/receipts?page=1&limit=10` - Get paginated receipts list

### Analytics
- `GET /analytics/monthly` - Monthly spending totals
- `GET /analytics/category` - Category-wise spending totals

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).
