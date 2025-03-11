import { validChars } from "./load";

// Check if the coordinates have already been visited
const isRevisitedPosition = (newPosition, path) => {
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
            attemptMoveByNextPossibleMove(possibleMoves, changePositionAndCollectPath);
            return true;
        }
    }

    return false;
};

// Check if we should move based on previous move and current position character
export const shouldMoveBasedOnPreviousMove = (validChars, currentChar, previousMove, changePositionAndCollectPath) => {
    const moveMap = {
        down: [validChars.pipe, ...validChars.letters],
        up: [validChars.pipe, ...validChars.letters],
        right: [validChars.dash, ...validChars.letters],
        left: [validChars.dash, ...validChars.letters],
    };

    if (moveMap[previousMove]?.includes(currentChar)) {
        console.log(`Previous move was ${previousMove}, moving ${previousMove} on ${currentChar}`);
        changePositionAndCollectPath(previousMove, "shouldMoveBasedOnPreviousMove");
        return true;
    }
    return false;
};

// Try to move based on predefined movement priorities and next possible moves
export const attemptMoveByNextPossibleMove = (possibleMoves, changePositionAndCollectPath) => {
    const movePriority = [
        ["right", "left"].map((direction) => ({ direction, char: validChars.dash })),
        ["up", "down"].map((direction) => ({ direction, char: validChars.pipe })),
        ["up", "down", "right", "left"].map((direction) => ({ direction, char: validChars.plus })),
        ["up", "down", "right", "left"].map((direction) => ({ direction, char: validChars.letters })),
    ].flat();

    for (const { direction, char } of movePriority) {
        if (possibleMoves[direction] === char) {
            changePositionAndCollectPath(direction, "attemptMoveByNextPossibleMove");
            return true;
        }
    }
    return false;
};