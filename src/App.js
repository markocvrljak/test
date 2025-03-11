import './App.css';
import { useState, useEffect, useRef } from 'react';

import { loadMap, mapArray } from './utils/load';
import { handleNextPossibleMoves, hasMultipleValidMoves } from './utils/movement';

import MapDisplay from './components/Map';
import Controls from './components/Controls';

import {
    handleLetterTurnCases,
    attemptMoveByNextPossibleMove,
    continueOnIntersection,
    shouldMoveBasedOnPreviousMove
} from './utils/main';

import { validChars } from "./utils/load";

function App() {
    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });
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
        setTimeout(() => {
            setCurrentPosition(loadMap());
        }, 1500)
    }, []);

    useEffect(() => {
        const validMoves = handleNextPossibleMoves(currentPosition, mapArray, previousMove);
        setPossibleMoves(validMoves);
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

    // Calculate and update the new position and path based on movement directions
    const changePositionAndCollectPath = (direction, source) => {
        const newPosition = moves[direction];
        const currentChar = mapArray[newPosition?.row][newPosition?.col];

        console.log(`running [${source}] from last position ...moving...`);
        console.log(`Direction:`, direction);
        console.log(`Current position:`, currentChar ?? "@");

        // Update letters state if we encounter a new letter
        if (validChars.letters.includes(currentChar)) {
            setLetters(prevLetters => {
                if (!prevLetters.includes(currentChar)) {
                    if (!initialLogTriggered.current) {
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

        if (handleLetterTurnCases(currentChar, possibleMoves, changePositionAndCollectPath)) {
            return;
        }

        if ((["down", "up"].includes(previousMove) && currentChar === validChars.dash)
            || (["left", "right"].includes(previousMove) && currentChar === validChars.pipe)) {
            continueOnIntersection(possibleMoves, previousMove, currentPosition, path, changePositionAndCollectPath);
            return;
        }

        if (["down", "up", "left", "right"].includes(previousMove) && validChars.letters.includes(currentChar) && hasMultipleValidMoves(possibleMoves)) {
            continueOnIntersection(possibleMoves, previousMove, currentPosition, path, changePositionAndCollectPath);
            return;
        }

        // Check if we should move based on previous move and current position character
        if (shouldMoveBasedOnPreviousMove(validChars, currentChar, previousMove, changePositionAndCollectPath)) {
            console.log("Moved based on previous move");
            return;
        }

        // Try to move based on predefined movement priorities and next possible moves
        if (attemptMoveByNextPossibleMove(possibleMoves, changePositionAndCollectPath)) {
            console.log("Moved based on next possible moves");
            return;
        }

        console.log("No valid moves found, moving randomly");
    };

    return (
        <div>
            <MapDisplay mapArray={mapArray} currentPosition={currentPosition} />
            <h3>Path Taken:</h3>
            <p>{path.map(step => mapArray[step.row][step.col]).join(' → ')}</p>
            <h3>Collected Letters:</h3>
            <p>{letters.join(', ')}</p>
            <Controls moveAccordingToPath={moveAccordingToPath} />
        </div>
    );
}

export default App;