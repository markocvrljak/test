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
             xx`;

const ignoreAfterEndMap = `  @-A--+
       |
       +-B--x-C--D`;

const compactMap = ` +-L-+
 |  +A-+
@B+ ++ H
 ++    x`;



export const mapArray = sameLocationMap.split('\n').map(row => row.split(''));

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

    for (let row = 0; row < array.length; row++) {
        for (let col = 0; col < array[row].length; col++) {
            if (array[row][col] === startChar) startPositions.push({ row, col });
            if (array[row][col] === endChar) endPositions.push({ row, col });
        }
    }

    return { startPositions, endPositions };
}

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

    console.log('✅ Map loaded successfully.');
    console.log('🔹 Start position:', startPositions[0]);
    console.log('🔹 End position:', endPositions[0]);

    return startPositions[0];
};
