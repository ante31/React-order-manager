import ConfirmationModal from "./Modal";

export default function RemoveFromBlacklistModal({ table }) {
  return (
    <ConfirmationModal
      show={table.showRemoveModal}
      handleClose={() => table.setShowRemoveModal(false)}
      handleConfirm={table.removeFromBlacklist}
      title="Uklanjanje s liste"
      body="Jeste li sigurni da želite ukloniti gosta s liste?"
      confirmLabel="Ukloni"
      closeLabel="Nazad"
    />
  );
}
