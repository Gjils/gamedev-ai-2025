import json
import os
import sys
import subprocess
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Game Quest Backend", version="1.0.0")

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Путь к корневой директории проекта
PROJECT_ROOT = Path(__file__).parent.parent
GENERATED_QUESTS_DIR = PROJECT_ROOT / "generated_quests"
NODE_POSITIONS_DIR = PROJECT_ROOT / "node_positions"
GET_NODE_POSITIONS_SCRIPT = PROJECT_ROOT / "get_node_positions.py"

def ensure_node_positions_exist(quest_name: str) -> bool:
    """Проверяет существование файла позиций узлов и создаёт его при необходимости"""
    positions_file = NODE_POSITIONS_DIR / f"{quest_name}.json"
    
    if positions_file.exists():
        return True
    
    # Создаём директорию для позиций если её нет
    NODE_POSITIONS_DIR.mkdir(exist_ok=True)
    
    try:
        # Запускаем скрипт генерации позиций
        result = subprocess.run([
            sys.executable, 
            str(GET_NODE_POSITIONS_SCRIPT), 
            f"{quest_name}.json"
        ], 
        cwd=PROJECT_ROOT,
        capture_output=True, 
        text=True
        )
        
        if result.returncode == 0:
            print(f"Успешно создан файл позиций для {quest_name}")
            return True
        else:
            print(f"Ошибка при создании позиций: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Ошибка при запуске скрипта генерации позиций: {e}")
        return False

@app.get("/")
async def root():
    """Проверка работоспособности API"""
    return {"message": "Game Quest Backend is running"}

@app.get("/get_quest_data/{quest_name}")
async def get_quest_data(quest_name: str):
    """
    Получает данные квеста и позиции узлов.
    Если позиции не существуют, создаёт их автоматически.
    """
    # Проверяем существование файла квеста
    quest_file = GENERATED_QUESTS_DIR / f"{quest_name}.json"
    
    if not quest_file.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"Quest file '{quest_name}.json' not found in generated_quests directory"
        )
    
    # Загружаем данные квеста
    try:
        with open(quest_file, 'r', encoding='utf-8') as f:
            quest_data = json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error reading quest file: {str(e)}"
        )
    
    # Проверяем/создаём позиции узлов
    if not ensure_node_positions_exist(quest_name):
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate node positions for quest '{quest_name}'"
        )
    
    # Загружаем позиции узлов
    positions_file = NODE_POSITIONS_DIR / f"{quest_name}.json"
    try:
        with open(positions_file, 'r', encoding='utf-8') as f:
            node_positions = json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error reading node positions file: {str(e)}"
        )
    
    return {
        "quest_name": quest_name,
        "quest_data": quest_data,
        "node_positions": node_positions
    }

@app.get("/list_quests")
async def list_quests():
    """Возвращает список доступных квестов"""
    try:
        quest_files = list(GENERATED_QUESTS_DIR.glob("*.json"))
        quest_names = [f.stem for f in quest_files]
        return {"quests": quest_names}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error listing quests: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
