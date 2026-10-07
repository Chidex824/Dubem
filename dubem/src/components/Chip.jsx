export default function Chip({ solid = false, children }) {
  return <span className={solid ? "chip chip-solid" : "chip"}>{children}</span>;
}