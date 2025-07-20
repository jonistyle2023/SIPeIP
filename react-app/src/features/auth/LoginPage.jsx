import React, {useState} from 'react';
import {HiEye, HiEyeOff} from 'react-icons/hi';
import logoEcuador from '../../app/assets/images/logo-ecuador.png';

const EcuadorLogo = () => (
    <img src={logoEcuador} alt="Logo Ecuador" width={250}/>
);

export default function LoginPage({onLoginSuccess}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username || !password) {
            setError('Usuario y contraseña son obligatorios.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({nombre_usuario: username, clave: password}),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión.');
            onLoginSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full font-sans bg-white bg-cover bg-center"
            style={{backgroundImage: "url('./src/assets/images/background-login.png')"}}
        >
            <div className="min-h-screen w-full flex flex-col bg-white bg-opacity-80">
                <header className="w-full p-4 md:p-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <EcuadorLogo/>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg md:text-xl font-bold text-gray-700">Secretaría Nacional</h2>
                        <h2 className="text-lg md:text-xl font-bold text-gray-700">de Planificación</h2>
                    </div>
                </header>
                <main className="flex-grow flex items-center justify-center">
                    <div className="w-full max-w-md p-8">
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">ACCESO AL SISTEMA</h3>
                        <div className="bg-gray-100 border border-gray-300 rounded-md p-4 mb-6 text-center"><p
                            className="text-gray-600">Sistema Integrado de Planificación e Inversión Pública</p></div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="flex items-center"><label htmlFor="username"
                                                                      className="w-1/3 text-sm font-semibold text-gray-600">USUARIO:</label><input
                                type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-2/3 p-2 border border-blue-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                            </div>
                            <div className="flex items-center">
                                <label htmlFor="password"
                                       className="w-1/3 text-sm font-semibold text-gray-600">CONTRASEÑA:</label>
                                <div className="w-2/3 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 border border-blue-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <HiEyeOff size={22}/> : <HiEye size={22}/>}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="text-center pt-4">
                                <button type="submit" disabled={isLoading}
                                        className="px-8 py-2 bg-purple-700 text-white font-bold rounded-md shadow-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400">{isLoading ? 'Iniciando...' : 'Iniciar Sesión'}</button>
                            </div>
                        </form>
                    </div>
                </main>
                <footer className="w-full p-6 bg-purple-800 text-white text-xs text-center"><p>Derechos Reservados ©
                    Secretaría Nacional de Planificación</p><p>Av. Patria y Av. 12 de Octubre, Edificio Secretaría
                    Nacional de Planificación</p><p>Código Postal: 170526 / Quito - Ecuador</p><p>Teléfono: (593-2)
                    397-8900</p></footer>
            </div>
        </div>
    );
}