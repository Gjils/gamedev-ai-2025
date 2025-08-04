
interface GraphEdgeProps {
  source: { x: number; y: number };
  target: { x: number; y: number };
  node_size: { width: number; height: number };
}

function GraphEdge(props: GraphEdgeProps) {
  const { source, target, node_size } = props;
  let norm = () => {
    if (source.x < target.x) {
      return {
        source: node_size.width / 2,
        target: -node_size.width / 2
      };
    } else {
      return {
        source: -node_size.width / 2,
        target: node_size.width / 2
      };
    }
  };


  const x1 = () => source.x + node_size.width / 2 + norm().source;
  const y1 = () => source.y + node_size.height / 2;
  const x2 = () => target.x + node_size.width / 2 + norm().target;
  const y2 = () => target.y + node_size.height / 2;

  // Вычисляем угол для стрелочки
  const angle = () => Math.atan2(y2() - y1(), x2() - x1());
  const arrowLength = 6;  // Уменьшили размер
  const arrowAngle = Math.PI / 6; // 30 градусов для более острой стрелки
  const arrowOffset = -1; // Смещение стрелки от конца линии, чтобы не перекрывать кружок

  // Координаты кончика стрелочки (смещенные назад)
  const arrowTipX = () => x2() - arrowOffset * Math.cos(angle());
  const arrowTipY = () => y2() - arrowOffset * Math.sin(angle());

  // Координаты стрелочки (треугольника)
  const arrowX1 = () => arrowTipX() - arrowLength * Math.cos(angle() - arrowAngle);
  const arrowY1 = () => arrowTipY() - arrowLength * Math.sin(angle() - arrowAngle);
  const arrowX2 = () => arrowTipX() - arrowLength * Math.cos(angle() + arrowAngle);
  const arrowY2 = () => arrowTipY() - arrowLength * Math.sin(angle() + arrowAngle);

  return (
    <g>
      {/* Main line */}
      <line
        x1={x1()}
        y1={y1()}
        x2={x2()}
        y2={y2()}
        stroke="var(--text-color)"
        stroke-width={2}
      />
      
      {/* Arrow head - filled triangle */}
      <path
        d={`M ${arrowTipX()},${arrowTipY()} L ${arrowX1()},${arrowY1()} L ${arrowX2()},${arrowY2()} Z`}
        fill="var(--text-color)"
        stroke="var(--text-color)"
        stroke-width={1}
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      
      {/* Source circle */}
      <circle
        cx={x1()}
        cy={y1()}
        r={5}
        fill="var(--text-color)"
        stroke="var(--bg-color)"
        stroke-width={1}
      />
      
      {/* Target circle */}
      {/* <circle
        cx={x2()}
        cy={y2()}
        r={4}
        fill="#677D6A"
        stroke="#D6BD98"
        stroke-width={1}
        z-index={2}
      /> */}
    </g>
  );
}

export default GraphEdge;
export type { GraphEdgeProps };
