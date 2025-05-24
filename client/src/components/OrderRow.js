import { Table } from "react-bootstrap";
import { generateReceipt } from "../services/generateReceipt";
import ConfirmationModal from "./Modal";
import { useState, useCallback } from "react";
import Row from "./Row";
import TableHead from "./TableHead";

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
    [order]
  );

  return (
    <div>
      <Table bordered hover responsive>
        <TableHead />
        {[...activeOrders]
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .map((order, _, arr) => {
          const reverseIndex = arr.length - 1 - arr.indexOf(order);
          return (
            <Row
              key={reverseIndex}
              order={order}
              index={reverseIndex}
              isOpen={openRow === reverseIndex}
              toggleCollapse={toggleCollapse}
              handleAcceptOrder={handleAcceptOrder}
              handleRejectOrder={handleRejectOrder}
              handlePrintReceipt={handlePrintReceipt}
              general={general}
            />
          );
        })}
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