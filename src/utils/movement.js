
import { validChars } from "./load";

// Find possible moves based on the current position

export const handleNextPossibleMoves = (currentPosition, mapArray, previousMove) => {
    const allPossibleMoves = getValidMovement(currentPosition, mapArray);
    const validMovesDirty = validatePossibleMoves(allPossibleMoves);
    const validMovesClean = removeBacktrackingMove(validMovesDirty, previousMove);

    return validMovesClean;
};

// Get possible moves based on the current position
export const getValidMovement = (currentPosition, mapArray) => {
    const { row, col } = currentPosition;

    return {
        up: row - 1 >= 0 ? mapArray[row - 1][col] : null,
        down: row + 1 < mapArray.length ? mapArray[row + 1][col] : null,
        left: col - 1 >= 0 ? mapArray[row][col - 1] : null,
        right: col + 1 < mapArray[row].length ? mapArray[row][col + 1] : null,
    };
};

// Validate possible moves based on valid characters
export const validatePossibleMoves = (possibleMoves) => {
    const validSet = Object.values(validChars).flat();

    return Object.fromEntries(
        Object.entries(possibleMoves).map(([k, v]) => [k, validSet.includes(v) && v])
    );
};

// Remove the backtracking move based on the previous move
export const removeBacktrackingMove = (validMoves, previousMove) => {
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
