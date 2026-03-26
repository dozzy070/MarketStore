import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { checkBackendHealth } from '../services/api';
import { FaExclamationTriangle, FaCheckCircle, FaSync } from 'react-icons/fa';

function BackendStatus() {
  const [status, setStatus] = useState({ available: null, checking: true });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatus({ ...status, checking: true });
    const result = await checkBackendHealth();
    setStatus({ 
      available: result.available, 
      checking: false,
      error: result.error 
    });
  };

  if (status.checking) {
    return (
      <Alert variant="info" className="mb-3">
        <Spinner animation="border" size="sm" className="me-2" />
        Checking backend connection...
      </Alert>
    );
  }

  if (!status.available) {
    return (
      <Alert variant="warning" className="mb-3">
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2 text-warning" />
          <div className="flex-grow-1">
            <strong>Backend connection issue:</strong> Cannot connect to server. 
            Please ensure backend is running on port 5000.
          </div>
          <Button 
            variant="outline-warning" 
            size="sm" 
            onClick={checkStatus}
            className="ms-3"
          >
            <FaSync className="me-1" /> Retry
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Alert variant="success" className="mb-3">
      <div className="d-flex align-items-center">
        <FaCheckCircle className="me-2 text-success" />
        <span>Connected to backend server</span>
      </div>
    </Alert>
  );
}

export default BackendStatus;