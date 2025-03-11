import { validChars } from "./load";

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