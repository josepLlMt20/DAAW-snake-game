import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Ranking.css';

const Ranking = () => {
    const [scores, setScores] = useState([]);
    const navigate = useNavigate();

    // Obtener puntuaciones de la API
    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/score/getTopScores');
                if (response.ok) {
                    const data = await response.json();
                    setScores(data);
                } else {
                    console.error('Error fetching scores');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchScores();
    }, []);

    return (
        <div className="ranking-container">
            <h1>Top 10 players</h1>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((score, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{score.name}</td>
                            <td>{score.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="ranking-button" onClick={() => navigate('/')}>
                Back to Main Menu
            </button>
        </div>
    );
};

export default Ranking;
