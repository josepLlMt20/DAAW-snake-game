import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GameBoard from './GameBoard';
import PlayerForm from './PlayerForm';
import NotFound from './NotFound';

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Página inicial para elegir nombre y rol */}
                <Route path="/" element={<PlayerForm />} />

                {/* Rutas para los jugadores */}
                <Route path="/snake1" element={<GameBoard player="snake1" />} />
                <Route path="/snake2" element={<GameBoard player="snake2" />} />

                {/* Ruta para manejar errores */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
