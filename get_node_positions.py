import json
import networkx as nx
import numpy as np
from networkx.drawing.nx_agraph import graphviz_layout
import sys
import os

def generate_node_positions(filename):
    """Генерирует позиции узлов для файла сценария игры"""
    # Убираем расширение .json если оно есть
    base_name = filename.replace('.json', '')
    
    input_path = f'generated_quests/{base_name}.json'
    output_path = f'node_positions/{base_name}.json'
    
    # Проверяем существование входного файла
    if not os.path.exists(input_path):
        print(f"Ошибка: файл {input_path} не найден")
        return False
    
    # Создаем директорию для выходных файлов если её нет
    os.makedirs('node_positions', exist_ok=True)
    
    try:
        with open(input_path) as f:
            data = json.load(f)
        
        graph = nx.Graph(directed=True)
        graph.add_nodes_from(map(lambda scene: scene['scene_id'], data['scenes']))
        graph.add_edges_from(
            (choice['next_scene'], scene['scene_id'])
            for scene in data['scenes']
            for choice in scene['choices']
        )

        # Генерируем координаты вершин графа
        pos = graphviz_layout(graph, prog='dot', args="-Grankdir=LR")

        coords = np.array(list(pos.values()))
        
        # Применяем скейлинг по Y для лучшего отображения
        if len(coords) > 0:
            # Получаем минимальные и максимальные значения
            min_x, min_y = coords.min(axis=0)
            max_x, max_y = coords.max(axis=0)
            
            # Вычисляем размах по каждой оси
            range_x = max_x - min_x if max_x != min_x else 1
            range_y = max_y - min_y if max_y != min_y else 1
            
            # Определяем коэффициент масштабирования для Y
            # Увеличиваем расстояние между узлами по Y в 1.5 раза для лучшей читаемости
            y_scale_factor = 1.5
            x_scale_factor = 1.5

            # Центрируем координаты относительно (0, 0) и применяем масштабирование
            coords_centered = coords - [min_x + range_x/2, min_y + range_y/2]
            coords_scaled = coords_centered * [x_scale_factor, y_scale_factor]

            # Финальные координаты со сдвигом в положительную область
            final_coords = coords_scaled + [range_x/2, range_y * y_scale_factor/2]
        else:
            final_coords = coords

        node_text = list(graph.nodes())

        node_positions = [{ 'scene_id': node, 'position': {'x': int(coord[0]), 'y': int(coord[1])} } for node, coord in zip(node_text, final_coords)]

        with open(output_path, 'w') as f:
            json.dump(node_positions, f, indent=2)
        
        print(f"Позиции узлов сохранены в {output_path}")
        return True
        
    except Exception as e:
        print(f"Ошибка при обработке файла: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Использование: python3 get_node_positions.py <filename>")
        print("Пример: python3 get_node_positions.py example-2.json")
        sys.exit(1)
    
    filename = sys.argv[1]
    success = generate_node_positions(filename)
    
    if not success:
        sys.exit(1)