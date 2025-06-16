import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { backendUrl } from '../localhostConf';
import { safeFetch } from '../services/safeFetch';

const StartModal = ({ show, handleClose }) => {
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Password:', password);
        if (password === '') {
            setError('Unesite lozinku');
            return;
        }
          safeFetch(`${backendUrl}/auth/login/${password}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error('Failed to login');
              }
            })
            .then((data) => {
              console.log(data.message); // "Login successful"
              handleClose();
            })
            .catch((error) => {
              console.error('Error:', error.message); // Handle errors (e.g., "Incorrect password")
              setError('Pogrešna lozinka');
            }
        );
        
    }
    return (
        <Modal show={show} centered>
            <Modal.Body>
                <Row className="justify-content-md-center">
                    <Col xs={12} md={12}>
                    <h2 className="text-center mb-4">Prijava</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Control
                            type="password"
                            placeholder="Lozinka"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={error !== ''}
                        />
                        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Počni
                        </Button>
                    </Form>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};
StartModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.node.isRequired,
    confirmLabel: PropTypes.string.isRequired,
    closeLabel: PropTypes.string.isRequired,
    error: PropTypes.string
};

export default StartModal;
