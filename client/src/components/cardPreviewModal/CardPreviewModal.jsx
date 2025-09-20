import "./CardPreviewModal.css";

export default function CardPreviewModal({ method, onClose }) {
  if (!method) return null;

  // Format as "#### #### #### ####" or keep backend-masked values
  const formatCardNumber = (num = "") =>
    String(num)
      .replace(/[^\d•\s]/g, "") // allow digits, bullet dots, spaces
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  const mm = method?.expiryMonth
    ? String(method.expiryMonth).padStart(2, "0")
    : "MM";
  const yy = method?.expiryYear ? String(method.expiryYear).slice(-2) : "YY";

  return (
    <div
      className="modalOverlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="modalCenter">
        <div className="cardPlaceholder">
          {/* Logo */}
          <img
            src="/assets/logos/E-square-logo.png"
            alt="Site Logo"
            className="cardLogo"
          />

          {/* Chip */}
          <div className="cardChip" />

          {/* CVV (top-right, same as Add Card) */}
          <div className="cardCVV">
            <label className="label">CVV:</label>
            <div className="cardInput cvvInput">{method?.cvv || "N/A"}</div>
          </div>

          {/* Card Number (center) */}
          <div className="cardNumber">
            <div className="cardInput numberInput">
              {formatCardNumber(method?.cardNumber || "")}
            </div>
          </div>

          {/* VALID THRU */}
          <div className="cardValid">
            <div className="label">VALID THRU</div>
            <div className="validRow">
              <div className="cardInput mmInput">{mm}</div>
              <span className="slash">/</span>
              <div className="cardInput yyInput">{yy}</div>
            </div>
          </div>

          {/* Footer: name + brand */}
          <div className="cardFooter">
            <div className="cardInput nameInput">
              {method?.cardHolderName || "CARDHOLDER NAME"}
            </div>
            <img
              src="/assets/logos/simple-eTech.png"
              alt="Brand"
              className="brandLogo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
