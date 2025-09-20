import { useEffect, useState } from "react";
import CardPreviewModal from "../../components/cardPreviewModal/CardPreviewModal";
import "./PaymentMethodsPage.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PaymentMethodsPage() {
  const [user, setUser] = useState(null);
  const [methods, setMethods] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const [draft, setDraft] = useState({
    number: "",
    mm: "",
    yy: "",
    name: "",
    cvv: "",
  });

  // Helpers
  const onlyDigits = (s = "") => s.replace(/\D+/g, "");
  const formatCardNumber = (raw) =>
    onlyDigits(raw)
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  // Input Handlers
  const handleNumberChange = (e) =>
    setDraft((d) => ({ ...d, number: formatCardNumber(e.target.value) }));

  const handleCVVChange = (e) =>
    setDraft((d) => ({ ...d, cvv: onlyDigits(e.target.value).slice(0, 4) }));

  const handleMMChange = (e) => {
    let v = onlyDigits(e.target.value).slice(0, 2);
    if (v.length === 1 && Number(v) > 1) v = "0" + v;
    if (v.length === 2) {
      const n = Number(v);
      if (n === 0) v = "01";
      else if (n > 12) v = "12";
    }
    setDraft((d) => ({ ...d, mm: v }));
  };

  const handleYYChange = (e) =>
    setDraft((d) => ({ ...d, yy: onlyDigits(e.target.value).slice(0, 2) }));

  const handleNameChange = (e) =>
    setDraft((d) => ({
      ...d,
      name: e.target.value.toUpperCase().slice(0, 26),
    }));

  // Save Card
  const handleSaveCard = async () => {
    if (!user?.userNumber) return;

    try {
      const res = await fetch(`${API}/api/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userNumber: user.userNumber,
          cardHolderName: draft.name,
          cardNumber: draft.number.replace(/\s/g, ""),
          cvv: draft.cvv,
          expiryMonth: Number(draft.mm),
          expiryYear: 2000 + Number(draft.yy),
          billingAddress: "",
          isDefault: 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save card");
      }

      const newCard = await res.json();
      setMethods((prev) => [newCard, ...prev]);
      setDraft({ number: "", mm: "", yy: "", name: "", cvv: "" });
      setMsg("Card saved successfully.");
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  // Delete Card
  const handleDeleteCard = async () => {
    try {
      const res = await fetch(
        `${API}/api/payment-methods/${cardToDelete}/delete`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) throw new Error("Failed to delete card");

      setMethods((prev) => prev.filter((m) => m.paymentID !== cardToDelete));
      setMsg("Card deleted.");
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    } finally {
      setConfirmOpen(false);
      setCardToDelete(null);
    }
  };

  // Load user
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      setMsg("No user found. Please log in.");
      return;
    }
    setUser(savedUser);
  }, []);

  // Fetch payment methods
  useEffect(() => {
    if (!user?.userNumber) return;
    fetch(`${API}/api/payment-methods/user/${user.userNumber}`)
      .then((res) => res.json())
      .then((data) => setMethods(data))
      .catch((err) => {
        console.error("Error fetching payment methods:", err);
        setMsg("Failed to load payment methods");
      });
  }, [API, user]);

  return (
    <div className="paymentMethodsPage">
      <h2>My Payment Methods</h2>
      {msg && <p className="msg">{msg}</p>}

      <table>
        <thead>
          <tr>
            <th>Cards</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => (
            <tr key={m.paymentID}>
              <td>{"**** **** **** " + (m.cardNumber?.slice(-4) || "0000")}</td>
              <td>
                <button
                  className="btn btn-small"
                  onClick={() => setSelectedCard(m)}
                >
                  View
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => {
                    setCardToDelete(m.paymentID);
                    setConfirmOpen(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Card Section */}
      <div className="addSection">
        <p className="addText">I want to add a new method</p>
        <div className="cardPlaceholder">
          <img
            src="/assets/logos/E-square-logo.png"
            alt="Site Logo"
            className="cardLogo"
          />
          <div className="cardChip" />

          {/* CVV */}
          <div className="cardCVV">
            <label className="label" htmlFor="cvv">
              CVV:
            </label>
            <input
              id="cvv"
              className="cardInput cvvInput"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              placeholder="123"
              value={draft.cvv}
              onChange={handleCVVChange}
            />
          </div>

          {/* Card Number */}
          <div className="cardNumber">
            <input
              className="cardInput numberInput"
              inputMode="numeric"
              pattern="[0-9 ]*"
              maxLength={19}
              placeholder="#### #### #### ####"
              value={draft.number}
              onChange={handleNumberChange}
            />
          </div>

          {/* Valid Thru */}
          <div className="cardValid">
            <div className="label">VALID THRU</div>
            <div className="validRow">
              <input
                className="cardInput mmInput"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="MM"
                value={draft.mm}
                onChange={handleMMChange}
              />
              <span className="slash">/</span>
              <input
                className="cardInput yyInput"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="YY"
                value={draft.yy}
                onChange={handleYYChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="cardFooter">
            <input
              className="cardInput nameInput"
              placeholder="CARDHOLDER NAME"
              value={draft.name}
              onChange={handleNameChange}
            />
            <img
              src="/assets/logos/simple-eTech.png"
              alt="Brand"
              className="brandLogo"
            />
          </div>
        </div>

        <div className="saveCardContainer">
          <button className="btn btn-save" onClick={handleSaveCard}>
            Save This Card
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <CardPreviewModal
        method={selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      {/* Confirm Delete Modal */}
      {confirmOpen && (
        <div
          className="modalOverlay"
          onClick={(e) =>
            e.target.classList.contains("modalOverlay") && setConfirmOpen(false)
          }
        >
          <div className="modalBody">
            <p className="confirmText">
              Are you sure you want to delete this card?
            </p>
            <div className="confirmBtns">
              <button className="btn" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteCard}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
