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

const compactMap = ` +-L-+
 |  +A-+
@B+ ++ H
 ++    x`;



export const mapArray = intersectionsMapDash.split('\n').map(row => row.split(''));

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

export function findStartPosition(array, startChar) {
    for (let row = 0; row < array.length; row++) {
        for (let col = 0; col < array[row].length; col++) {
            if (array[row][col] === startChar) {
                return { row, col };
            }
        }
    }
    return null;
}
export const loadMap = () => {
    const startPos = findStartPosition(mapArray, validChars.start);
    console.log('start position loaded at...', startPos)
    if (startPos) {
        return startPos;
    }
};