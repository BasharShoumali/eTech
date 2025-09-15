import NavLinkItem from "./NavLinkItem.jsx";

export default function NavLinks({ onNavigate, onOpenLogin, onOpenCart }) {
  const LINKS = [
    { to: "/products", label: "Products" },
    { to: "/cart", label: <CartIcon />, onClick: onOpenCart },
    { to: "/login", label: "Login", onClick: onOpenLogin },
  ];

  return (
    <ul className="links">
      {LINKS.map((l) => (
        <li key={l.label.toString()}>
          <a
            href={l.to}
            className="link"
            onClick={(e) => {
              if (l.onClick) {
                e.preventDefault(); // stop page navigation
                l.onClick(); // open popup
              } else {
                onNavigate?.(); // regular link closes menu if mobile
              }
            }}
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.41a1 1 0 0 0 .9 1.5H19v-2H11.42l.93-1.67H17a1 1 0 0 0 .9-.55l3.58-7.16A1 1 0 0 0 20.58 6H8.21L7 4zM7 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}
