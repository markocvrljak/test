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

    const sameLocationMap = `     +-O-N-+
     |     |
     |   +-I-+
 @-G-O-+ | | |
     | | +-+ E
     +-+     S
             |
             x`;

    const startChar = '@';
    const endChar = 'x';

    const mapArray = intersectionsMap.split('\n').map(row => row.split(''));

    const [currentPosition, setCurrentPosition] = useState(() => findStartPosition(mapArray, startChar));
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

    // Helper function to find the start position in the map
    function findStartPosition(array, startChar) {
        for (let row = 0; row < array.length; row++) {
            for (let col = 0; col < array[row].length; col++) {
                if (array[row][col] === startChar) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Calculate possible moves based on the current position
    const checkNextPosition = (currentPosition, mapArray) => {
        const { row, col } = currentPosition;
        const upChar = row - 1 >= 0 ? mapArray[row - 1][col] : null;
        const downChar = row + 1 < mapArray.length ? mapArray[row + 1][col] : null;
        const leftChar = mapArray[row][col - 1];
        const rightChar = mapArray[row][col + 1];

        setPossibleMoves({ up: upChar, down: downChar, left: leftChar, right: rightChar });
    };

    // Check and move if the direction matches valid character
    const move = (direction) => {
        if (previousMove) {
            // Prevent moving back in the opposite direction
            if (
                (previousMove === 'up' && direction === 'down') ||
                (previousMove === 'down' && direction === 'up') ||
                (previousMove === 'left' && direction === 'right')
            ) {
                console.log('Cannot go back in the opposite direction!');
                move('left'); // Default to a safe direction
                return;
            }
        }

        const newPosition = moves[direction];
        if (newPosition) {
            setCurrentPosition(newPosition);
            setPreviousMove(direction);
            setPath(prevPath => {
                const newPath = [...prevPath, mapArray[newPosition.row][newPosition.col]];
                const currentChar = mapArray[newPosition.row][newPosition.col];

                // Update letters state if we encounter a new letter
                if (validChars.letters.includes(currentChar)) {
                    setLetters(prevLetters => {
                        if (!prevLetters.includes(currentChar)) {
                            return [...prevLetters, currentChar];
                        }
                        return prevLetters;
                    });
                }

                return newPath;
            });
        }
    };

    const moves = {
        up: { row: currentPosition.row - 1, col: currentPosition.col },
        down: { row: currentPosition.row + 1, col: currentPosition.col },
        left: { row: currentPosition.row, col: currentPosition.col - 1 },
        right: { row: currentPosition.row, col: currentPosition.col + 1 },
    };

    useEffect(() => {
        checkNextPosition(currentPosition, mapArray);
    }, [currentPosition]);

    const checkAndMove = (direction, char) => {
        if (possibleMoves[direction] === char) {
            move(direction);
            return true;
        }
        return false;
    };

    const moveAccordingToPath = () => {
        const currentChar = mapArray[currentPosition.row][currentPosition.col];

        // Handle specific conditions based on the current character
        if (currentChar === '-') {
            if (possibleMoves.right !== ' ' && possibleMoves.right !== null && previousMove !== 'left') {
                console.log('Moving right');
                move('right');
                return;
            }
        }

        for (const direction of ['up', 'down', 'left', 'right']) {
            if (possibleMoves[direction] === '|') {
                if (previousMove === 'up' && direction === 'down' || previousMove === 'down' && direction === 'up') {
                    console.log('Cannot go back in the opposite direction');
                    move('left');
                    continue;
                }
                console.log(`Moving ${direction} towards pipe`);
                move(direction);
                return;
            }
        }

        for (const direction of ['right', 'down', 'left']) {
            if (validChars.letters.includes(possibleMoves[direction])) {
                console.log(`Found letter "${possibleMoves[direction]}", moving ${direction}`);
                move(direction);
                return;
            }
        }

        // Handle movement based on the '+' character
        if (currentChar === '+') {
            if (checkAndMove('down', '|') || checkAndMove('up', '|') || checkAndMove('left', '-') || checkAndMove('right', '-')) return;
        }

        // Default movement priorities
        if (checkAndMove('right', '-') || checkAndMove('left', '-') || checkAndMove('up', '+') || checkAndMove('down', '+')) return;
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
            <div>
                <h3>Path Taken:</h3>
                <p>{path.join(' → ')}</p>
            </div>
            <div>
                <h3>Collected Letters:</h3>
                <p>{letters.join(', ')}</p>
            </div>
            <button onClick={moveAccordingToPath}>Move</button>
        </div>
    );
}

export default App;
