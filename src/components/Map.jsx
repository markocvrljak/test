import React from 'react';

const MapDisplay = ({ mapArray, currentPosition }) => {
    return (
        <table style={{ borderCollapse: 'collapse', width: '50%', margin: '20px auto', border: '1px solid black' }}>
            <tbody>
                {mapArray.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td
                                key={cellIndex}
                                style={{
                                    border: '1px solid black',
                                    padding: '8px',
                                    textAlign: 'center',
                                    backgroundColor: rowIndex === currentPosition.row && cellIndex === currentPosition.col ? 'yellow' : 'white',
                                }}
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MapDisplay;
