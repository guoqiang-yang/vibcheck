.PHONY: dev stop build

dev:
	@echo "Starting backend (port 8000) and frontend (port 3000)..."
	@cd backend && APP_ENV=dev uvicorn app.main:app --host 0.0.0.0 --port 8000 &
	@cd frontend && npm run dev &
	@echo "Ready → http://localhost:3000"
	@wait

stop:
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@echo "Stopped."

build:
	@echo "Building frontend..."
	@cd frontend && npm run build
	@echo "Build complete → frontend/dist/"
