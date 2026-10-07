export default function Menu({ items }) {
  return (
    <ul className="menu">
      {items.map((item, index) => (
        <li key={index} className="menu-item">
          {item}
        </li>
      ))}
    </ul>
  );
}