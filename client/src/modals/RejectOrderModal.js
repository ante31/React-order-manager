import ConfirmationModal from "./Modal";

export default function RejectOrderModal({ table }) {
  if (!table.orderToReject) return null;

  return (
    <ConfirmationModal
      show={table.showRejectModal}
      handleClose={() => table.setShowRejectModal(false)}
      handleConfirm={() => {
        table.manageOrder(table.orderToReject.id, "rejected");
        table.setShowRejectModal(false);
      }}
      title="Potvrda odbijanja"
      body="Jeste li sigurni da želite odbiti ovu narudžbu?"
      confirmLabel="Odbij"
      closeLabel="Nazad"
    />
  );
}
