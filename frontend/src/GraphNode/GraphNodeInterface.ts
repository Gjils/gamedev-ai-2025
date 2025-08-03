interface GraphNodeInterface {
  position: {
    x: number;
    y: number;
  };
  scene_id: string;
  text: string;
  choices: { next_scene: string; text: string; }[];
}

export default GraphNodeInterface;
