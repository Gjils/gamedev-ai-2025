import json
import networkx as nx
import numpy as np
import plotly.graph_objects as go
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

        node_text = list(graph.nodes())

        node_positions = [{ 'scene_id': node, 'position': {'x': int(coord[0]), 'y': int(coord[1])} } for node, coord in zip(node_text, coords)]

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