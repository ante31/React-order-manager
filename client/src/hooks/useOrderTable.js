import { useState, useCallback } from "react";
import { backendUrl } from "../localhostConf";
import { safeFetch } from "../services/safeFetch";
import { generateReceipt } from "../services/generateReceipt";

export function useOrderTable({ handleStatusUpdate, fetchData, fetchAnnotations }) {
  const [orderToReject, setOrderToReject] = useState(null);
  const [numberToRemoveFromBlacklist, setNumberToRemoveFromBlacklist] = useState("");
  const [showRemoveFromBlacklistModal, setShowRemoveFromBlacklistModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openRow, setOpenRow] = useState(null);

  const toggleCollapse = useCallback((index) => {
    setOpenRow((prevOpenRow) => (prevOpenRow === index ? null : index));
  }, []);

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

  return {
    orderToReject,
    showDeleteModal,
    setShowDeleteModal,
    toggleCollapse,
    openRow,
    setOpenRow,
    showRemoveFromBlacklistModal,
    handleRejectOrder,
    handleStatusUpdate,
    handlePrintReceipt,
    setShowRemoveFromBlacklistModal,
    setNumberToRemoveFromBlacklist,
    handleRemoveFromBlacklist,
  };
}