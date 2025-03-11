import { validChars } from "./load";

// Check if the coordinates have already been visited
export const isRevisitedPosition = (newPosition, path) => {
    // Check if the newPosition is already in the path
    const revisit = path.some(position => position.row === newPosition.row && position.col === newPosition.col);
    return revisit;
};

// Handle specific case where previous move was up or down and current position is dash
export const continueOnIntersection = (possibleMoves, previousMove, currentPosition, path, changePositionAndCollectPath) => {
    const directions = ["up", "down", "left", "right"];

    for (const direction of directions) {
        if (possibleMoves[direction] !== previousMove && isRevisitedPosition(currentPosition, path)) {
            console.log(`Moving forward on intersection...`);
            changePositionAndCollectPath(previousMove, "continueOnIntersection");
            return true;
        }
    }
    return false;
};

export const handleLetterTurnCases = (currentChar, possibleMoves, changePositionAndCollectPath) => {
    const turnCases = [
        { direction: "left", moveDirection: validChars.dash },
        { direction: "right", moveDirection: validChars.dash },
        { direction: "up", moveDirection: validChars.pipe },
        { direction: "down", moveDirection: validChars.pipe },
    ];

    for (const { direction, moveDirection } of turnCases) {
        if (
            validChars.letters.includes(currentChar) &&
            possibleMoves[direction] === moveDirection &&
            (Object.values(possibleMoves).filter(Boolean).length <= 1)) {
            moveByNextPossibleMovePriority(possibleMoves, changePositionAndCollectPath);
            return true;
        }
    }

    return false;
};

// Try to move based on predefined movement priorities and next possible moves
export const moveByNextPossibleMovePriority = (possibleMoves, changePositionAndCollectPath) => {
    const movePriority = [
        ["right", "left"].map((direction) => ({ direction, char: validChars.dash })),
        ["up", "down"].map((direction) => ({ direction, char: validChars.pipe })),
        ["up", "down", "right", "left"].map((direction) => ({ direction, char: validChars.plus })),
        ["up", "down", "right", "left"].map((direction) => ({ direction, isLetter: true })),
    ].flat();

    for (const { direction, char, isLetter } of movePriority) {
        if ((isLetter && validChars.letters.includes(possibleMoves[direction])) || possibleMoves[direction] === char) {
            changePositionAndCollectPath(direction, "moveByNextPossibleMovePriority");
            return true;
        }
    }
    return false;
};


// Check if we should move based on previous move and current position character
export const shouldMoveBasedOnPreviousMove = (validChars, currentChar, previousMove, changePositionAndCollectPath) => {
    if (["right", "left"].includes(previousMove) && currentChar === validChars.dash ||
        ["down", "up"].includes(previousMove) && currentChar === validChars.pipe) {
        console.log(`Previous move was ${previousMove}, moving ${previousMove} on ${currentChar}`);

        changePositionAndCollectPath(previousMove, "shouldMoveBasedOnPreviousMove");
        return true;
    }
    return false;
};

