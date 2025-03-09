import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

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
        letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        start: startChar,
        end: endChar,
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
        const possibleMoves = getPossibleMoves(currentPosition, mapArray);

        // Validate possible moves
        let validMoves = validatePossibleMoves(possibleMoves);

        // Remove the backtracking move if applicable
        validMoves = removeBacktrackingMove(validMoves);

        // Set the final valid moves
        setPossibleMoves(validMoves);
    };

    // Function to validate possible moves based on valid characters
    const validatePossibleMoves = (possibleMoves) => {
        const validSet = Object.values(validChars).flat();

        return Object.fromEntries(
            Object.entries(possibleMoves).map(([k, v]) => [k, validSet.includes(v) && v])
        );
    };

    // Function to remove the backtracking move based on the previous move
    const removeBacktrackingMove = (validMoves) => {
        const opposite = {
            up: "down",
            down: "up",
            left: "right",
            right: "left"
        };

        if (previousMove && opposite[previousMove]) {
            validMoves[opposite[previousMove]] = false;
        }

        return validMoves;
    };

    // Function to get possible moves based on the current position
    const getPossibleMoves = (currentPosition, mapArray) => {
        const { row, col } = currentPosition;

        return {
            up: row - 1 >= 0 ? mapArray[row - 1][col] : null,
            down: row + 1 < mapArray.length ? mapArray[row + 1][col] : null,
            left: mapArray[row][col - 1],
            right: mapArray[row][col + 1],
        };
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

    // Function to check if the coordinates have already been visited
    const isRevisitedPosition = (newPosition) => {
        return path.some(position => position.row === newPosition.row && position.col === newPosition.col);
    };

    const moveAccordingToPath = () => {
        const currentChar = mapArray[currentPosition.row][currentPosition.col];

        // Try to move based on predefined movement priorities
        if (attemptMoveByPriority()) {
            console.log('attemptMoveByPriority');
            console.log('possibleMoves', possibleMoves);
            console.log('previousMove', previousMove);
            return;
        };

        // Check if we should move based on previous move and current position
        if (keepMovementDirection(currentChar)) {
            console.log('keepMovementDirection');
            console.log('possibleMoves', possibleMoves);
            console.log('previousMove', previousMove);
            return;
        };

        // Handle specific case where previous move was down and current position is dash
        if (previousMove === 'down' && currentChar === validChars.dash) {
            continueOnIntersection(currentChar);
            console.log('continueOnIntersection');
            console.log('possibleMoves', possibleMoves);
            console.log('previousMove', previousMove);
            return;
        }

        // Try to move according to valid letters in possible moves
        if (lettersOnTurns()) {
            console.log('lettersOnTurns');
            console.log('possibleMoves', possibleMoves);
            console.log('previousMove', previousMove);
            return;
        };
    };

    // Check if we should move based on previous move and current position
    const keepMovementDirection = (currentChar) => {
        const moveMap = {
            down: validChars.pipe,
            up: validChars.pipe,
            right: validChars.dash,
            left: validChars.dash
        };

        if (moveMap[previousMove] === currentChar) {
            console.log(`Previous move was ${previousMove}, moving ${previousMove} from char ${currentChar}`);
            changePositionAndCollectPath(previousMove);
            return true;
        }
        return false;
    };

    // Handle dash movement after a down move
    const continueOnIntersection = () => {
        for (const direction of ['right', 'left', 'up', 'down']) {
            if (possibleMoves[direction] === validChars.dash && isRevisitedPosition(moves[direction])) {
                console.log('Revisiting dash, moving down to avoid loop');
                changePositionAndCollectPath(direction);  // Avoid revisiting the dash
                return;
            }
        }
        console.log('Previous move was down, moving down');
        changePositionAndCollectPath('down');
    };

    // Handle movement when encountering letters
    const lettersOnTurns = () => {
        for (const direction of ['right', 'down', 'up', 'left']) {
            if (validChars.letters.includes(possibleMoves[direction])) {
                console.log(`Found letter "${possibleMoves[direction]}", moving ${direction}`);
                changePositionAndCollectPath(direction);
                return true;
            }
        }
        return false;
    };

    // Try to move according to predefined movement priorities
    const attemptMoveByPriority = () => {
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

    // console.log('possibleMoves', possibleMoves);
    // console.log('currentPosition', currentPosition);
    // console.log('previousMove', previousMove);

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
