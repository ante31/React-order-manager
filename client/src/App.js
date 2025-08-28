import { useEffect, useState, useRef } from 'react';
import { Form } from 'react-bootstrap'; // Import React Bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { filterOrders } from './services/filterOrders';
import { backendUrl, backendUrlBackup } from './localhostConf';
import { OrderRow } from './components/OrderRow';
import StartModal from './components/StartModal';
import playSound from './services/playSound';
// import { Dropdown } from "react-bootstrap";
import { safeFetch } from './services/safeFetch';
import emailjs from '@emailjs/browser';
import { io } from 'socket.io-client';


function App() {
  const publicKey = process.env.PUBLIC_KEY;
  emailjs.init(publicKey);

  const [orders, setOrders] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);

  const [general, setGeneral] = useState(null);
  const [error, setError] = useState(null);

  // Get the current date in ISO format for fetch
  const time = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Zagreb' }).replace(' ', 'T') + '.000Z';
  const date = new Date(time);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Convert UTC to local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const [lastHasPending, setLastHasPending] = useState(false);  // Track previous pending state
  const socketRef = useRef(null);        

  const fetchGeneral = async () => {
    try {
      const response = await safeFetch(`${backendUrl}/general`);
      const data = await response.json();
      setGeneral(data);
    } catch (err) {
      setError(err.message);
      console.error(error);
    } finally {
    }
  };

  const fetchAnnotations = async () => {
    try {
      const response = await safeFetch(`${backendUrl}/annotations`);
      const data = await response.json();
      setAnnotations(data);
    } catch (err) {
      setError(err.message);
      console.error(error);
    } finally {
    }
  };

  const fetchData = async () => {
    try {
      const response = await safeFetch(`${backendUrl}/orders/${year}/${month}/${day}`);
      const data = await response.json();
      
      if (data) {
        const ordersArray = Object.entries(data).map(([id, order]) => ({
          id,
          ...order
        }));
  
        // Check if any order's status is 'pending'
        const hasPendingOrder = ordersArray.some(order => order.status === 'pending');
  
        // Only play sound if the status changed (from no pending to pending)
        if (hasPendingOrder && !lastHasPending) {
          playSound();
        }
  
        // Update the lastPending status for the next fetch
        setLastHasPending(hasPendingOrder);
  
        setOrders(ordersArray);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGeneral();
    fetchAnnotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
useEffect(() => {
  let usingBackup = false;

  const socket = io(backendUrl, { 
    transports: ["websocket"], 
    reconnection: true, 
    reconnectionAttempts: Infinity, 
    reconnectionDelay: 2000 
  });

  socketRef.current = socket;

  const sendLogin = () => {
    socket.emit("frontend-logged-in", { timestamp: new Date().toISOString() });
    console.log("📡 Sent frontend-logged-in");
  };

  socket.on("connect", () => {
    console.log("✅ Connected:", socket.id, "via", usingBackup ? "backup" : "primary");
    sendLogin();

    // Heartbeat
    if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
    socket.heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", { timestamp: new Date().toISOString() });
    }, 5000);
  });

  // Ako je došlo do reconnecta (npr. promjena mreže / IP)
  socket.io.on("reconnect", (attempt) => {
    console.log("♻️ Reconnected after", attempt, "tries. Socket:", socket.id);
    sendLogin();
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);

    if (!usingBackup) {
      console.log("⚠️ Switching to backup URL:", backendUrlBackup);
      usingBackup = true;
      socket.io.uri = backendUrlBackup; // promjena url-a
      socket.io.opts.hostname = undefined;
      socket.io.opts.port = undefined;
      socket.connect();
    }
  });

  const handleBeforeUnload = () => {
    socket.emit("frontend-closed", { timestamp: new Date().toISOString() });
  };
  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    socket.disconnect();
    socketRef.current = null;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Listener za order-added
useEffect(() => {
  const socket = socketRef.current;
  if (!socket) return;

  const handleOrderAdded = (newOrder) => {
    console.log("📥 Nova narudžba:", newOrder);
    setOrders((prev) => {
      const updated = [...prev, newOrder];
      const hasPending = updated.some((o) => o.status === "pending");
      if (hasPending && !lastHasPending) playSound();
      setLastHasPending(hasPending);
      return updated;
    });
  };

  socket.on("order-added", handleOrderAdded);
  return () => {
    socket.off("order-added", handleOrderAdded);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



const [hasPending, setHasPending] = useState(false);

useEffect(() => {
  const has = orders.some(order => order.status === 'pending');
  setHasPending(has);
}, [orders]);

// 🔔 Timer koji svira svakih 10 sekundi ako postoji pending narudžba
useEffect(() => {
  const interval = setInterval(() => {
    if (hasPending) {
      playSound();
    }
  }, 10000);

  return () => clearInterval(interval);
}, [hasPending]);



// Filter out orders that have expired (current time > order deadline)
  const activeOrders = filterOrders(orders)

  console.log("Active Orders:", activeOrders);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      //console.log(`Updating status for order ${orderId} to ${status}`);
      const response = await safeFetch(`${backendUrl}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, year, month, day }),
      });
      
      if (response.ok) {
        //console.log(`${status} status updated successfully.`);
        fetchData();  // Optionally re-fetch orders to update UI
      } else {
        console.log('Error updating status');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGeneralSubmit = async (newValues) => {
    try {
      const response = await fetch(`${backendUrl}/general`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newValues),
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setGeneral(updatedData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-center pt-3 px-2 ">
        <Form.Select 
          aria-label="First select" 
          className="flex-grow-1 mx-3"
          value={general?.pickUpTime || ""}
          onChange={(e) => {
            const newTime = parseInt(e.target.value);
            setGeneral(prev => ({ ...prev, pickUpTime: newTime }));
            handleGeneralSubmit({pickUpTime: newTime})
          }}
        >
          <option value="" disabled hidden>
            Preuzimanje: {general?.pickUpTime} minuta
          </option>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map((minutes) => (
            <option key={minutes} value={minutes}>
              Preuzimanje: {minutes} minuta
            </option>
          ))}
        </Form.Select>
        
        <Form.Select 
          aria-label="First select" 
          className="flex-grow-1 mx-3"
          value={general?.deliveryTime || ""}
          onChange={(e) => {
            const newTime = parseInt(e.target.value);
            setGeneral(prev => ({ ...prev, deliveryTime: newTime }));
            handleGeneralSubmit({deliveryTime: newTime})
          }}
        >
          <option value="" disabled hidden>
          Dostava: {general?.pickUpTime} minuta
          </option>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map((minutes) => (
            <option key={minutes} value={minutes}>
              Dostava: {minutes} minuta
            </option>
          ))}
        </Form.Select>
        {/* <Dropdown className="mx-3">
    <Dropdown.Toggle variant="secondary" id="dropdown-basic">
      <FiFileText className="me-2" />
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item href="#/action-1">Lista</Dropdown.Item>
      <Dropdown.Item href="#/action-2">Dodaj u listu</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown> */}
      </div>
    <div className="p-4">
  {activeOrders.some(order => order.status === "pending" || order.status === "accepted") ? (
    <OrderRow
      activeOrders={[...activeOrders]}  // reverse here
      annotations={annotations}
      handleStatusUpdate={handleStatusUpdate}
      showDeleteModal={showDeleteModal}
      setShowDeleteModal={setShowDeleteModal}
      general={general}
      fetchData={fetchData}
      fetchAnnotations={fetchAnnotations}
    />
  ) : (
    <h2 className='p-4'>Nema narudžbi</h2>
  )}
  <StartModal
    show={showStartModal}
    handleClose={() => {
      setShowStartModal(false);
    }}
  />
</div>

    </div>

  );
}

export default App;
