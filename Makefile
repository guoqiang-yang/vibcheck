.PHONY: dev stop build logs

dev:
	@echo "Starting backend (port 8000), frontend (port 3000), and admin web (port 3100)..."
	@mkdir -p logs
	@cd backend && nohup env APP_ENV=dev uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
	@cd frontend && nohup npm run dev > ../logs/frontend.log 2>&1 &
	@cd admin-web && nohup npm run dev > ../logs/admin-web.log 2>&1 &
	@echo "Ready → http://localhost:3000"
	@echo "Admin → http://localhost:3100"
	@echo "Backend log  → logs/backend.log"
	@echo "Frontend log → logs/frontend.log"
	@echo "Admin log    → logs/admin-web.log"
	@echo "Use 'make logs' to follow logs, and 'make stop' to stop services."

logs:
	@tail -f logs/backend.log logs/frontend.log logs/admin-web.log

stop:
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3100 | xargs kill -9 2>/dev/null || true
	@echo "Stopped."

build:
	@echo "Building frontend..."
	@cd frontend && npm run build
	@echo "Build complete → frontend/dist/"
