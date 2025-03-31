import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, handleClose, handleConfirm, title, body, confirmLabel, closeLabel=null, error }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
                {error && <div className="text-danger mt-3">{error}</div>}
            </Modal.Body>
            <Modal.Footer>
                {closeLabel && <Button variant="secondary" onClick={handleClose}>{closeLabel}</Button>}
                <Button variant="danger" onClick={handleConfirm}>
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
ConfirmationModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.node.isRequired,
    confirmLabel: PropTypes.string.isRequired,
    closeLabel: PropTypes.string.isRequired,
    error: PropTypes.string
};

export default ConfirmationModal;
