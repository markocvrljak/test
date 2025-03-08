import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

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
    const [possibleMoves, setPossibleMoves] = useState({ up: false, down: false, left: false, right: false });

    const [path, setPath] = useState([]);
    const [letters, setLetters] = useState([]);

    const validChars = {
        dash: '-',
        plus: '+',
        pipe: '|',
        space: ' ',
        start: startChar,
        end: endChar,
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    }

    const moves = {
        up: { row: currentPosition.row - 1, col: currentPosition.col },
        down: { row: currentPosition.row + 1, col: currentPosition.col },
        left: { row: currentPosition.row, col: currentPosition.col - 1 },
        right: { row: currentPosition.row, col: currentPosition.col + 1 },
    }

    const move = (direction) => {
        switch (direction) {
            case 'up':
                setNextPosition(moves.up);
                break;
            case 'down':
                setNextPosition(moves.down);
                break;
            case 'left':
                setNextPosition(moves.left);
                break;
            case 'right':
                setNextPosition(moves.right);
                break;
            default:
                break;
        }
    }

    const checkNextPosition = (currentPosition, mapArray) => {
        const { row, col } = currentPosition;

        // Check up character (row - 1)
        const upChar = row - 1 >= 0 ? mapArray[row - 1][col] : null;
        // setPossibleMoves({ ...possibleMoves, up: upChar });

        // Check down character (row + 1)
        const downChar = row + 1 < mapArray.length ? mapArray[row + 1][col] : null;

        // Check left character (col - 1)
        const leftChar = mapArray[row][col - 1];
        // setPossibleMoves({ ...possibleMoves, left: leftChar });

        // Check right character (col + 1)
        const rightChar = mapArray[row][col + 1];
        // setPossibleMoves({ ...possibleMoves, right: rightChar });
        setPossibleMoves({ up: upChar, down: downChar, left: leftChar, right: rightChar })

        console.log('up char', upChar);
        console.log('down char', downChar);
        console.log('left char', leftChar);
        console.log('right char', rightChar);
    };

    useEffect(() => {
        checkNextPosition(currentPosition, mapArray);
    }, [currentPosition]);


    console.log('current position', currentPosition.row, currentPosition.col);
    console.log('char on current position', mapArray[currentPosition.row][currentPosition.col]);

    console.log('possible moves', possibleMoves);

    const bla = (possibleMoves) => {
        for (const direction in possibleMoves) {
            if (possibleMoves[direction] === '-') {
                console.log('dash');
                move('right')
                return; // Exit once a dash is found
            }
        }
    };

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
            <button onClick={() => bla(possibleMoves)}>Start Walk</button>
            <button onClick={() => checkNextPosition(currentPosition, mapArray)}>Check next move</button>
            <button onClick={() => move('right')}>Move Left</button>

        </div>
    );
}

export default App;