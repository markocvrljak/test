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

    const onTurnsMap = `  @---A---+
          |
  x-B-+   |
      |   |
      +---C`;

    const startChar = '@';
    const endChar = 'x';

    const mapArray = onTurnsMap
        .split('\n')
        .map(row =>
            row.split('')
        );

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
    const [previousMove, setPreviousMove] = useState(null);

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
        // If the direction is the opposite of the previous direction, we don't allow that move
        if (previousMove) {
            if ((previousMove === 'up' && direction === 'down') ||
                (previousMove === 'down' && direction === 'up') ||
                (previousMove === 'left' && direction === 'right') ||
                (previousMove === 'right' && direction === 'left')) {
                console.log('Cannot go back in the opposite direction');
                return; // Prevent going back
            }
        }

        const newPosition = moves[direction];
        if (newPosition) {
            setNextPosition(newPosition);
            setPreviousMove(direction);  // Update the previous move
            setPath(prevPath => {
                const newPath = [...prevPath, mapArray[newPosition.row][newPosition.col]];
                // Check if the current position is a letter and add it to the letters state
                const currentChar = mapArray[newPosition.row][newPosition.col];
                if (validChars.letters.includes(currentChar)) {
                    setLetters(prevLetters => [...prevLetters, currentChar]);
                }
                return newPath;
            });
        }
    }

    const checkNextPosition = (currentPosition, mapArray) => {
        const { row, col } = currentPosition;

        // Check up character (row - 1)
        const upChar = row - 1 >= 0 ? mapArray[row - 1][col] : null;

        // Check down character (row + 1)
        const downChar = row + 1 < mapArray.length ? mapArray[row + 1][col] : null;

        // Check left character (col - 1)
        const leftChar = mapArray[row][col - 1];

        // Check right character (col + 1)
        const rightChar = mapArray[row][col + 1];

        setPossibleMoves({ up: upChar, down: downChar, left: leftChar, right: rightChar });

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

    // Function to check for a valid move and move accordingly
    const checkAndMove = (direction, char) => {
        if (possibleMoves[direction] === char) {
            move(direction);
            return true;
        }
        return false;
    };

    // Function to handle movement based on the path
    const moveAccordingToPath = () => {
        const currentChar = mapArray[currentPosition.row][currentPosition.col];

        // If current position is '-' (dash), avoid moving in the opposite direction
        if (currentChar === '-') {
            if (possibleMoves.right !== ' ' && possibleMoves.right !== null) {
                if (previousMove !== 'left') {
                    console.log('Moving right towards', possibleMoves.right);
                    move('right');
                    return;
                }
            }
        }

        // If we're on a pipe ('|'), prioritize moving up or down
        for (const direction of ['up', 'down']) {
            if (possibleMoves[direction] === '|') {
                if ((previousMove === 'up' && direction === 'down') || (previousMove === 'down' && direction === 'up')) {
                    console.log('Cannot go back in the opposite direction');
                    continue;
                }
                console.log(`Moving ${direction} towards pipe`);
                move(direction);
                return;
            }
        }

        // Check and move to letters (A-Z)
        for (const direction of ['right', 'down']) {
            if (validChars.letters.includes(possibleMoves[direction])) {
                console.log(`Found letter "${possibleMoves[direction]}", moving ${direction}`);
                move(direction);
                return;
            }
        }

        // Handle the '+' case: Move based on available pipes and dashes
        if (currentChar === '+') {
            if (checkAndMove('down', '|')) return;
            if (checkAndMove('up', '|')) return;
            if (checkAndMove('left', '-')) return;
            if (checkAndMove('right', '-')) return;
        }

        // Check remaining moves with priority for dashes
        if (checkAndMove('right', '-')) return;
        if (checkAndMove('up', '+')) return;
        if (checkAndMove('down', '+')) return;
        if (checkAndMove('left', '+')) return;
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
            <div>
                <h3>Path Taken:</h3>
                <p>{path.join(' → ')}</p>
            </div>
            <div>
                <h3>Collected Letters:</h3>
                <p>{letters.join(', ')}</p>
            </div>
            <button onClick={moveAccordingToPath}>Start Walk</button>
            <button onClick={() => checkNextPosition(currentPosition, mapArray)}>Check next move</button>
            <button onClick={() => move('right')}>Move Left</button>
        </div>
    );
}

export default App;
