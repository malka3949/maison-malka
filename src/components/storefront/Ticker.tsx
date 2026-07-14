type Props = {
  items: string[];
};

export function Ticker({ items }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div className="mm-ticker" aria-hidden="true">
      <div className="mm-ticker-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
