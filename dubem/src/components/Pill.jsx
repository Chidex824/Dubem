export default function Pill({ tone = "info", children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}