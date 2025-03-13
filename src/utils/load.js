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

const compactMap = ` +-L-+
 |  +A-+
@B+ ++ H
 ++    x`;



export const mapArray = basicMap.split('\n').map(row => row.split(''));

const startChar = '@';
const endChar = 'x';

export const validChars = {
    dash: '-',
    plus: '+',
    pipe: '|',
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    start: startChar,
    end: endChar,
};

export function findStartAndEndPositions(array, startChar, endChar) {
    let startPositions = [];
    let endPositions = [];
    let numRows = array.length;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < array[row].length; col++) {
            let char = array[row][col];

            if (char === startChar) startPositions.push({ row, col });
            if (char === endChar) endPositions.push({ row, col });
        }
    }

    return { startPositions, endPositions };
}

const isPathBroken = (array) => {
    for (let row = 0; row < array.length; row++) {
        let hasValidChar = array[row].some(char => Object.values(validChars).flat().includes(char));

        if (!hasValidChar) {
            console.error(`ERROR: Disconnected path detected. Row ${row} has no valid path characters.`);
            return true;
        }
    }
    return false;
};

const hasMultiplePathsFromStart = (array, startPos) => {
    if (!startPos) {
        console.error(`ERROR: Start position '@' not found in the map.`);
        return;
    }

    const { row, col } = startPos;
    let pathCount = 0;

    // Define possible adjacent positions (left, right, up, down)
    const directions = [
        { r: 0, c: -1 },
        { r: 0, c: 1 },
        { r: -1, c: 0 },
        { r: 1, c: 0 }
    ];

    // Check valid paths around '@'
    for (const { r, c } of directions) {
        const newRow = row + r;
        const newCol = col + c;

        // Ensure it's within bounds
        if (newRow >= 0 && newRow < array.length && newCol >= 0 && newCol < array[newRow].length) {
            const char = array[newRow][newCol];

            // Check if adjacent char is a valid path character
            if (Object.values(validChars).flat().includes(char)) {
                pathCount++;
            }
        }
    }

    // If more than one path is found, return error
    if (pathCount > 1) {
        console.error(`ERROR: Multiple paths found from '@' at (${row}, ${col}).`);
        return true; // Map is invalid
    }

    return false; // Map is valid
};

export const loadMap = () => {
    const { startPositions, endPositions } = findStartAndEndPositions(mapArray, validChars.start, validChars.end);

    if (startPositions.length === 0 || endPositions.length === 0) {
        console.error(`ERROR: Map must contain both '${validChars.start}' (start) and '${validChars.end}' (end)`);
        return null;
    }

    if (startPositions.length > 1) {
        console.error('ERROR: Multiple start positions found!');
        return null;
    }

    if (endPositions.length > 1) {
        console.error('ERROR: Multiple end positions found!');
        return null;
    }

    // Check for multiple paths from @ before loading the map
    if (hasMultiplePathsFromStart(mapArray, startPositions[0])) {
        console.error('ERROR: Multiple paths from the start position are not allowed.');
        return null;
    }

    // Check for disconnected path levels before loading the map
    if (isPathBroken(mapArray)) {
        console.error('ERROR: The path is disconnected between different levels.');
        return null;
    }

    console.log('✅ Map loaded successfully.');
    console.log('🔹 Start position:', startPositions[0]);
    console.log('🔹 End position:', endPositions[0]);

    return startPositions[0];
};

