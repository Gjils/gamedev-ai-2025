from langchain_community.chat_models.gigachat import GigaChat
from httpx import ReadTimeout

import json

# функция для генерации квеста
def generate_rpg_quest(user_prompt, system_prompt, credentials):
    try:
        giga = GigaChat(
            credentials=credentials,
            verify_ssl_certs=False,
            timeout=360,
            model="GigaChat-2-Max"
        )

        full_prompt = f"""{system_prompt}\n\nВходные данные:\n{user_prompt}\n\nВывод только в JSON!Требования к выводу:
        1. ТОЛЬКО JSON без каких-либо других текстов
        2. Обязательное наличие поля "scenes"
        3. Строго соответствовать шаблону
        """
        response = giga.invoke(full_prompt)

        response_text = response.content 

        # Извлекаем чистый JSON
        start = response_text.find('{"scenes": [')
        if start < 0:
            return {}
        end = response_text.rfind(']}') + 2
        json_str = response_text[start:end]

        return json.loads(json_str)
        
    except ReadTimeout:
        print("Ошибка: превышено время ожидания ответа от GigaChat.")
        return {"error": "timeout"}
    except Exception as e:
        print(f"Критическая ошибка: {str(e)}")
        return {"error": str(e)}
