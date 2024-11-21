import { BrowserRouter, Route, Routes } from 'react-router-dom'; 
import GameBoard from './GameBoard'; 
import App from '../App'; 
import NotFound from './NotFound'; 
 
const Router = () => { 
    return( 
        <BrowserRouter> 
            <Routes> 
                <Route path="/" element={<App/>} /> 
                <Route path="/" element={<GameBoard/>} /> 
                <Route path="*" element={<NotFound/>} /> 
            </Routes> 
        </BrowserRouter> 
    ); 
}; 
 
export default Router; 