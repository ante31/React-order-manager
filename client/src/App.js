import React, { use, useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap'; // Import React Bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { formatTimeToEuropean } from './services/timeToEuropean';
import { filterOrders } from './services/filterOrders';
import { backendUrl } from './localhostConf';
import { OrderRow } from './components/OrderRow';
import StartModal from './components/StartModal';


function App() {
  const [orders, setOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const playSound = () => {
    const audio = new Audio('/sci-fi.wav');
    
    // Attempt to apply attributes for autoplay (though may still require user interaction)
    audio.autoplay = true;
    audio.playsInline = true; // Adds playsinline, but mainly for video
    audio.setAttribute('webkit-playsinline', 'true'); // For webkit-based browsers (Safari, etc.)
    
    // Try playing the audio and catch the error if autoplay fails due to user interaction restriction
    audio.play().catch(error => console.log('Playback error:', error));
  };
  const colors = [
    'red', 'blue', 'green', '#FFF44F', 'purple', 'orange', 'pink', 'brown'
  ]; // Array of 8 colors

  const [general, setGeneral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/general`);
        const data = await response.json();
        setGeneral(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchGeneral();
  }, []);

  useEffect(() => {
    console.log("general: ", general); // Log the general object;
  }, [general]);

  // Get the current date in ISO format for fetch
  const time = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Zagreb' }).replace(' ', 'T') + '.000Z';
  const date = new Date(time);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Convert UTC to local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const [lastHasPending, setLastHasPending] = useState(false);  // Track previous pending state
  console.log("backendUrl", backendUrl)

  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/orders/${year}/${month}/${day}`);
      const data = await response.json();
      
      if (data) {
        const ordersArray = Object.entries(data).map(([id, order]) => ({
          id,
          ...order
        }));
  
        // Check if any order's status is 'pending'
        const hasPendingOrder = ordersArray.some(order => order.status === 'pending');
        console.log("hasPendingOrder: ", hasPendingOrder);
  
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
    fetchData(); // Fetch immediately on mount

    const interval = setInterval(() => {
      console.log('Fetching orders...');
      fetchData();
      console.log("Updated Orders: ", orders);
    }, 30000); // Run every 30 seconds

    return () => clearInterval(interval);
  }, []); // Dependency array to re-fetch on date change


// Filter out orders that have expired (current time > order deadline)
  const activeOrders = filterOrders(orders)
  console.log("Active Orders: ", activeOrders);


  const handleStatusUpdate = async (orderId, status) => {
    try {
      console.log(`Updating status for order ${orderId} to ${status}`);
      const response = await fetch(`${backendUrl}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, year, month, day }),
      });
      
      if (response.ok) {
        console.log(`${status} status updated successfully.`);
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
      </div>
    <div className="p-4">
      {activeOrders.some(order => order.status === "pending" || order.status === "accepted") ? (
        <OrderRow activeOrders={activeOrders} colors={colors} handleStatusUpdate={handleStatusUpdate} showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} general={general}/>
      ) : (
        //className="d-flex align-items-center justify-content-center vh-100"
        <h2 className='p-4'>Nema narudžbi</h2>
      )}
      <StartModal
        show={showStartModal}
        handleClose={() => setShowStartModal(false)}
      />
    </div>
    </div>

  );
}

export default App;
