#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import os
import argparse
from typing import Dict, List, Optional, Tuple, Any


class GameValidator:
    """Класс для валидации игровых сценариев."""
    
    def __init__(self):
        self.scenes = {}
        self.graph = {}
        
    def validate_data(self, data: Dict) -> Tuple[bool, str]:
        """
        Поэтапно проверяет данные игровых сценариев.
        
        Args:
            data: Словарь с данными игры
            
        Returns:
            Tuple[bool, str]: (успех, сообщение)
        """
        # Проверяем базовую структуру
        if not isinstance(data, dict) or 'scenes' not in data:
            return False, "Данные не содержат поле 'scenes'"
            
        scenes = data['scenes']
        if not isinstance(scenes, list):
            return False, "Поле 'scenes' должно быть массивом"
            
        # Этап 2: Проверка количества сцен (минимум 5)
        if len(scenes) < 5:
            return False, f"Недостаточно сцен. Найдено {len(scenes)}, требуется минимум 5"
            
        # Строим граф сцен для дальнейшего анализа
        self.scenes = {}
        self.graph = {}
        
        for scene in scenes:
            if not isinstance(scene, dict):
                return False, "Сцена должна быть объектом"
                
            # Проверяем обязательные поля сцены
            if 'scene_id' not in scene:
                return False, "У сцены отсутствует поле 'scene_id'"
                
            if 'text' not in scene:
                return False, f"У сцены '{scene.get('scene_id', 'unknown')}' отсутствует поле 'text'"
                
            if 'choices' not in scene:
                return False, f"У сцены '{scene['scene_id']}' отсутствует поле 'choices'"
                
            choices = scene['choices']
            if not isinstance(choices, list):
                return False, f"У сцены '{scene['scene_id']}' поле 'choices' должно быть массивом"
                
            scene_id = scene['scene_id']
            self.scenes[scene_id] = scene
            self.graph[scene_id] = []
            
            # Проверяем обязательные поля каждого выбора
            for i, choice in enumerate(choices):
                if not isinstance(choice, dict):
                    return False, f"У сцены '{scene_id}' выбор #{i+1} должен быть объектом"
                    
                if 'text' not in choice:
                    return False, f"У сцены '{scene_id}' в выборе #{i+1} отсутствует поле 'text'"
                    
                if 'next_scene' not in choice:
                    return False, f"У сцены '{scene_id}' в выборе #{i+1} отсутствует поле 'next_scene'"
                    
                self.graph[scene_id].append(choice['next_scene'])
                    
        # Этап 3: Проверка корректности ссылок (все next_scene должны существовать)
        invalid_refs = self._check_scene_references()
        if invalid_refs:
            invalid_list = ', '.join([f"'{ref}'" for ref in invalid_refs[:5]])  # Показываем первые 5
            more_text = f" и еще {len(invalid_refs) - 5}" if len(invalid_refs) > 5 else ""
            return False, f"Найдены ссылки на несуществующие сцены: {invalid_list}{more_text}"
            
        # Этап 4: Проверка наличия развилки (хотя бы одна сцена с 2+ выборами)
        has_branch = False
        for scene_id, scene in self.scenes.items():
            choices = scene.get('choices', [])
            if len(choices) >= 2:
                has_branch = True
                break
                
        if not has_branch:
            return False, "Не найдено ни одной развилки (сцены с 2+ выборами)"
            
        # Этап 5: Проверка глубины веток (минимум одна ветка глубиной 3+ сцены)
        if not self._check_branch_depth():
            return False, "Нет ветки глубиной минимум 3 сцены"
            
        return True, "Все проверки пройдены успешно"
        
    def validate_file(self, filename: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        Поэтапно проверяет файл с игровыми сценариями.
        
        Args:
            filename: Путь к файлу для проверки
            
        Returns:
            Tuple[bool, str, Optional[Dict]]: (успех, сообщение, данные)
        """
        # Этап 1: Проверка валидности JSON
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            return False, "Ошибка: Файл не найден", None
        except json.JSONDecodeError as e:
            return False, f"Файл не является валидным JSON. Ошибка: {e}", None
        except Exception as e:
            return False, f"Ошибка чтения файла: {e}", None
            
        # Валидируем данные
        success, message = self.validate_data(data)
        
        if success:
            return True, message, data
        else:
            return False, message, None
        
    def _check_scene_references(self) -> List[str]:
        """
        Проверяет, что все next_scene в choices ссылаются на существующие сцены.
        
        Returns:
            List[str]: Список несуществующих scene_id
        """
        invalid_refs = set()
        
        for scene_id, scene in self.scenes.items():
            choices = scene.get('choices', [])
            for choice in choices:
                if isinstance(choice, dict) and 'next_scene' in choice:
                    next_scene = choice['next_scene']
                    if next_scene not in self.scenes:
                        invalid_refs.add(next_scene)
                        
        return list(invalid_refs)
        
    def _check_branch_depth(self) -> bool:
        """
        Проверяет наличие ветки глубиной минимум 3 сцены.
        
        Returns:
            bool: True если найдена подходящая ветка
        """
        start_scene = 'start'
        if start_scene not in self.scenes:
            # Ищем любую стартовую сцену
            start_scene = next(iter(self.scenes.keys()), None)
            if not start_scene:
                return False
                
        visited_paths = []
        
        def dfs(current: str, path: List[str], visited: set) -> None:
            """Обход в глубину для поиска всех путей."""
            if current in visited:
                return
                
            new_path = path + [current]
            new_visited = visited.copy()
            new_visited.add(current)
            
            next_scenes = self.graph.get(current, [])
            
            if not next_scenes:  # Конечная сцена
                visited_paths.append(new_path)
            else:
                for next_scene in next_scenes:
                    if next_scene in self.scenes:  # Проверяем, что сцена существует
                        dfs(next_scene, new_path, new_visited)
                        
        dfs(start_scene, [], set())
        
        # Проверяем, есть ли пути длиной 3+ сцены
        for path in visited_paths:
            if len(path) >= 3:
                return True
                
        return False
        
    def find_all_paths(self, start: str = 'start') -> List[List[str]]:
        """
        Находит все возможные пути в игре.
        
        Args:
            start: Стартовая сцена
            
        Returns:
            List[List[str]]: Список всех путей
        """
        if start not in self.scenes:
            start = next(iter(self.scenes.keys()), None)
            if not start:
                return []
                
        all_paths = []
        
        def dfs(current: str, path: List[str], visited: set) -> None:
            if current in visited:
                return
                
            new_path = path + [current]
            new_visited = visited.copy()
            new_visited.add(current)
            
            next_scenes = self.graph.get(current, [])
            
            if not next_scenes:
                all_paths.append(new_path)
            else:
                for next_scene in next_scenes:
                    if next_scene in self.scenes:
                        dfs(next_scene, new_path, new_visited)
                        
        dfs(start, [], set())
        return all_paths


def process_text_to_json(text_content: str) -> Optional[Dict]:
    """
    Обрабатывает текстовый контент и извлекает JSON.
    
    Args:
        text_content: Текстовое содержимое файла
        
    Returns:
        Optional[Dict]: Извлеченные JSON данные или None
    """
    try:
        # Пытаемся парсить как чистый JSON
        data = json.loads(text_content)
        return data
    except json.JSONDecodeError:
        # Ищем JSON в тексте (между фигурными скобками)
        start_idx = text_content.find('{')
        end_idx = text_content.rfind('}')
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            json_content = text_content[start_idx:end_idx+1]
            try:
                data = json.loads(json_content)
                return data
            except json.JSONDecodeError:
                pass
                
        # Если не нашли валидный JSON
        return None


def main():
    """Главная функция программы."""
    parser = argparse.ArgumentParser(
        description='Валидация и конвертация файлов с игровыми сценариями'
    )
    parser.add_argument(
        'input_file',
        help='Путь к входному файлу (txt/json)'
    )
    parser.add_argument(
        '-o', '--output',
        help='Путь к выходному JSON файлу (по умолчанию: имя входного файла с расширением .json)'
    )
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Подробный вывод с анализом структуры'
    )
    
    args = parser.parse_args()
    
    # Проверяем существование входного файла
    if not os.path.exists(args.input_file):
        print(f"Ошибка: Файл '{args.input_file}' не найден!")
        sys.exit(1)
        
    # Валидируем файл
    validator = GameValidator()
    success, message, data = validator.validate_file(args.input_file)
    
    print(f"Результат валидации: {message}")
    
    if not success:
        sys.exit(1)
        
    # Определяем имя выходного файла
    if args.output:
        output_file = args.output
    else:
        base_name = os.path.splitext(args.input_file)[0]
        output_file = f"{base_name}.json"
        
    # Сохраняем JSON файл
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"JSON файл сохранен: {output_file}")
    except Exception as e:
        print(f"Ошибка сохранения файла: {e}")
        sys.exit(1)
        
    # Подробная информация если запрошена
    if args.verbose:
        scenes = data['scenes']
        print(f"\nПодробная информация:")
        print(f"• Всего сцен: {len(scenes)}")
        
        # Подсчитываем развилки
        branches = 0
        for scene in scenes:
            choices = scene.get('choices', [])
            if len(choices) >= 2:
                branches += 1
                
        print(f"• Количество развилок: {branches}")
        
        # Анализируем пути
        paths = validator.find_all_paths()
        if paths:
            max_depth = max(len(path) for path in paths)
            min_depth = min(len(path) for path in paths)
            print(f"• Максимальная глубина пути: {max_depth} сцен")
            print(f"• Минимальная глубина пути: {min_depth} сцен")
            print(f"• Общее количество возможных путей: {len(paths)}")
            
            if args.verbose:
                print(f"\nВсе возможные пути:")
                for i, path in enumerate(paths, 1):
                    print(f"  {i}. {' → '.join(path)} ({len(path)} сцен)")


if __name__ == "__main__":
    main()
