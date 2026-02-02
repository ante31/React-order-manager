import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'react-bootstrap';
import { backendUrl } from '../localhostConf';
import { safeFetch } from '../services/safeFetch';

const AddToListModal = ({ show, handleClose, title, error, defaultName = '', defaultPhone = '', fetchData, fetchAnnotations }) => {
    const [formData, setFormData] = useState({
        name: defaultName,
        phone: defaultPhone,
        severity: 'low',
        reason: ''
    });

    const handleSubmit = async () => {
    try {
      const response = await safeFetch(`${backendUrl}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add to blacklist');
      }

      const data = await response.json();
      console.log('Successfully added:', data);
      handleClose();
      fetchData();
      fetchAnnotations();
      // Optionally reset form or show confirmation
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

    useEffect(() => {
        // Reset or update the form when modal opens or props change
        if (show) {
            setFormData({
                name: defaultName,
                phone: defaultPhone,
                severity: 'low',
                reason: ''
            });
        }
    }, [show, defaultName, defaultPhone]);

    console.log("FORM DATA", formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(formData);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Ime i prezime</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Telefon</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Razina</Form.Label>
                        <Form.Select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                        >
                            <option value="low">Naputak sebi (zelena)</option>
                            <option value="medium">Upozorenje (žuta)</option>
                            <option value="high">Crna lista (crvena)</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Razlog</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={3}
                        />
                    </Form.Group>

                    {error && <div className="text-danger">{error}</div>}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Zatvori
                    </Button>
                    <Button variant="danger" type="submit">
                        Dodaj na listu
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

AddToListModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    error: PropTypes.string,
    defaultName: PropTypes.string,
    defaultPhone: PropTypes.string
};

export default AddToListModal;
