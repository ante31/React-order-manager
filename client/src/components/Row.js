import { Button, Collapse } from "react-bootstrap";
import { formatTimeToEuropean } from "../services/timeToEuropean";
import { BsPrinter } from "react-icons/bs";
import React, { memo, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const Row = (({ setNumberToRemoveFromBlacklist, setShowRemoveFromBlacklistModal, blackListReason, severity, isBlacklisted, order, index, isOpen, toggleCollapse, handleAcceptOrder, handleRejectOrder, handlePrintReceipt, general, setShowAddToListModal, setListName, setListPhone }) => {
  const [disabled, setDisabled] = useState(false);
  const handleAddToList = (order) => {
    setListName(order.name);
    setListPhone(order.phone);
    setShowAddToListModal(true);
  } 

  const handleRemoveFromList = (order) => {
    setNumberToRemoveFromBlacklist(order.phone);
    setShowRemoveFromBlacklistModal(true);
    console.log(order);
  }
  

  const severityColor = {
    low: "green",
    medium: "#ffbf00",
    high: "red",
  };

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
            <span style={isBlacklisted ? { paddingRight: "50px", display: "inline-block" } : {display: "inline-block"}}>
              {order.phone}
            </span>

            {isBlacklisted && (
              <FaExclamationTriangle
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "5px",
                  transform: "translateY(-50%)",
                  fontSize: "40px",
                  color: severityColor[severity],
                }}
                title={
                  `Ovaj broj je na listi s razlogom: ${blackListReason || "Nema razloga"}`
                }
              />
            )}
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
                  disabled={disabled}
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
                    setDisabled(true);
                    //console.log("not disabled", order.id);
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
                    setDisabled(true);
                    console.log("not disabled", order.id);
                    //handleRejectOrder(order);
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
              <div>
                <div style={{ padding: "1em", paddingLeft: "5em", paddingRight: "15em", backgroundColor: "#f9f9f9" }}>

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
                          {item.selectedDrinks && item.selectedDrinks.length > 0 && (
                            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '1em' }}>
                              {item.selectedDrinks.map((drink, i) => (
                                <span key={i}>
                                  {drink.ime}
                                  {i < item.selectedDrinks.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ whiteSpace: 'nowrap', textAlign: 'right', flexShrink: 0, marginRight: '1em' }}>
                          {(item.quantity * (item.price - extrasTotal)).toFixed(2)} €
                          {extrasTotal > 0 && (
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                              <span >
                                {(item.quantity * extrasTotal).toFixed(2)} €
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
                  {general &&
                  <div style={{ whiteSpace: 'nowrap', textAlign: 'right', marginRight: '1em' }}>
                    {general.deliveryPrice?.toFixed(2)} €
                  </div>
                  }
                </div>
                )}
                {order.note !== "" && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: '1em',
                      marginLeft: '1em',
                    }}
                  >
                    <strong style={{ marginRight: '0.5em' }}>Napomena:</strong>
                    <div style={{ color: 'blue', wordBreak: 'break-word', maxWidth: '80%' }}>
                      {order.note}
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
                  {general &&
                  <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {(order.cartItems.reduce((total, item) => {
                      // const extrasTotal = item.selectedExtras
                      //   ? Object.values(item.selectedExtras).reduce((sum, val) => sum + parseFloat(val || 0), 0)
                      //   : 0;
                      return total + item.quantity * (item.price);
                    }, 0) + (order.isDelivery? general.deliveryPrice: 0)).toFixed(2)} €
                  </div>
                  }
                </div>
                {!isBlacklisted? <p onClick={() => handleAddToList(order)} style={{ padding: "0px", margin: "0px", marginLeft: "10px" , marginTop: "20px" , color: "red", cursor: "pointer" }}>Dodaj na listu</p>
                :(
                <div style={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
                  <p style={{
                    flex: 5,
                    padding: 3,
                    margin: 0,
                    paddingLeft: "14px",
                    color: severityColor[severity],
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    border: `1px solid ${severityColor[severity]}`,
                    borderRadius: "4px",
                    fontSize: "24px",
                    minHeight: "48px"
                  }}>
                    {blackListReason || <span style={{ color: "#888" }}><i>Bez razloga</i></span>}
                  </p>

                  <Button 
                    variant="outline-success"
                    onClick={() => handleRemoveFromList(order)}
                    style={{
                      flex: 1,
                      marginLeft: "10px",
                      padding: "4px 8px",
                      height: "fit-content",
                      minHeight: "48px"
                    }}
                  >
                    <b>Ukloni s liste</b>
                  </Button>
                </div>
                )
                }
              </div>
            </div>
            </Collapse>
          </td>
        </tr>
      </React.Fragment>
    );
  });

  export default Row;
