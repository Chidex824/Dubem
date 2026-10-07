export default function Field({ id, label, hint, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input className="input" id={id} {...inputProps} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}