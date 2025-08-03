# Game Quest Backend

Простой backend для работы с квестами игры.

## Установка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

## Запуск

```bash
python main.py
```

Сервер будет доступен по адресу: http://localhost:8000

## API Endpoints

### GET /
Проверка работоспособности API

### GET /get_quest_data/{quest_name}
Получает данные квеста и позиции узлов.
- Ищет файл `{quest_name}.json` в папке `generated_quests`
- Проверяет наличие файла позиций в папке `node_positions`
- Если позиций нет, автоматически создаёт их с помощью скрипта `get_node_positions.py`
- Возвращает объединённые данные квеста и позиций

Пример: `GET /get_quest_data/example-2`

### GET /list_quests
Возвращает список всех доступных квестов

## Примеры использования

```bash
# Проверка работы API
curl http://localhost:8000/

# Получение данных квеста
curl http://localhost:8000/get_quest_data/example-2

# Список квестов
curl http://localhost:8000/list_quests
```
