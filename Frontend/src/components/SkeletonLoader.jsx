import React from 'react';
import { Placeholder, Card, Row, Col } from 'react-bootstrap';

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <Card className="border-0 shadow-sm h-100">
    <div className="bg-light" style={{ height: '200px', width: '100%' }} />
    <Card.Body>
      <Placeholder as={Card.Title} animation="glow">
        <Placeholder xs={6} /> <Placeholder xs={4} />
      </Placeholder>
      <Placeholder as={Card.Text} animation="glow">
        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />
      </Placeholder>
      <Placeholder.Button variant="primary" xs={6} />
    </Card.Body>
  </Card>
);

// Stats Card Skeleton
export const StatCardSkeleton = () => (
  <Card className="border-0 shadow-sm">
    <Card.Body>
      <div className="d-flex align-items-center">
        <Placeholder className="bg-light rounded-circle me-3" style={{ width: '48px', height: '48px' }} />
        <div style={{ flex: 1 }}>
          <Placeholder animation="glow">
            <Placeholder xs={4} /> <Placeholder xs={6} />
          </Placeholder>
        </div>
      </div>
    </Card.Body>
  </Card>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {[...Array(columns)].map((_, i) => (
      <td key={i}>
        <Placeholder animation="glow">
          <Placeholder xs={12} />
        </Placeholder>
      </td>
    ))}
  </tr>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <Card className="mb-3 border-0 shadow-sm">
    <Card.Body>
      <Placeholder animation="glow">
        <Placeholder xs={6} className="mb-2" />
        <Placeholder xs={4} className="mb-2" />
        <Placeholder xs={8} />
      </Placeholder>
    </Card.Body>
  </Card>
);

// Settings Section Skeleton
export const SettingsSkeleton = () => (
  <Card className="border-0 shadow-sm">
    <Card.Body>
      <Placeholder animation="glow">
        <Placeholder xs={4} className="mb-4" />
        {[...Array(5)].map((_, i) => (
          <Placeholder key={i} xs={12} className="mb-3" />
        ))}
      </Placeholder>
    </Card.Body>
  </Card>
);