import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/GameBoard.css';
import { ref, set, onValue } from "firebase/database";
import { db } from '../base';

const boardSize = 10;
const initialFood = { x: 5, y: 5 };

const GameBoard = ({ player }) => {
    const location = useLocation();
    const playerName = location.state?.playerName || 'Unknown';
    const navigate = useNavigate();

    const isPlayer1 = player === "1";
    const initialSnake = isPlayer1 ? [{ x: 2, y: 2 }] : [{ x: 7, y: 7 }];

    const [snake, setSnake] = useState(initialSnake);
    const [food, setFood] = useState(initialFood);
    const [direction, setDirection] = useState({ x: isPlayer1 ? 1 : -1, y: 0 });
    const [opponentSnake, setOpponentSnake] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [opponentGameOver, setOpponentGameOver] = useState(false);

    // Firebase references
    const snakeRef = ref(db, `game/${player}`);
    const opponentRef = ref(db, `game/${isPlayer1 ? "2" : "1"}`);
    const foodRef = ref(db, 'game/food');
    const gameOverRef = ref(db, `game/gameOver${player}`);
    const opponentGameOverRef = ref(db, `game/gameOver${isPlayer1 ? "2" : "1"}`);

    // Enviar puntuación a la API
    const sendScoreToApi = async () => {
        try {
            const response = await fetch(`/api/api/score/add`, {
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

    // Sincronizar datos con Firebase
    useEffect(() => {
        set(snakeRef, snake);
        set(gameOverRef, gameOver);

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

        const unsubscribeOpponentGameOver = onValue(opponentGameOverRef, (snapshot) => {
            const data = snapshot.val();
            setOpponentGameOver(data || false);
        });

        return () => {
            unsubscribeOpponent();
            unsubscribeFood();
            unsubscribeOpponentGameOver();
        };
    }, [snake, gameOver]);

    // Mover serpiente
    useEffect(() => {
        if (gameOver || opponentGameOver) {
            setGameOver(true);
            sendScoreToApi();
            return;
        }

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
                set(gameOverRef, true);
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
    }, [snake, direction, food, gameOver, opponentGameOver, opponentSnake, score]);

    return (
        <div className="board-container">
            <div className="info-panel">
                <h2>Player: {playerName}</h2>
                <h3>Score: {score}</h3>
            </div>
            <div className="board">
                {Array.from({ length: boardSize }).map((_, row) =>
                    Array.from({ length: boardSize }).map((_, col) => {
                        const isOwnSnake = snake.some(segment => segment.x === col && segment.y === row);
                        const isOpponentSnake = !opponentGameOver && opponentSnake.some(segment => segment.x === col && segment.y === row);
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
                        <p className="game-over-text">
                            <span className="game-over-title">Game Over</span><br />
                            ¡Nice try, {playerName}!<br />
                            Final score: <span className="score-highlight">{score}</span>
                        </p>
                        <button className="ranking-button" onClick={() => navigate('/score')}>
                            Score ranking
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameBoard;
