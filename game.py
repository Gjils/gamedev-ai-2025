#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import os
from typing import Dict, List, Optional
import time

# Для работы с клавишами в Unix/Linux/Mac
INTERACTIVE_MODE = False
try:
    import termios
    import tty
    import select
    # Проверяем, что функции доступны
    if hasattr(tty, 'setcbreak') and hasattr(termios, 'tcgetattr'):
        INTERACTIVE_MODE = True
except ImportError:
    pass


def clear_screen():
    """Очищает экран."""
    os.system('cls' if os.name == 'nt' else 'clear')


def get_char():
    """Получает одиночный символ без нажатия Enter (только для Unix/Linux/Mac)."""
    if not INTERACTIVE_MODE:
        return input()
    
    try:
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setcbreak(fd)
            ch = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return ch
    except (AttributeError, OSError, termios.error):
        # Если что-то пошло не так, используем обычный ввод
        print("(Переключение в обычный режим)")
        return input()


class TextAdventureGame:
    """Консольная текстовая игра на основе JSON файла со сценариями."""
    
    def __init__(self, filename: str):
        """
        Инициализация игры.
        
        Args:
            filename: Путь к JSON файлу с игровыми сценариями
        """
        self.filename = filename
        self.scenes: Dict = {}
        self.current_scene: str = "start"
        self.game_history: List[str] = []
        self.selected_choice = 0  # Для интерактивного выбора
        
    def load_game_data(self) -> bool:
        """
        Загружает данные игры из JSON файла.
        
        Returns:
            True если загрузка успешна, False иначе
        """
        try:
            if not os.path.exists(self.filename):
                print(f"Ошибка: Файл '{self.filename}' не найден!")
                return False
                
            with open(self.filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if 'scenes' not in data:
                print("Ошибка: В файле отсутствует поле 'scenes'!")
                return False
                
            # Создаём словарь сценариев для быстрого доступа
            for scene in data['scenes']:
                if 'scene_id' not in scene:
                    print("Ошибка: Найден сценарий без поля 'scene_id'!")
                    return False
                self.scenes[scene['scene_id']] = scene
                
            if 'start' not in self.scenes:
                print("Ошибка: Не найден стартовый сценарий с id 'start'!")
                return False
                
            print(f"Игровые данные загружены из '{self.filename}'")
            print(f"Загружено сценариев: {len(self.scenes)}")
            return True
            
        except json.JSONDecodeError as e:
            print(f"Ошибка парсинга JSON: {e}")
            return False
        except Exception as e:
            print(f"Неожиданная ошибка при загрузке: {e}")
            return False
    
    def display_scene(self, scene_id: str, interactive: bool = True) -> bool:
        """
        Отображает текущий сценарий и доступные выборы.
        
        Args:
            scene_id: ID сценария для отображения
            interactive: Использовать интерактивный режим или обычный
            
        Returns:
            True если сценарий найден, False иначе
        """
        if scene_id not in self.scenes:
            print(f"Ошибка: Сценарий '{scene_id}' не найден!")
            return False
            
        scene = self.scenes[scene_id]
        
        # Очищаем экран для интерактивного режима
        if interactive and INTERACTIVE_MODE:
            clear_screen()
        else:
            print("\n" + "="*80)
        
        # Отображаем текст сценария
        print(scene.get('text', 'Описание сценария отсутствует.'))
        print("-" * 80)
        
        # Отображаем доступные выборы
        choices = scene.get('choices', [])
        
        if not choices:
            print("КОНЕЦ ИГРЫ!")
            print("\nСпасибо за игру! Хотите начать заново? (y/n)")
            return False
            
        if interactive and INTERACTIVE_MODE:
            print("\nДоступные действия (используйте ↑↓ для выбора, Enter для подтверждения):")
        else:
            print("\nДоступные действия:")
            
        for i, choice in enumerate(choices):
            if interactive and INTERACTIVE_MODE and i == self.selected_choice:
                print(f"→ {i+1}. {choice.get('text', 'Неизвестное действие')}")
            else:
                print(f"  {i+1}. {choice.get('text', 'Неизвестное действие')}")
            
        return True
    
    def get_user_choice_interactive(self, max_choices: int) -> Optional[int]:
        """
        Получает выбор пользователя в интерактивном режиме.
        
        Args:
            max_choices: Максимальное количество доступных выборов
            
        Returns:
            Номер выбора (1-indexed) или None при выходе
        """
        global INTERACTIVE_MODE
        self.selected_choice = 0
        
        while True:
            try:
                # Перерисовываем экран с текущим выбором
                self.display_scene(self.current_scene, interactive=True)
                
                if INTERACTIVE_MODE:
                    print(f"\nТекущий выбор: {self.selected_choice + 1}")
                    print("Управление: ↑/↓ - навигация, Enter - выбор, q - выход, h - история")
                    
                    char = get_char()
                    
                    if char == '\x1b':  # ESC последовательность
                        char = get_char()
                        if char == '[':
                            char = get_char()
                            if char == 'A':  # Стрелка вверх
                                self.selected_choice = (self.selected_choice - 1) % max_choices
                            elif char == 'B':  # Стрелка вниз
                                self.selected_choice = (self.selected_choice + 1) % max_choices
                    elif char == '\r' or char == '\n':  # Enter
                        return self.selected_choice + 1
                    elif char.lower() == 'q':
                        return None
                    elif char.lower() == 'h':
                        clear_screen()
                        self.show_history()
                        print("\nНажмите любую клавишу для продолжения...")
                        get_char()
                else:
                    # Fallback для систем без интерактивного режима
                    return self.get_user_choice_simple(max_choices)
                        
            except (KeyboardInterrupt, EOFError):
                return None
            except Exception as e:
                # При любой ошибке переключаемся в обычный режим
                print(f"\nОшибка интерактивного режима: {e}")
                print("Переключение в обычный режим...")
                INTERACTIVE_MODE = False
                return self.get_user_choice_simple(max_choices)

    def get_user_choice(self, max_choices: int) -> Optional[int]:
        """
        Получает выбор пользователя (интерактивный или обычный режим).
        
        Args:
            max_choices: Максимальное количество доступных выборов
            
        Returns:
            Номер выбора (1-indexed) или None при ошибке
        """
        if INTERACTIVE_MODE:
            return self.get_user_choice_interactive(max_choices)
        else:
            return self.get_user_choice_simple(max_choices)
    
    def get_user_choice_simple(self, max_choices: int) -> Optional[int]:
        """
        Получает выбор пользователя.
        
        Args:
            max_choices: Максимальное количество доступных выборов
            
        Returns:
            Номер выбора (1-indexed) или None при ошибке
        """
        while True:
            try:
                print(f"\n> ", end="")
                user_input = input().strip().lower()
                
                if user_input in ['quit', 'exit', 'q']:
                    return None
                    
                if user_input == 'history':
                    self.show_history()
                    continue
                    
                choice_num = int(user_input)
                
                if 1 <= choice_num <= max_choices:
                    return choice_num
                else:
                    print(f"Пожалуйста, введите число от 1 до {max_choices}")
                    
            except ValueError:
                print("Пожалуйста, введите корректное число")
            except KeyboardInterrupt:
                print("\n\nДо свидания!")
                return None
    
    def show_history(self):
        """Показывает историю посещённых сценариев."""
        if not self.game_history:
            print("История пуста - вы только начали игру!")
            return
            
        print("\nИстория вашего путешествия:")
        for i, scene_id in enumerate(self.game_history, 1):
            scene_name = self.scenes.get(scene_id, {}).get('scene_id', scene_id)
            print(f"  {i}. {scene_name}")
        print()
    
    def show_game_stats(self):
        """Показывает статистику игры."""
        total_scenes = len(self.scenes)
        visited_scenes = len(set(self.game_history))
        completion_rate = (visited_scenes / total_scenes * 100) if total_scenes > 0 else 0
        
        print(f"\nСтатистика игры:")
        print(f"   • Всего сценариев в игре: {total_scenes}")
        print(f"   • Посещено уникальных сценариев: {visited_scenes}")
        print(f"   • Процент исследования: {completion_rate:.1f}%")
        print(f"   • Общее количество ходов: {len(self.game_history)}")
    
    def play(self):
        """Основной игровой цикл."""
        mode_text = "интерактивном" if INTERACTIVE_MODE else "обычном"
        print(f"Добро пожаловать в текстовую приключенческую игру! (режим: {mode_text})")
        
        if not INTERACTIVE_MODE:
            print("Подсказка: введите 'history' чтобы увидеть историю, 'quit' для выхода")
        else:
            print("Используйте стрелочки для навигации, Enter для выбора")
            time.sleep(2)  # Даём время прочитать
        
        if not self.load_game_data():
            return
            
        while True:
            # Добавляем текущий сценарий в историю
            self.game_history.append(self.current_scene)
            
            # Отображаем текущий сценарий
            if not self.display_scene(self.current_scene, interactive=INTERACTIVE_MODE):
                # Игра закончена
                if INTERACTIVE_MODE:
                    clear_screen()
                self.show_game_stats()
                
                print("Нажмите Enter для перезапуска или q для выхода: ", end="")
                if INTERACTIVE_MODE:
                    while True:
                        char = get_char()
                        if char == '\r' or char == '\n':
                            restart = True
                            break
                        elif char.lower() == 'q':
                            restart = False
                            break
                else:
                    restart_input = input().strip().lower()
                    restart = restart_input in ['', 'y', 'yes', 'да']
                
                if restart:
                    self.current_scene = "start"
                    self.game_history = []
                    self.selected_choice = 0
                    if INTERACTIVE_MODE:
                        clear_screen()
                    print("\nИгра перезапускается...\n")
                    time.sleep(1)
                    continue
                else:
                    break
            
            # Получаем выбор пользователя
            scene = self.scenes[self.current_scene]
            choices = scene.get('choices', [])
            
            choice_index = self.get_user_choice(len(choices))
            
            if choice_index is None:
                # Пользователь хочет выйти
                break
                
            # Переходим к следующему сценарию
            selected_choice = choices[choice_index - 1]
            next_scene = selected_choice.get('next_scene')
            
            if next_scene:
                self.current_scene = next_scene
                self.selected_choice = 0  # Сбрасываем выбор для нового сценария
            else:
                print("Ошибка: Не указан следующий сценарий!")
                break
        
        if INTERACTIVE_MODE:
            clear_screen()
        self.show_game_stats()
        print("\nСпасибо за игру! До свидания!")


def main():
    """Главная функция программы."""
    if len(sys.argv) != 2:
        print("Использование: python game.py <filename.json>")
        print("Пример: python game.py example-1.json")
        sys.exit(1)
    
    filename = sys.argv[1]
    game = TextAdventureGame(filename)
    
    try:
        game.play()
    except KeyboardInterrupt:
        print("\n\nИгра прервана пользователем. До свидания!")
    except Exception as e:
        print(f"\nПроизошла неожиданная ошибка: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
