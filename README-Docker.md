# Docker Setup для GameDev AI

## Быстрый запуск

Для запуска всего проекта в Docker:

```bash
# Сборка и запуск
docker-compose up --build

# Запуск в фоне
docker-compose up -d --build

# Остановка
docker-compose down
```

## Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Структура

### Backend (Python FastAPI)
- Запускается на порту 8000
- Включает все необходимые модули: main.py, generate.py, process.py, get_node_positions.py
- Папки `node_positions` и `generated_quests` монтируются как volumes

### Frontend (SolidJS)
- Запускается на порту 3000
- Собирается с помощью Vite
- Обслуживается через `serve`

## Development

Для разработки можно раскомментировать строки в docker-compose.yml для монтирования исходников:

```yaml
volumes:
  - ./main.py:/app/main.py
  - ./generate.py:/app/generate.py
  - ./process.py:/app/process.py
  - ./get_node_positions.py:/app/get_node_positions.py
  - ./ui-backend/backend.py:/app/ui-backend/backend.py
```

## Команды Docker

```bash
# Пересборка только backend
docker-compose build backend

# Пересборка только frontend  
docker-compose build frontend

# Просмотр логов
docker-compose logs backend
docker-compose logs frontend

# Вход в контейнер
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Требования

- Docker
- Docker Compose
- Файлы `requirements-docker.txt` в корневой директории
- Файл `system_prompt.txt` в корневой директории
