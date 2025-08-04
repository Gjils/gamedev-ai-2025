import json
import os
import sys
import subprocess
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Добавляем корневую папку в sys.path для импорта модулей
sys.path.insert(0, str(Path(__file__).parent.parent))

# Импортируем функцию из нашего main.py
import importlib.util
spec = importlib.util.spec_from_file_location("main_module", Path(__file__).parent.parent / "main.py")
main_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(main_module)
generate_quest_with_validation = main_module.generate_quest_with_validation

app = FastAPI(title="Game Quest Backend", version="1.0.0")

# Модель для запроса генерации квеста
class GenerateQuestRequest(BaseModel):
    quest_name: str
    user_prompt: str

# Модель для обновления квеста
class UpdateQuestRequest(BaseModel):
    quest_name: str
    quest_data: dict
    node_positions: list

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

@app.post("/generate_quest")
async def generate_quest(request: GenerateQuestRequest):
    """
    Генерирует новый квест на основе пользовательского промпта.
    Сохраняет его в generated_quests и возвращает название файла.
    """
    try:
        # Читаем системный промпт
        system_prompt_path = PROJECT_ROOT / "system_prompt.txt"
        if not system_prompt_path.exists():
            raise HTTPException(
                status_code=500,
                detail="System prompt file not found"
            )
        
        with open(system_prompt_path, "r", encoding="utf-8") as f:
            system_prompt = f.read()
        
        # Учетные данные для GigaChat (из main.py)
        credentials = "NDE3MGE0OWItOTg2MS00ZDQ3LWJkMjktYzQ5YjNkMzkxMmQyOmVlN2NhNTk1LTYwZTEtNDA0YS1iZWM3LTQ3YmRkM2U5YTBiMQ=="
        
        # Создаём директорию для квестов если её нет
        GENERATED_QUESTS_DIR.mkdir(exist_ok=True)
        
        print(f"Начинаем генерацию квеста: {request.quest_name}")
        
        # Генерируем квест с валидацией
        quest_data, errors = generate_quest_with_validation(
            quest_name=request.quest_name,
            user_prompt=request.user_prompt,
            system_prompt=system_prompt,
            credentials=credentials,
            max_retries=3
        )
        
        if errors and errors != "":
            raise HTTPException(
                status_code=400,
                detail=f"Quest generation failed: {errors}"
            )
        
        if quest_data is None:
            raise HTTPException(
                status_code=500,
                detail="Quest generation failed: No data returned"
            )
        
        # Сохраняем квест в файл
        quest_file_path = GENERATED_QUESTS_DIR / f"{request.quest_name}.json"
        with open(quest_file_path, "w", encoding="utf-8") as f:
            json.dump(quest_data, f, ensure_ascii=False, indent=4)
        
        print(f"Квест {request.quest_name} успешно сохранён в {quest_file_path}")
        
        return {
            "message": "Quest generated successfully",
            "quest_name": request.quest_name,
            "filename": f"{request.quest_name}.json",
            "file_path": str(quest_file_path)
        }
        
    except HTTPException:
        # Перебрасываем HTTP исключения как есть
        raise
    except Exception as e:
        print(f"Ошибка при генерации квеста: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.put("/update_quest")
async def update_quest(request: UpdateQuestRequest):
    """
    Обновляет данные квеста и позиции узлов.
    Перезаписывает JSON файлы в соответствующих папках.
    """
    try:
        # Создаём директории если их нет
        GENERATED_QUESTS_DIR.mkdir(exist_ok=True)
        NODE_POSITIONS_DIR.mkdir(exist_ok=True)
        
        # Сохраняем данные квеста
        quest_file_path = GENERATED_QUESTS_DIR / f"{request.quest_name}.json"
        with open(quest_file_path, "w", encoding="utf-8") as f:
            json.dump(request.quest_data, f, ensure_ascii=False, indent=4)
        
        # Сохраняем позиции узлов
        positions_file_path = NODE_POSITIONS_DIR / f"{request.quest_name}.json"
        with open(positions_file_path, "w", encoding="utf-8") as f:
            json.dump(request.node_positions, f, ensure_ascii=False, indent=4)
        
        print(f"Квест {request.quest_name} успешно обновлён")
        
        return {
            "message": "Quest updated successfully",
            "quest_name": request.quest_name,
            "quest_file": str(quest_file_path),
            "positions_file": str(positions_file_path)
        }
        
    except Exception as e:
        print(f"Ошибка при обновлении квеста: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update quest: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
