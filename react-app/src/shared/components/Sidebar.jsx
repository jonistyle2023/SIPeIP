import React, {useState, useEffect} from 'react';
import {
    LayoutDashboard,
    FileText,
    DollarSign,
    BarChart2,
    Settings,
    Shield,
    ChevronDown,
    ChevronRight,
    Dot,
    CheckSquare
} from 'lucide-react';

export default function Sidebar({activePage, setActivePage, sidebarOpen, setSidebarOpen}) {
    const [openSubmenus, setOpenSubmenus] = useState({});

    const toggleSubmenu = (menu) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    const menuItems = [
        {name: 'Panel Principal', icon: LayoutDashboard},
        {name: 'Planificación', icon: FileText},
        {name: 'Inversión', icon: DollarSign},
        {name: 'Priorización PAI', icon: CheckSquare},
        {
            name: 'Seguimiento',
            icon: BarChart2,
            subItems: ['Seguimiento a la Planificación', 'Seguimiento a la Inversión', 'Seguimiento a obras', 'Seguimiento a Cierre y Baja de Proyectos']
        },
        {name: 'Reportería', icon: FileText},
        {name: 'Configuración', icon: Settings, subItems: ['Usuarios', 'Institucional', 'Priorización']},
        {name: 'Auditoría', icon: Shield},
    ];

    // Empuja el contenido en escritorio cuando el sidebar está abierto
    useEffect(() => {
        const updatePadding = () => {
            const isDesktop = window.innerWidth >= 1024; // breakpoint lg
            if (isDesktop && sidebarOpen) {
                document.body.style.paddingLeft = '16rem'; // w-64
            } else {
                document.body.style.paddingLeft = '';
            }
        };
        updatePadding();
        window.addEventListener('resize', updatePadding);
        return () => {
            window.removeEventListener('resize', updatePadding);
            document.body.style.paddingLeft = '';
        };
    }, [sidebarOpen]);

    return (
        <>
            <div
                className={`p-3 bg-white shadow-md w-64 flex flex-col z-40 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 h-screen overflow-y-auto`}
            >
                <div className="p-4 flex items-center">
                    <img src="./src/app/assets/images/sipeip-logo.png" alt="Logo SIPeIP"
                         className="w-10 h-10 rounded-full mr-3 object-cover"/>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">SIPeIP</h1>
                        <p className="text-xs text-gray-500">Sistema de Planificación</p>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isParentActive = item.name === 'Configuración' && (activePage === 'Usuarios' || activePage === 'Institucional');
                        return (
                            <div key={item.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (item.subItems) {
                                            toggleSubmenu(item.name);
                                        } else {
                                            setActivePage(item.name);
                                        }
                                    }}
                                    className={`flex items-center p-2 rounded-lg transition-colors ${
                                        activePage === item.name || isParentActive
                                            ? 'bg-blue-500 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3"/>
                                    <span className="flex-1">{item.name}</span>
                                    {item.subItems && (openSubmenus[item.name] ? <ChevronDown size={16}/> :
                                        <ChevronRight size={16}/>)}
                                </a>
                                {item.subItems && openSubmenus[item.name] && (
                                    <div className="pl-8 mt-1 space-y-1">
                                        {item.subItems.map((subItem) => (
                                            <a
                                                href="#"
                                                key={subItem}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActivePage(subItem);
                                                }}
                                                className={`flex items-center text-sm p-2 rounded-lg transition-colors ${
                                                    activePage === subItem
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-gray-500 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Dot size={16} className="mr-2"/>
                                                {subItem}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}