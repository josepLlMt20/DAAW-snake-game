import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Para obtener el estado pasado desde navigate
import '../css/GameBoard.css';
import { ref, set, onValue } from "firebase/database";
import { db } from '../base';

const boardSize = 10;
const initialFood = { x: 5, y: 5 };

const GameBoard = ({ player }) => {
    const location = useLocation(); // Obtener el estado pasado desde navigate
    const playerName = location.state?.playerName || 'Unknown'; // Nombre del jugador

    const isPlayer1 = player === "1";
    const initialSnake = isPlayer1 ? [{ x: 2, y: 2 }] : [{ x: 7, y: 7 }];

    const [snake, setSnake] = useState(initialSnake);
    const [food, setFood] = useState(initialFood);
    const [direction, setDirection] = useState({ x: isPlayer1 ? 1 : -1, y: 0 });
    const [opponentSnake, setOpponentSnake] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    // Firebase references
    const snakeRef = ref(db, `game/${player}`);
    const opponentRef = ref(db, `game/snake${isPlayer1 ? "2" : "1"}`);
    const foodRef = ref(db, 'game/food');

    // Enviar puntuación a la API
    const sendScoreToApi = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/score/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: playerName,
                    score: score,
                }),
            });

            if (response.ok) {
                console.log('Score sent successfully');
            } else {
                console.error('Failed to send score');
            }
        } catch (error) {
            console.error('Error while sending score:', error);
        }
    };

    // Manejar entrada del teclado
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

    // Sincronizar serpiente y comida con Firebase
    useEffect(() => {
        if (!gameOver) {
            set(snakeRef, snake);
        }
    }, [snake, gameOver]);

    useEffect(() => {
        const unsubscribeOpponent = onValue(opponentRef, (snapshot) => {
            const opponentData = snapshot.val();
            if (opponentData) {
                setOpponentSnake(opponentData);
            }
        });

        const unsubscribeFood = onValue(foodRef, (snapshot) => {
            const foodData = snapshot.val();
            if (foodData) {
                setFood(foodData);
            }
        });

        return () => {
            unsubscribeOpponent();
            unsubscribeFood();
        };
    }, []);

    // Mover serpiente
    useEffect(() => {
        if (gameOver) return;

        const moveSnake = () => {
            const newSnake = [...snake];
            const head = newSnake[0];
            const newHead = { x: head.x + direction.x, y: head.y + direction.y };

            // Verificar colisiones
            const isCollision =
                newHead.x < 0 ||
                newHead.y < 0 ||
                newHead.x >= boardSize ||
                newHead.y >= boardSize ||
                newSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y) ||
                opponentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y);

            if (isCollision) {
                setGameOver(true);
                sendScoreToApi(); // Enviar el puntaje cuando el jugador pierda
                return;
            }

            newSnake.unshift(newHead);

            // Verificar si la serpiente come comida
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(score + 1);
                const newFood = {
                    x: Math.floor(Math.random() * boardSize),
                    y: Math.floor(Math.random() * boardSize)
                };
                setFood(newFood);
                set(foodRef, newFood);
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        const interval = setInterval(moveSnake, 200);
        return () => clearInterval(interval);
    }, [snake, direction, food, gameOver, opponentSnake, score]);

    return (
        <div className="board-container">
            <div className="info-panel">
                <h2>Player: {playerName}</h2> {/* Muestra el nombre del jugador */}
                <h3>Score: {score}</h3>
            </div>
            <div className="board">
                {Array.from({ length: boardSize }).map((_, row) =>
                    Array.from({ length: boardSize }).map((_, col) => {
                        const isOwnSnake = snake.some(segment => segment.x === col && segment.y === row);
                        const isOpponentSnake = opponentSnake.some(segment => segment.x === col && segment.y === row);
                        const isFood = food.x === col && food.y === row;

                        const cellClass = isOwnSnake
                            ? `${player}`
                            : isOpponentSnake
                            ? `snake${(player === "snake1") ? "2" : "1"}`
                            : isFood
                            ? 'food'
                            : '';

                        return (
                            <div
                                key={`${row}-${col}`}
                                className={`cell ${cellClass}`}
                            />
                        );
                    })
                )}
                {gameOver && (
                    <div className="game-over show">
                        Game Over
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameBoard;
