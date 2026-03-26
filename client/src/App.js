import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { OrderTable } from "./components/OrderTable";
import StartModal from "./components/StartModal";
import { useOrders } from "./hooks/useOrders";
import { useGeneral } from "./hooks/useGeneral";
import { useAnnotations } from "./hooks/useAnnotations";
import { useOrderSocket } from "./hooks/useOrderSocket";

function App() {
  const [showStartModal, setShowStartModal] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { general, updateGeneral } = useGeneral();
  const { annotations, refetchAnnotations } = useAnnotations();
  const {
    orders,
    activeOrders,
    fetchOrders,
    handleStatusUpdate,
  } = useOrders(selectedDate);

  useOrderSocket({
    orders,
    showStartModal,
    isAdmin,
    onOrderAdded: fetchOrders,
  });

  useEffect(() => {
    fetchOrders();
  }, [selectedDate, fetchOrders]); 
  // eslint-disable-next-line react-hooks/exhaustive-deps


  return (
    <div>
      {/* Controls */}
      <div className="d-flex justify-content-center pt-3 px-2">
        <Form.Select
          className="flex-grow-1 mx-3"
          value={general?.pickUpTime || ""}
          onChange={(e) => updateGeneral("pickUpTime", e.target.value)}
        >
          <option value="" disabled hidden>
            Preuzimanje: {general?.pickUpTime} minuta
          </option>
          {[10,20,30,40,50,60,70,80,90,100,110,120].map((m) => (
            <option key={m} value={m}>Preuzimanje: {m} minuta</option>
          ))}
        </Form.Select>

        <Form.Select
          className="flex-grow-1 mx-3"
          value={general?.deliveryTime || ""}
          onChange={(e) => updateGeneral("deliveryTime", e.target.value)}
        >
          <option value="" disabled hidden>
            Dostava: {general?.deliveryTime} minuta
          </option>
          {[10,20,30,40,50,60,70,80,90,100,110,120].map((m) => (
            <option key={m} value={m}>Dostava: {m} minuta</option>
          ))}
        </Form.Select>

        {isAdmin && (
          <Form.Control
            type="date"
            className="flex-grow-1 mx-3"
            max={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        )}
      </div>

      {/* Orders */}
      <div className="p-4">
        {activeOrders.length > 0 ? (
          <OrderTable
            activeOrders={activeOrders}
            annotations={annotations}
            handleStatusUpdate={handleStatusUpdate}
            general={general}
            fetchData={fetchOrders}
            fetchAnnotations={refetchAnnotations}
          />
        ) : (
          <h2 className="p-4">Nema narudžbi</h2>
        )}

        <StartModal
          show={showStartModal}
          handleClose={() => setShowStartModal(false)}
          setIsAdmin={setIsAdmin}
        />
      </div>
    </div>
  );
}

export default App;
