
import { useState, useEffect } from 'react'; 
import { useParams } from "react-router-dom"; 
import { onValue, ref, set, off } from "firebase/database"; 
import { db } from './base'; 

import React from 'react';
import GameBoard from './components/GameBoard';
import './css/App.css';

function App() {
    return (
        <div className="App">
            <h1>Snake Game</h1>
            <GameBoard />
        </div>
    );
}

export default App;
