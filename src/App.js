import './App.css';
import { useState, useEffect, useRef } from 'react';

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

    const mapArray = intersectionsMap.split('\n').map(row => row.split(''));

    const startChar = '@';
    const endChar = 'x';

    const validChars = {
        dash: '-',
        plus: '+',
        pipe: '|',
        letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        start: startChar,
        end: endChar,
    };

    const [currentPosition, setCurrentPosition] = useState(() => findStartPosition(mapArray, startChar));
    const [possibleMoves, setPossibleMoves] = useState({ up: false, down: false, left: false, right: false });
    const [path, setPath] = useState([]);
    const [letters, setLetters] = useState([]);
    const [previousMove, setPreviousMove] = useState(null);

    const moves = {
        up: { row: currentPosition.row - 1, col: currentPosition.col },
        down: { row: currentPosition.row + 1, col: currentPosition.col },
        left: { row: currentPosition.row, col: currentPosition.col - 1 },
        right: { row: currentPosition.row, col: currentPosition.col + 1 },
    };

    useEffect(() => {
        // Run only on initial render to load the map
        loadMap();
    }, []);

    useEffect(() => {
        // Run whenever currentPosition changes
        handleNextPossibleMoves(currentPosition, mapArray);
    }, [currentPosition]);

    useEffect(() => {
        // Check if all values in possibleMoves are falsy (null, false, undefined)
        const allFalsy = Object.values(possibleMoves).every(value => !value);

        // Log only if not all properties are falsy
        if (!allFalsy) {
            console.log(`Next Possible New Moves:`, possibleMoves);
        }
    }, [JSON.stringify(possibleMoves)]); // Using JSON.stringify to detect changes in object

    const initialLogTriggered = useRef(false);

    const loadMap = () => {
        const startPos = findStartPosition(mapArray, validChars.start);

        if (startPos) {
            setCurrentPosition(startPos);

            const initialMoves = getValidMovement(startPos, mapArray);
            const validMoves = validatePossibleMoves(initialMoves);
            const finalMoves = removeBacktrackingMove(validMoves);

            setPossibleMoves(finalMoves);

            // Log the possible moves only once (on initial load)
            if (!initialLogTriggered.current) {
                console.log(`Initial possible moves:`, finalMoves);
                initialLogTriggered.current = true;
            }
        }
    };

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

    // Find possible moves based on the current position
    const handleNextPossibleMoves = (currentPosition, mapArray) => {
        const allPossibleMoves = getValidMovement(currentPosition, mapArray);
        const validMoves = validatePossibleMoves(allPossibleMoves);
        const finalMoves = removeBacktrackingMove(validMoves);

        setPossibleMoves(finalMoves);
    };

    // Get possible moves based on the current position
    const getValidMovement = (currentPosition, mapArray) => {
        const { row, col } = currentPosition;

        return {
            up: row - 1 >= 0 ? mapArray[row - 1][col] : null,
            down: row + 1 < mapArray.length ? mapArray[row + 1][col] : null,
            left: mapArray[row][col - 1],
            right: mapArray[row][col + 1],
        };
    };

    // Validate possible moves based on valid characters
    const validatePossibleMoves = (possibleMoves) => {
        const validSet = Object.values(validChars).flat();

        return Object.fromEntries(
            Object.entries(possibleMoves).map(([k, v]) => [k, validSet.includes(v) && v])
        );
    };

    // Remove the backtracking move based on the previous move
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

    // Calculate and update the new position and path based on movement directions
    const changePositionAndCollectPath = (direction, source) => {
        const newPosition = moves[direction];
        const currentChar = mapArray[newPosition.row][newPosition.col];

        console.log(`running [${source}] from last position ...moving...`);
        console.log(`Direction:`, direction);
        console.log(`Current position:`, currentChar ?? "@");

        if (newPosition) {
            setCurrentPosition(newPosition);
            setPreviousMove(direction);

            setPath(prevPath => {
                const newPath = [...prevPath, currentChar];

                if (!initialLogTriggered.current) {
                    console.log(`New Position:`, newPosition);

                    console.log(`[${source}] Updated Path:`, newPath);
                    console.log(`[${source}] Current Character:`, currentChar);
                    initialLogTriggered.current = true;
                }

                // Update letters state if we encounter a new letter
                if (validChars.letters.includes(currentChar)) {
                    setLetters(prevLetters => {
                        if (!prevLetters.includes(currentChar)) {
                            if (!initialLogTriggered.current) {
                                console.log(`[${source}] Found Letter:`, currentChar);
                                initialLogTriggered.current = true;
                            }
                            return [...prevLetters, currentChar];
                        }
                        return prevLetters;
                    });
                }

                return newPath;
            });
        } else {
            console.log(`[${source}] Invalid move, position not updated`);
        }
    };

    // Check if the coordinates have already been visited
    const isRevisitedPosition = (newPosition) => {
        return path.some(position => position.row === newPosition.row && position.col === newPosition.col);
    };

    // Main function to determine the next move and how to proceed
    const moveAccordingToPath = () => {
        const currentChar = mapArray[currentPosition.row][currentPosition.col];

        // Handle specific case where previous move was up or down and current position is dash
        if ((['down', 'up'].includes(previousMove)) && currentChar === validChars.dash) {
            continueOnIntersection(currentChar);
            return;
        }

        // Check if we should move based on previous move and current position character
        if (shouldMoveBasedOnPreviousMove(currentChar)) return;

        // Try to move based on predefined movement priorities and next possible moves
        if (attemptMoveByPriority()) return;
    };

    // Handle specific case where previous move was up or down and current position is dash
    const continueOnIntersection = () => {
        for (const direction of ['right', 'left', 'up', 'down']) {
            if (possibleMoves[direction] === validChars.dash && isRevisitedPosition(moves[direction])) {
                console.log('Revisiting dash, moving down to avoid loop');
                changePositionAndCollectPath(direction, "continueOnIntersection");
                return;
            }
        }
        console.log('Previous move was down, moving down');
        changePositionAndCollectPath('down', "continueOnIntersection");
    };

    // Check if we should move based on previous move and current position character
    const shouldMoveBasedOnPreviousMove = (currentChar) => {
        const moveMap = {
            down: validChars.pipe,
            up: validChars.pipe,
            right: validChars.dash,
            left: validChars.dash
        };

        if (moveMap[previousMove] === currentChar) {
            console.log(`Previous move was ${previousMove}, moving ${previousMove}`);
            changePositionAndCollectPath(previousMove, "shouldMoveBasedOnPreviousMove");
            return true;
        }
        return false;
    };

    // Try to move based on predefined movement priorities and next possible moves
    const attemptMoveByPriority = () => {
        const movePriority = [
            ["right", "left"].map(direction => ({ direction, char: validChars.dash })),
            ["up", "down"].map(direction => ({ direction, char: validChars.pipe })),
            ["up", "down", "right", "left"].map(direction => ({ direction, char: validChars.plus })),
            ["up", "down", "right", "left"].map(direction => ({ direction, char: validChars.letters })),
        ].flat();

        for (const { direction, char } of movePriority) {
            if (possibleMoves[direction] === char) {
                changePositionAndCollectPath(direction, "attemptMoveByPriority");
                return true;
            }
        }
        return false;
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