import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
    const basicMap = `  @---A---+
          |
  x-B-+   C
      |   |
      +---+`;

    const intersectionsMapDash = `  @
  | +-C--+
  A |    |
  +---B--+
    |      x
    |      |
    +---D--+`;

    // fix moving from + to letter
    const intersectionsMapDashReverse = `  x 
  | +-C--+
  A |    |
  +---B--+
    |      @
    |      |
    +---D--+`;

    const intersectionsMapPipe = `  @
  |
  A
  +-+
    |
  x-|-+
    +-+`;

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

    const mapArray = intersectionsMapDashReverse.split('\n').map(row => row.split(''));

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
    const [previousMove, setPreviousMove] = useState(null);

    const [path, setPath] = useState([]);
    const [letters, setLetters] = useState([]);

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
        isRevisitedPosition(currentPosition);
    }, [currentPosition]);

    useEffect(() => {
        // Check if all values in possibleMoves are falsy
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

            // Set next possible moves and log the initial moves only once (on initial render/load)
            if (!initialLogTriggered.current) {
                console.log(`Initial possible moves:`, handleNextPossibleMoves(startPos, mapArray));
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
        const validMovesDirty = validatePossibleMoves(allPossibleMoves);
        // console.log(`validMovesDirty:`, validMovesDirty);

        const validMovesClean = removeBacktrackingMove(validMovesDirty);
        // console.log(`validMovesClean:`, validMovesClean);

        setPossibleMoves(validMovesClean);

        return validMovesClean;
    };

    // Get possible moves based on the current position
    const getValidMovement = (currentPosition, mapArray) => {
        const { row, col } = currentPosition;

        return {
            up: row - 1 >= 0 ? mapArray[row - 1][col] : null,
            down: row + 1 < mapArray.length ? mapArray[row + 1][col] : null,
            left: col - 1 >= 0 ? mapArray[row][col - 1] : null,
            right: col + 1 < mapArray[row].length ? mapArray[row][col + 1] : null,
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

        if (newPosition) {
            setCurrentPosition(newPosition);
            setPreviousMove(direction);

            setPath(prevPath => {
                const newPath = [...prevPath, { row: newPosition.row, col: newPosition.col }]; // Store the coordinates
                return newPath;
            });
        } else {
            console.log(`[${source}] Invalid move, position not updated`);
        }
    };


    // Main function to determine the next move and how to proceed
    const moveAccordingToPath = () => {
        const currentChar = mapArray[currentPosition.row][currentPosition.col];

        // Handle specific case where previous move was up or down and current position is dash
        if ((['down', 'up'].includes(previousMove)) && currentChar === validChars.dash) {
            continueOnIntersection(currentChar);
            return;
        }

        // Handle specific case where previous move was left or right and current position is pipe
        if ((['left', 'right'].includes(previousMove)) && currentChar === validChars.pipe) {
            continueOnIntersection(currentChar);
            return;
        }

        // Check if we should move based on previous move and current position character
        if (shouldMoveBasedOnPreviousMove(currentChar)) {
            console.log('Moved based on previous move');
            return;
        };

        // Try to move based on predefined movement priorities and next possible moves
        if (attemptMoveByNextPossibleMove()) {
            console.log('Moved based on next possible moves');
            return;
        };

        console.log('No valid moves found, moving randomly');
    };

    // Check if the coordinates have already been visited
    const isRevisitedPosition = (newPosition) => {
        // Check if the newPosition is already in the path
        const revisit = path.some(position => position.row === newPosition.row && position.col === newPosition.col);
        return revisit;
    };


    // Handle specific case where previous move was up or down and current position is dash
    const continueOnIntersection = () => {
        const directionsToCheck = [
            { direction: 'up', char: validChars.pipe },
            { direction: 'down', char: validChars.pipe },
            { direction: 'left', char: validChars.dash },
            { direction: 'right', char: validChars.dash }
        ];

        // Check all directions (up, down, left, right) for valid moves
        for (const { direction, char } of directionsToCheck) {
            if (possibleMoves[direction] === char && isRevisitedPosition(currentPosition)) {
                console.log(`Moving forward to avoid revisiting`);
                changePositionAndCollectPath(previousMove, "continueOnIntersection");
                return; // Exit after making a valid move
            }
        }
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
    const attemptMoveByNextPossibleMove = () => {
        const movePriority = [
            ["right", "left"].map(direction => ({ direction, char: validChars.dash })),
            ["up", "down"].map(direction => ({ direction, char: validChars.pipe })),
            ["up", "down", "right", "left"].map(direction => ({ direction, char: validChars.plus })),
            ["up", "down", "right", "left"].map(direction => ({ direction, char: validChars.letters })),
        ].flat();

        for (const { direction, char } of movePriority) {
            if (possibleMoves[direction] === char) {
                changePositionAndCollectPath(direction, "attemptMoveByNextPossibleMove");
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
                <p>{path.map(step => mapArray[step.row][step.col]).join(' → ')}</p>
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