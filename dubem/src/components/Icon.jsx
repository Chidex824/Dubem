export default function Icon({ name, small = false }) {
  return (
    <svg className={small ? "ic ic-sm" : "ic"} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}