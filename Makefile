.PHONY: backend frontend lint fmt test

backend:
cd backend && uvicorn app.main:app --reload

frontend:
cd frontend && npm run dev

test:
cd backend && pytest

lint:
cd frontend && npm run lint
