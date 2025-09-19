// src/components/CardPreviewModal.jsx
import "./CardPreviewModal.css";

export default function CardPreviewModal({ method, onClose }) {
  if (!method) return null;

  const formatCardNumber = (num = "") =>
    String(num)
      .replace(/\D/g, "")
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
      <div className="modalContent">
        {/* CARD (same size as the add-card preview) */}
        <div className="cardPlaceholder">
          {/* top-left site logo */}
          <img
            src="/assets/logos/E-square-logo.png"
            alt="Site Logo"
            className="cardLogo"
          />

          {/* chip */}
          <div className="cardChip" />

          {/* CVV (top-right) */}
          <div className="cardCVV">
            <div className="label">CVV:</div>
            <div className="cardInput cvvInput">
              {method?.cvv ? String(method.cvv) : "N/A"}
            </div>
          </div>

          {/* Card number */}
          <div className="cardNumber">
            <div className="cardInput numberInput">
              {formatCardNumber(method?.cardNumber)}
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

          {/* Footer */}
          <div className="cardFooter">
            <div className="cardInput nameInput">
              {method?.cardHolderName || "CARDHOLDER"}
            </div>
            <img
              src="/assets/logos/simple-eTech.png"
              alt="Brand"
              className="brandLogo"
            />
          </div>
        </div>

        {/* DETAILS (below card; card size unchanged) */}
        <div className="cardDetailsPanel">
          <div className="detailRow">
            <span className="detailLabel">Card Number</span>
            <span className="detailValue">
              {formatCardNumber(method?.cardNumber)}
            </span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">Card Holder</span>
            <span className="detailValue">{method?.cardHolderName || "-"}</span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">Expiry</span>
            <span className="detailValue">
              {mm}/{yy}
            </span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">CVV</span>
            <span className="detailValue">
              {method?.cvv ? String(method.cvv) : "N/A"}
            </span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">Billing Address</span>
            <span className="detailValue">{method?.billingAddress || "-"}</span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">Default</span>
            <span className="detailValue">
              {method?.isDefault ? "Yes" : "No"}
            </span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">Payment ID</span>
            <span className="detailValue">{method?.paymentID ?? "-"}</span>
          </div>
          <div className="detailRow">
            <span className="detailLabel">User Number</span>
            <span className="detailValue">{method?.userNumber ?? "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
