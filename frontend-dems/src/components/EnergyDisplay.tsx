import React from 'react';

// Define a type for the component props
type EnergyDisplayProps = {
    title: string;
    value: number | string;  // Allow both number and string to accommodate various formats
    unit: string;
    color: string;
};

const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ title, value, unit, color }) => {
    return (
        <div style={{
            border: `2px solid ${color}`,
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            margin: '10px',
            minWidth: '200px'
        }}>
            <h3>{title}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>
                {value} {unit}
            </p>
        </div>
    );
};

export default EnergyDisplay;
