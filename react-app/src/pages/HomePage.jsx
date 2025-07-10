import React from 'react';

const SipeipLogo = () => ( <svg width="80" height="80" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/></filter></defs><g transform="translate(110, 110)"><g transform="translate(-40, -40) rotate(15)" style={{ filter: 'url(#shadow)' }}><circle cx="0" cy="0" r="40" fill="#3b82f6" /><path d="M0,0 L45,0 M0,0 L-45,0 M0,0 L0,45 M0,0 L0,-45 M0,0 L31.8,31.8 M0,0 L-31.8,-31.8 M0,0 L31.8,-31.8 M0,0 L-31.8,31.8" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" /><circle cx="0" cy="0" r="15" fill="#FFFFFF" /></g><g transform="translate(30, -50) rotate(-10)" style={{ filter: 'url(#shadow)' }}><circle cx="0" cy="0" r="30" fill="#f97316" /><path d="M0,0 L34,0 M0,0 L-34,0 M0,0 L0,34 M0,0 L0,-34 M0,0 L24,24 M0,0 L-24,-24 M0,0 L24,-24 M0,0 L-24,24" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" /><circle cx="0" cy="0" r="10" fill="#FFFFFF" /></g><g transform="translate(-10, 35) rotate(25)" style={{ filter: 'url(#shadow)' }}><circle cx="0" cy="0" r="35" fill="#ef4444" /><path d="M0,0 L39,0 M0,0 L-39,0 M0,0 L0,39 M0,0 L0,-39 M0,0 L27.6,27.6 M0,0 L-27.6,-27.6 M0,0 L27.6,-27.6 M0,0 L-27.6,27.6" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" /><circle cx="0" cy="0" r="12" fill="#FFFFFF" /></g></g></svg> );
const LoginIcon = () => ( <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg> );

export default function HomePage({ onNavigateToLogin }) {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden bg-custom-image">
            <main className="flex flex-col items-center justify-center text-center p-8 z-10">
                <div className="flex items-center justify-center mb-8">
                    <SipeipLogo />
                    <h1 className="ml-4 text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider text-slate-700">
                        SIPeIP
                    </h1>
                </div>
                <button
                    onClick={onNavigateToLogin}
                    className="flex items-center justify-center px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    <LoginIcon />
                    Iniciar Sesión
                </button>
            </main>
            <footer className="absolute bottom-0 w-full p-4 text-center text-slate-500 text-sm z-10">
                2025 SIPeIP. Designed & Developed by Jonistyle
            </footer>
        </div>
    );
}