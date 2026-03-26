import { Table } from "react-bootstrap";
import ConfirmationModal from "../modals/Modal";
import { useState } from "react";
import OrderTableRow from "./OrderTableRow";
import OrderTableHead from "./OrderTableHead";
import AddToListModal from '../modals/AddToListModal';
import { useOrderTable } from "../hooks/useOrderTable";

export const OrderTable = ({
  activeOrders,
  annotations,
  handleStatusUpdate,
  general,
  fetchData,
  fetchAnnotations
}) => {
  const table = useOrderTable({ handleStatusUpdate, fetchData, fetchAnnotations });
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [listName, setListName] = useState("");
  const [listPhone, setListPhone] = useState("");


  const blacklistedPhones = new Set(Object.keys(annotations));

  return (
    <div>
      <Table bordered hover responsive>
        <OrderTableHead />
        {[...activeOrders]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .map((order, _, arr) => {
          const reverseIndex = arr.length - 1 - arr.indexOf(order);
          const isBlacklisted = blacklistedPhones.has(order.phone);
          const blackListReason = isBlacklisted ? annotations[order.phone].reason : null;
          const severity = isBlacklisted ? annotations[order.phone].severity : null;
          return (
            <OrderTableRow
              key={reverseIndex}
              setNumberToRemoveFromBlacklist={table.setNumberToRemoveFromBlacklist}
              setShowRemoveFromBlacklistModal={table.setShowRemoveFromBlacklistModal}
              blackListReason={blackListReason}
              severity={severity}
              isBlacklisted={isBlacklisted}
              order={order}
              index={reverseIndex}
              isOpen={table.openRow === reverseIndex}
              toggleCollapse={table.toggleCollapse}
              handleAcceptOrder={(orderId) => table.handleStatusUpdate(orderId, "accepted")}
              handleRejectOrder={table.handleRejectOrder}
              handlePrintReceipt={table.handlePrintReceipt}
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
        show={table.showDeleteModal}
        handleClose={() => table.setShowDeleteModal(false)}
        handleConfirm={() => {
          handleStatusUpdate(table.orderToReject.id, "rejected");
          table.setShowDeleteModal(false);
        }}
        title="Potvrda brisanja"
        body={`Jeste li sigurni da želite odbiti ovu narudžbu?`}
        confirmLabel="Odbij"
        closeLabel="Nazad"
      />
      <ConfirmationModal
        show={table.showRemoveFromBlacklistModal}
        handleClose={() => table.setShowRemoveFromBlacklistModal(false)}
        handleConfirm={async () => {
          console.log("handleRemoveFromBlacklist");
          await table.handleRemoveFromBlacklist();
          table.setShowRemoveFromBlacklistModal(false);
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