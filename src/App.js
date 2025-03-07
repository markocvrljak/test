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

    const basicMap = `  @---A---+
          |
  x-B-+   C
      |   |
      +---+`;


    const intersectionsMap = `  @
  | +-C--+
  A |    |
  +---B--+
    |      x
    |      |
    +---D--+`;

    const startChar = '@';
    const endChar = 'x';

    const mapArray = basicMap
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

    const validChars = {
        dash: '-',
        plus: '+',
        pipe: '|',
        space: ' ',
        start: startChar,
        end: endChar,
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    }

    // const chars = {
    //     N: mapArray[moves.N][currentPosition.col],
    //     S: mapArray[moves.S][currentPosition.col],
    //     E: mapArray[currentPosition.row][moves.E],
    //     W: mapArray[currentPosition.row][moves.W],
    // }

    const moves = {
        up: { row: currentPosition.row - 1, col: currentPosition.col },
        down: { row: currentPosition.row + 1, col: currentPosition.col },
        left: { row: currentPosition.row, col: currentPosition.col - 1 },
        right: { row: currentPosition.row, col: currentPosition.col + 1 },
    }


    console.log('current position', currentPosition.row, currentPosition.col);
    console.log('char on current position', mapArray[currentPosition.row][currentPosition.col]);

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
            <button onClick={() => setNextPosition(moves.down)}>Start Walk</button>
        </div>
    );
}

export default App;
