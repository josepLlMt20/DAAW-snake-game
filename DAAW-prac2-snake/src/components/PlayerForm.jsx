import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/PlayerForm.css';

const PlayerForm = () => {
    const [name, setName] = useState('');
    const [playerType, setPlayerType] = useState('snake1'); // Predeterminado a Snake 1
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() === '') {
            alert('Please enter your name');
            return;
        }

        // Guarda el nombre y redirige al juego correspondiente
        navigate(`/${playerType}`, { state: { playerName: name } });
    };

    return (
        <div className="player-form-container">
            <h1>Join the Game</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="playerType"
                            value="snake1"
                            checked={playerType === 'snake1'}
                            onChange={(e) => setPlayerType(e.target.value)}
                        />
                        Play as Snake 1
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="playerType"
                            value="snake2"
                            checked={playerType === 'snake2'}
                            onChange={(e) => setPlayerType(e.target.value)}
                        />
                        Play as Snake 2
                    </label>
                </div>
                <button type="submit">Start Game</button>
            </form>
        </div>
    );
};

export default PlayerForm;
