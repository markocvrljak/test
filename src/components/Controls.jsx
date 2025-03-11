import React from 'react';

const Controls = ({ moveAccordingToPath }) => {
    return (
        <button onClick={moveAccordingToPath}>Move</button>
    );
};

export default Controls;
