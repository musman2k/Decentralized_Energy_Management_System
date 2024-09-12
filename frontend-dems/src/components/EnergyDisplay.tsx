import React from 'react';

type EnergyDisplayProps = {
    title: string;
    value: number | string;  
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
