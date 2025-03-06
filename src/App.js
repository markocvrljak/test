import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

/*
check current position
check direction
find next position
find start
validate
check end
*/

function App() {

    const mapString = `  @---A---+
          |
  x-B-+   C
      |   |
      +---+`;

    const startChar = '@';
    const endChar = 'x';

    const mapArray = mapString
        .split('\n')
        .map(row =>
            row.split('')
        );

    console.log('map array', mapArray);

    function findStartPosition(array, start) {
        for (let row = 0; row < array.length; row++) {
            for (let col = 0; col < array[row].length; col++) {
                if (array[row][col] === start) {
                    return { row, col };
                }
            }
        }
        return null;
    };

    const [currentPosition, setNextPosition] = useState(() => findStartPosition(mapArray, startChar));

    const moves = {
        N: currentPosition.row - 1,
        S: currentPosition.row + 1,
        E: currentPosition.col + 1,
        W: currentPosition.col - 1,
    }


    console.log('start', currentPosition.col);

    return (
        <div>
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
                                        backgroundColor: rowIndex === currentPosition.row
                                            && cellIndex === currentPosition.col
                                            ? 'yellow' : 'white',
                                    }}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button>Start Walk</button>
        </div>
    );
}

export default App;
