import React, { useState, useEffect } from 'react';
import '../css/GameBoard.css';
import { ref, set, onValue } from "firebase/database";
import { db } from '../base';

const boardSize = 10;
const initialFood = { x: 5, y: 5 };

const GameBoard = ({ player }) => {
    const isPlayer1 = player === "1";
    const initialSnake = isPlayer1 ? [{ x: 2, y: 2 }] : [{ x: 7, y: 7 }];

    const [snake, setSnake] = useState(initialSnake);
    const [food, setFood] = useState(initialFood);
    const [direction, setDirection] = useState({ x: isPlayer1 ? 1 : -1, y: 0 });
    const [opponentSnake, setOpponentSnake] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    // Firebase references
    const snakeRef = ref(db, `game/snake${player}`);
    const opponentRef = ref(db, `game/snake${isPlayer1 ? "2" : "1"}`);
    const foodRef = ref(db, 'game/food');

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) setDirection({ x: 1, y: 0 });
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    // Sync snake and food with Firebase
    useEffect(() => {
        set(snakeRef, snake);
        onValue(opponentRef, (snapshot) => setOpponentSnake(snapshot.val() || []));
        onValue(foodRef, (snapshot) => setFood(snapshot.val() || initialFood));
    }, [snake]);

    // Move snake
    useEffect(() => {
        if (gameOver) return;

        const moveSnake = () => {
            const newSnake = [...snake];
            const head = newSnake[0];
            const newHead = { x: head.x + direction.x, y: head.y + direction.y };

            // Check for collisions
            const isCollision = 
                newHead.x < 0 ||
                newHead.y < 0 ||
                newHead.x >= boardSize ||
                newHead.y >= boardSize ||
                newSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y) ||
                opponentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y);

            if (isCollision) {
                setGameOver(true);
                return;
            }

            newSnake.unshift(newHead);

            // Check for food
            if (newHead.x === food.x && newHead.y === food.y) {
                setFood({
                    x: Math.floor(Math.random() * boardSize),
                    y: Math.floor(Math.random() * boardSize)
                });
                set(foodRef, {
                    x: Math.floor(Math.random() * boardSize),
                    y: Math.floor(Math.random() * boardSize)
                });
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        const interval = setInterval(moveSnake, 200);
        return () => clearInterval(interval);
    }, [snake, direction, food, gameOver, opponentSnake]);

    return (
        <div className="board">
            {Array.from({ length: boardSize }).map((_, row) =>
                Array.from({ length: boardSize }).map((_, col) => (
                    <div
                        key={`${row}-${col}`}
                        className={`cell ${
                            snake.some(segment => segment.x === col && segment.y === row)
                                ? isPlayer1 ? 'snake1' : 'snake2'
                                : opponentSnake.some(segment => segment.x === col && segment.y === row)
                                ? isPlayer1 ? 'snake2' : 'snake1'
                                : food.x === col && food.y === row
                                ? 'food'
                                : ''
                        }`}
                    />
                ))
            )}
            {gameOver && <div className="game-over">Game Over</div>}
        </div>
    );
};

export default GameBoard;
