import { Table } from "react-bootstrap";
import { generateReceipt } from "../services/generateReceipt";
import ConfirmationModal from "./Modal";
import { useState, useCallback } from "react";
import Row from "./Row";
import TableHead from "./TableHead";
import AddToListModal from './AddToListModal';
import { backendUrl } from '../localhostConf';
import { safeFetch } from '../services/safeFetch';

export const OrderRow = ({
  activeOrders,
  annotations,
  handleStatusUpdate,
  showDeleteModal,
  setShowDeleteModal,
  general,
  fetchData,
  fetchAnnotations
}) => {
  const [orderToReject, setOrderToReject] = useState({});
  const [openRow, setOpenRow] = useState(null); // Track which row is open
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showRemoveFromBlacklistModal, setShowRemoveFromBlacklistModal] = useState(false);
  const [numberToRemoveFromBlacklist, setNumberToRemoveFromBlacklist] = useState("");
  const [listName, setListName] = useState("");
  const [listPhone, setListPhone] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  console.log("ORDER", activeOrders);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleRemoveFromBlacklist = async () => {
    try {
      const response = await safeFetch(`${backendUrl}/annotations/${numberToRemoveFromBlacklist}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from blacklist');
      }

      console.log('Successfully removed from blacklist');
      setShowRemoveFromBlacklistModal(false);
      fetchData();
      fetchAnnotations();
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  console.log("Annotations", annotations);

  const blacklistedPhones = new Set(Object.keys(annotations));

  return (
    <div>
      <Table bordered hover responsive>
        <TableHead />
        {[...activeOrders]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .map((order, _, arr) => {
          const reverseIndex = arr.length - 1 - arr.indexOf(order);
          const isBlacklisted = blacklistedPhones.has(order.phone);
          const blackListReason = isBlacklisted ? annotations[order.phone].reason : null;
          const severity = isBlacklisted ? annotations[order.phone].severity : null;
          return (
            <Row
              key={reverseIndex}
              setNumberToRemoveFromBlacklist={setNumberToRemoveFromBlacklist}
              setShowRemoveFromBlacklistModal={setShowRemoveFromBlacklistModal}
              blackListReason={blackListReason}
              severity={severity}
              isBlacklisted={isBlacklisted}
              order={order}
              index={reverseIndex}
              isOpen={openRow === reverseIndex}
              toggleCollapse={toggleCollapse}
              handleAcceptOrder={handleAcceptOrder}
              handleRejectOrder={handleRejectOrder}
              handlePrintReceipt={handlePrintReceipt}
              general={general}
              setShowAddToListModal={setShowAddToListModal}
              setListName={setListName}
              setListPhone={setListPhone}
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
      <ConfirmationModal
        show={showRemoveFromBlacklistModal}
        handleClose={() => setShowRemoveFromBlacklistModal(false)}
        handleConfirm={async () => {
          if (isRejecting) return;
          setIsRejecting(true);
          await handleStatusUpdate(orderToReject.id, "rejected");
          setIsRejecting(false);
          setShowDeleteModal(false);
        }}
        title="Potvrda uklanjanja"
        body={`Jeste li sigurni da želite ukloniti ovog gosta s liste?`}
        confirmLabel="Ukloni"
        closeLabel="Nazad"
      />
      <AddToListModal
        show={showAddToListModal}
        handleClose={() => setShowAddToListModal(false)}
        title="Dodaj gosta na listu"
        defaultName={listName}
        defaultPhone={listPhone}
        fetchData={fetchData}
        fetchAnnotations={fetchAnnotations}
/>    </div>
  );
};