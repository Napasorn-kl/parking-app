interface PlateTagProps {
  plate: string;
  province?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlateTag({ plate, province, size = 'md' }: PlateTagProps) {
  const cfg = {
    sm: { plateSize: 13, provSize: 8,  stripH: 4,  px: 10, py: 3,  radius: 5,  minW: 70,  border: 1.5 },
    md: { plateSize: 16, provSize: 9,  stripH: 5,  px: 14, py: 4,  radius: 6,  minW: 88,  border: 2   },
    lg: { plateSize: 24, provSize: 11, stripH: 7,  px: 22, py: 7,  radius: 8,  minW: 120, border: 2.5 },
  }[size];

  return (
    <span style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#FFFFFF',
      border: `${cfg.border}px solid #1D4ED8`,
      borderRadius: cfg.radius,
      overflow: 'hidden',
      minWidth: cfg.minW,
      boxShadow: '0 1px 4px rgba(29,78,216,0.15), 0 0 0 0.5px rgba(29,78,216,0.1)',
      flexShrink: 0,
    }}>
      {/* Blue header strip */}
      <span style={{
        display: 'block',
        width: '100%',
        height: cfg.stripH,
        background: 'linear-gradient(90deg, #1D4ED8 0%, #2563EB 50%, #1D4ED8 100%)',
        flexShrink: 0,
      }} />

      {/* Plate body */}
      <span style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: cfg.px,
        paddingRight: cfg.px,
        paddingTop: cfg.py - 1,
        paddingBottom: cfg.py,
        lineHeight: 1.2,
        gap: 1,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: cfg.plateSize,
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}>
          {plate}
        </span>
        {province && (
          <span style={{
            fontSize: cfg.provSize,
            color: '#475569',
            letterSpacing: '0.03em',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {province}
          </span>
        )}
      </span>
    </span>
  );
}
