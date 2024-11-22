import { BrowserRouter, Route, Routes } from 'react-router-dom'; 
import GameBoard from './GameBoard'; 
import App from '../App'; 
import NotFound from './NotFound'; 
 
const Router = () => { 
    return( 
        <BrowserRouter> 
            <Routes> 
                <Route path="/" element={<App/>} /> 
                <Route path="/snake1" element={<GameBoard player="1" />} /> 
                <Route path="/snake2" element={<GameBoard player="2" />} /> 
                <Route path="*" element={<NotFound/>} /> 
            </Routes> 
        </BrowserRouter> 
    ); 
}; 
 
export default Router; 