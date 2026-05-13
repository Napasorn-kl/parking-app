interface PlateTagProps {
  plate: string;
  province?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlateTag({ plate, province, size = 'md' }: PlateTagProps) {
  const sizes = { sm: 12, md: 15, lg: 22 };
  const pads = { sm: '2px 10px', md: '4px 14px 3px', lg: '8px 24px' };
  return (
    <span className="plate-tag" style={{ padding: pads[size] }}>
      <span className="plate-number" style={{ fontSize: sizes[size] }}>{plate}</span>
      {province && <span className="plate-province">{province}</span>}
    </span>
  );
}
