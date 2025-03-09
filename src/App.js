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

    const ignoreAfterEndMap = `  @-A--+
       |
       +-B--x-C--D`;

    const startChar = '@';
    const endChar = 'x';

    const mapArray = intersectionsMap.split('\n').map(row => row.split(''));

    const [currentPosition, setCurrentPosition] = useState(() => findStartPosition(mapArray, startChar));
    const [possibleMoves, setPossibleMoves] = useState({ up: false, down: false, left: false, right: false });
    const [path, setPath] = useState([]);
    const [letters, setLetters] = useState([]);
    const [previousMove, setPreviousMove] = useState(null);

    useEffect(() => {
        checkNextPosition(currentPosition, mapArray);
    }, [currentPosition]);

    const validChars = {
        dash: '-',
        plus: '+',
        pipe: '|',
        start: startChar,
        end: endChar,
        letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    };

    const moves = {
        up: { row: currentPosition.row - 1, col: currentPosition.col },
        down: { row: currentPosition.row + 1, col: currentPosition.col },
        left: { row: currentPosition.row, col: currentPosition.col - 1 },
        right: { row: currentPosition.row, col: currentPosition.col + 1 },
    };

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

        const possibleMoves = {
            up: row - 1 >= 0 ? mapArray[row - 1][col] : null,
            down: row + 1 < mapArray.length ? mapArray[row + 1][col] : null,
            left: mapArray[row][col - 1],
            right: mapArray[row][col + 1],
        }

        // Validate possible moves
        let validMoves = validatePossibleMoves(possibleMoves);

        // Map previousMove to its opposite direction
        const opposite = {
            up: "down",
            down: "up",
            left: "right",
            right: "left"
        };

        // Remove the backtracking move
        if (previousMove && opposite[previousMove]) {
            validMoves[opposite[previousMove]] = false;
        }

        setPossibleMoves(validMoves);
    };

    const validatePossibleMoves = (possibleMoves) => {
        const validSet = Object.values(validChars).flat();

        return Object.fromEntries(
            Object.entries(possibleMoves).map(([k, v]) => [k, validSet.includes(v) && v])
        );
    };

    // Calculate and set movement directions
    const changePositionAndCollectPath = (direction) => {
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

    const checkAndMove = (direction, char) => {
        if (possibleMoves[direction] === char) {
            changePositionAndCollectPath(direction);
            return true;
        }
        return false;
    };

    const moveAccordingToPath = () => {
        const currentChar = mapArray[currentPosition.row][currentPosition.col];

        // First try to move according to the move priorities
        if (attemptMovementByPriority()) return;

        // Handle dash movement
        if (currentChar === validChars.dash) {
            if (moveDash()) return;
        }

        // Handle pipe movement
        if (movePipe()) return;

        // Handle letter movement
        if (moveLetters()) return;

        // Handle plus intersection movement
        if (currentChar === validChars.plus) {
            if (movePlusIntersection()) return;
        }
    };

    // Function to handle movement based on the movement priority
    const attemptMovementByPriority = () => {
        const movePriority = [
            ["right", "left"].map(direction => ({ direction, char: validChars.dash })),
            ["up", "down"].map(direction => ({ direction, char: validChars.pipe })),
            ["up", "down", "right", "left"].map(direction => ({ direction, char: validChars.plus })),
            ["up", "down", "right", "left"].map(direction => ({ direction, char: validChars.letters })),
        ].flat();

        for (const { direction, char } of movePriority) {
            if (checkAndMove(direction, char)) return true;
        }
        return false;
    };

    // Function to handle dash movement
    const moveDash = () => {
        if (possibleMoves.right !== false && possibleMoves.right !== null) {
            console.log('Moving right');
            changePositionAndCollectPath('right');
            return true;
        }
        if (possibleMoves.left !== false && possibleMoves.left !== null) {
            console.log('Moving left');
            changePositionAndCollectPath('left');
            return true;
        }
        return false;
    };

    // Function to handle pipe movement
    const movePipe = () => {
        for (const direction of ['up', 'down']) {
            if (possibleMoves[direction] === validChars.pipe) {
                if (previousMove === 'up' && direction === 'down' || previousMove === 'down' && direction === 'up') {
                    console.log('Cannot go back in the opposite direction');
                    changePositionAndCollectPath('left'); // Move safely
                    return true;
                }
                console.log(`Moving ${direction} towards pipe`);
                changePositionAndCollectPath(direction);
                return true;
            }
        }
        return false;
    };

    // Function to handle movement when a letter is found
    const moveLetters = () => {
        for (const direction of ['right', 'down', 'up', 'left']) {
            if (validChars.letters.includes(possibleMoves[direction])) {
                console.log(`Found letter "${possibleMoves[direction]}", moving ${direction}`);
                changePositionAndCollectPath(direction);
                return true;
            }
        }
        return false;
    };

    // Function to handle movement at plus intersections
    const movePlusIntersection = () => {
        if (possibleMoves.right === '-' || possibleMoves.left === '-') {
            if (possibleMoves.right === '-') return changePositionAndCollectPath('right');
            if (possibleMoves.left === '-') return changePositionAndCollectPath('left');
        }
        if (possibleMoves.up === '|') return changePositionAndCollectPath('up');
        if (possibleMoves.down === '|') return changePositionAndCollectPath('down');
        return false;
    };


    console.log('possibleMoves', possibleMoves);
    console.log('currentPosition', currentPosition);
    console.log('previousMove', previousMove);

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
