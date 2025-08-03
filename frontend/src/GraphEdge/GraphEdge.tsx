
interface GraphEdgeProps {
  source: { x: number; y: number };
  target: { x: number; y: number };
}

function GraphEdge(props: GraphEdgeProps) {
  const { source, target } = props;
  return (
    <line
      x1={source.x + 65}
      y1={source.y + 20}
      x2={target.x + 65}
      y2={target.y + 20}
      stroke="#D6BD98"
      stroke-width={2}
    />
  );
}

export default GraphEdge;
export type { GraphEdgeProps };
