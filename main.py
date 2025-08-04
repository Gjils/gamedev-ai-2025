import json
import subprocess
import os
from time import sleep
from dotenv import load_dotenv

from generate import generate_rpg_quest
from process import GameValidator

script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv()
def generate_quest_with_validation(quest_name, user_prompt, system_prompt, credentials, max_retries=3):
    """
    Генерирует и и обрабатывает квест через process.py, который:
    1. Читает text_output/{quest_name}.txt
    2. Конвертирует в JSON
    3. Сохраняет в generated_quests/{quest_name}.json
    4. Выполняет валидацию

    При ошибках в stderr перезапускает генерацию квеста (до max_retries раз)
    """

    validator = GameValidator()
    retry_count = 0

    while retry_count < max_retries:
        try:
            print(f"Генерируем квест: {quest_name}")
            quest = generate_rpg_quest(user_prompt=user_prompt, system_prompt=system_prompt, credentials=credentials)

            print(f"Обрабатываем квест: {quest_name} (попытка {retry_count + 1}/{max_retries})")

            success, message = validator.validate_data(quest)

            # Выводим результат
            if success:
                print(f"✅ Квест {quest_name} успешно обработан и валидирован!")
                return quest, ""

            print("Ошибки валидации:")
            print(message)

            retry_count += 1
            if retry_count < max_retries:
                print(f"\n⚠️ Обнаружены ошибки, перегенерируем квест (попытка {retry_count + 1}/{max_retries})")

                quest = generate_rpg_quest(user_prompt=user_prompt, system_prompt=system_prompt, credentials=credentials)

                print("Квест перегенерирован, повторяем обработку...")
                sleep(1)
                continue

        except Exception as e:
            print(f"Критическая ошибка: {e}")
            return None, str(e)

    print(f"❌ Достигнуто максимальное количество попыток ({max_retries})")
    return None, "max_retries_exceeded"

# Обрабатываем example-3
if __name__ == "__main__":
    quest_name = "example-3"
    max_retries = 3  # Максимальное количество попыток перегенерации
    credentials = os.getenv("GIGACHAT_CREDENTIALS")  # Ваши учетные данные GigaChat
    user_prompt_path = os.path.join(script_dir, "input", "example-3.txt")  # Путь к файлу с промптом
    system_prompt_path = os.path.join(script_dir, "system_prompt.txt")
    gen_quests_path = os.path.join(script_dir, "generated_quests")
    print(f"Запускаем генерацию квеста: {quest_name}")
    print("=" * 50)

    with open(user_prompt_path, "r", encoding="utf-8") as f:
        user_prompt = f.read()

    with open(system_prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()

    quest, errors = generate_quest_with_validation(
        quest_name=quest_name,
        max_retries=max_retries,
        credentials=credentials,
        user_prompt=user_prompt,
        system_prompt=system_prompt
    )

    if errors == "":
        print("\n🎉 Обработка завершена успешно!")
        output_file = os.path.join(gen_quests_path, f"{quest_name}.json")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(quest, ensure_ascii=False, indent=4))
        print(f"Квест {quest_name} готов к использованию в {output_file}")
    else:
        print("\n❌ Обработка завершилась с ошибками")
        print("Проверьте логи выше для диагностики проблем")
