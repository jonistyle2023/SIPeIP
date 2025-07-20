import React from 'react';
import logoSipeip from '../../app/assets/images/logo.png';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRightToBracket} from '@fortawesome/free-solid-svg-icons';

const SipeipLogo = () => (
    <img src={logoSipeip} alt="Logo SIPeIP" width={80} height={80}/>
);

const LoginIcon = () => (
    <FontAwesomeIcon icon={faRightToBracket} className="w-5 h-5 mr-2"/>
);

export default function HomePage({onNavigateToLogin}) {
    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden bg-custom-image">
            <main className="flex flex-col items-center justify-center text-center p-8 z-10">
                <div className="flex items-center justify-center mb-8">
                    <SipeipLogo/>
                    <h1
                        className="ml-4 text-6xl md:text-7xl lg:text-8xl font-semibold tracking-wider font-['Roboto'] drop-shadow-lg"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                        <span style={{ color: '#454545' }}>SIPe</span>
                        <span style={{ color: '#888888' }}>IP</span>
                    </h1>
                </div>
                <button
                    onClick={onNavigateToLogin}
                    className="group flex items-center justify-center px-6 py-3 bg-white text-black font-sans font-medium rounded-lg shadow-lg border border-black transition-all duration-300 ease-in-out hover:bg-black hover:text-white">
                      <span
                          className="flex items-center justify-center mr-3 transition-all duration-300 ease-in-out
                                   text-black group-hover:text-white">
                        <LoginIcon />
                      </span>
                    Iniciar Sesión
                </button>
            </main>
            <footer className="absolute bottom-0 w-full p-4 text-center text-slate-500 text-sm z-10 bg-[#F7FDFE]">
                2025 <b>©SIPeIP</b>. Designed & Developed by <b>Jonistyle</b>
            </footer>
        </div>
    );
}