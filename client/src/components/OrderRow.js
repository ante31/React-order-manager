import { Button, Collapse, Table } from "react-bootstrap";
import { formatTimeToEuropean } from "../services/timeToEuropean";
import { generateReceipt } from "../services/generateReceipt";
import { BsPrinter } from "react-icons/bs";
import ConfirmationModal from "./Modal";
import React, { useState, memo, useCallback } from "react";

export const OrderRow = ({
  activeOrders,
  handleStatusUpdate,
  showDeleteModal,
  setShowDeleteModal,
  general,
}) => {
  const [orderToReject, setOrderToReject] = useState({});
  const [openRow, setOpenRow] = useState(null); // Track which row is open

  const toggleCollapse = useCallback((index) => {
    setOpenRow((prevOpenRow) => (prevOpenRow === index ? null : index));
  }, []);

  const handleAcceptOrder = useCallback(
    (orderId) => {
      handleStatusUpdate(orderId, "accepted");
    },
    [handleStatusUpdate]
  );

  const handleRejectOrder = useCallback(
    (order) => {
      setShowDeleteModal(true);
      setOrderToReject(order);
    },
    [setShowDeleteModal]
  );

  const handlePrintReceipt = useCallback(
    (order) => {
      generateReceipt(order);
    },
    [generateReceipt]
  );

  const Row = memo(({ order, index, isOpen, toggleCollapse }) => {
    return (
      <React.Fragment key={index}>
        {/* Collapsible Row Trigger */}
        <tr
          onClick={() => toggleCollapse(index)}
          style={{ cursor: "pointer", height: "100%" }}
        >
          <td
            style={{
              width: "5%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: "white",
              color: "red",
              fontWeight: "bold",
              fontSize: "1.2em",
            }}
          >
            {index + 1}
          </td>
          <td
            style={{
              width: "5%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {formatTimeToEuropean(order.time)}
          </td>
          <td
            style={{
              width: "5%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {formatTimeToEuropean(order.deadline)}
          </td>
          <td
            style={{
              width: "20%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {order.name}
          </td>
          <td
            className="d-none d-md-table-cell"
            style={{
              width: "10%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {order.isDelivery ? "Dostava" : "Preuzimanje"}
          </td>
          <td
            className="d-none d-md-table-cell"
            style={{
              width: "10%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {order.isDelivery ? `${order.address}, ${order.zone}` : ""}
          </td>
          <td
            className="d-none d-md-table-cell"
            style={{
              width: "10%",
              position: "relative",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {order.phone}
          </td>
          <td>
            {order.status === "pending" ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "5px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                }}
              >
                <Button
                  style={{
                    flex: 2,
                    color: "green",
                    borderColor: "green",
                    backgroundColor: "white",
                    borderWidth: "2px",
                    fontWeight: "bold",
                    marginRight: "2px",
                  }}
                  variant="outline-success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptOrder(order.id);
                  }}
                >
                  Prihvati
                </Button>
                <Button
                  style={{
                    flex: 1,
                    color: "red",
                    borderColor: "red",
                    backgroundColor: "white",
                    borderWidth: "2px",
                    fontWeight: "bold",
                    marginLeft: "2px",
                  }}
                  variant="outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectOrder(order);
                  }}
                >
                  Odbij
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "5px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                }}
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrintReceipt(order);
                  }}
                  style={{
                    width: "100%",
                    color: "blue",
                    borderColor: "blue",
                    borderWidth: "2px",
                    backgroundColor: "white",
                    fontWeight: "bold",
                  }}
                >
                  <BsPrinter size={20} />
                </Button>
              </div>
            )}
          </td>
        </tr>

        {/* Unutar Collapse-a */}
        <tr>
          <td colSpan={8} style={{ padding: 0 }}>
            <Collapse in={isOpen}>
            <div style={{ padding: "1em", paddingLeft: "5em", paddingRight: "15em", backgroundColor: "#f9f9f9" }}>
              <div style={{ padding: "1em", backgroundColor: "#f9f9f9" }}>
                {order.cartItems &&
                  order.cartItems.map((item) => {
                    const extrasTotal = item.selectedExtras
                      ? Object.values(item.selectedExtras).reduce((sum, val) => sum + parseFloat(val || 0), 0)
                      : 0;

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between', // Ensure names and prices are spaced correctly
                          alignItems: 'flex-start',
                          marginBottom: '0.5em',
                          marginLeft: '1em',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <strong>
                            {item.quantity} x {item.name.split("|")[0]}
                            {item.size !== 'null' && (
                              <span style={{ fontWeight: 'lighter' }}> ({item.size})</span>
                            )}
                          </strong>
                          {item.selectedExtras && (
                            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '1em' }}>
                              {Object.entries(item.selectedExtras).map(([extra, quantity], extraIndex) => (
                                <span key={extraIndex}>
                                  {extra.split('|')[0]}
                                  {extraIndex < Object.entries(item.selectedExtras).length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ whiteSpace: 'nowrap', textAlign: 'right', flexShrink: 0, marginRight: '1em' }}>
                          €{item.price.toFixed(2)}
                          {extrasTotal > 0 && (
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                              <span >
                                €{extrasTotal.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Dostava Section */}
                {order.isDelivery && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between', // Ensure it aligns correctly
                    alignItems: 'flex-start',
                    marginTop: '1em',
                    marginLeft: '1em',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>Dostava</strong>
                  </div>
                  <div style={{ whiteSpace: 'nowrap', textAlign: 'right', marginRight: '1em' }}>
                    €{general.deliveryPrice.toFixed(2)}
                  </div>
                </div>
                )}

                {/* Ukupno Section */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between', // Align names on the left and prices on the right
                    alignItems: 'flex-start',
                    marginTop: '1em',
                    backgroundColor: 'white',
                    padding: '1em',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>Ukupno</strong>
                  </div>
                  <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    €{(order.cartItems.reduce((total, item) => {
                      const extrasTotal = item.selectedExtras
                        ? Object.values(item.selectedExtras).reduce((sum, val) => sum + parseFloat(val || 0), 0)
                        : 0;
                      return total + item.price + extrasTotal;
                    }, 0) + (order.isDelivery? general.deliveryPrice: 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            </Collapse>
          </td>
        </tr>
      </React.Fragment>
    );
  });

  return (
    <div>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th
              style={{
                width: "5%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            ></th>
            <th
              style={{
                width: "5%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Vrijeme Narudžbe
            </th>
            <th
              style={{
                width: "5%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Rok
            </th>
            <th
              style={{
                width: "20%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Ime
            </th>
            <th
              className="d-none d-md-table-cell"
              style={{
                width: "10%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Tip
            </th>
            <th
              className="d-none d-md-table-cell"
              style={{
                width: "30%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Adresa
            </th>
            <th
              className="d-none d-md-table-cell"
              style={{
                width: "15%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Mobitel
            </th>
            <th
              style={{
                width: "10%",
                textAlign: "center",
                color: "white",
                backgroundColor: "red",
                verticalAlign: "middle",
              }}
            >
              Akcije
            </th>
          </tr>
        </thead>
        <tbody>
          {activeOrders
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .map((order, index) => (
              <Row
              key={index}
              order={order}
              index={index}
              isOpen={openRow === index}
              toggleCollapse={toggleCollapse}
            />
          ))}
        </tbody>
      </Table>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleConfirm={() => {
          handleStatusUpdate(orderToReject.id, "rejected");
          setShowDeleteModal(false);
        }}
        title="Potvrda brisanja"
        body={`Jeste li sigurni da želite odbiti ovu narudžbu?`}
        confirmLabel="Odbij"
        closeLabel="Nazad"
      />
    </div>
  );
};