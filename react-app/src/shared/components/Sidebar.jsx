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
    CheckSquare,
    Target,
    ClipboardList,
    HardHat,
    Archive,
    ShieldCheck,
    FolderKanban,
    BookOpen,
    CalendarCheck,
    ActivitySquare // Importar el nuevo ícono
} from 'lucide-react';

// ... (Componentes NavItem y CollapsibleNavItem no cambian)

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
        {name: 'Planificación', icon: CalendarCheck},
        {name: 'Proyectos', icon: FolderKanban},
        {name: 'Priorización PAI', icon: CheckSquare},
        {name: 'Reportería', icon: BookOpen},
        {
            name: 'Seguimiento',
            icon: Target,
            subItems: [
                // AÑADIDO: El nuevo requerimiento
                {name: 'Seguimiento y Control', icon: ActivitySquare}, 
                {name: 'Seguimiento Planificación', icon: ClipboardList},
                {name: 'Seguimiento Inversión', icon: DollarSign},
                {name: 'Seguimiento Obras', icon: HardHat},
                {name: 'Seguimiento Cierre', icon: Archive}
            ]
        },
        {name: 'Configuración', icon: Settings},
        {name: 'Auditoría', icon: ShieldCheck},
    ];

    // ... (El resto del componente no cambia)
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
                className={`p-3 bg-white dark:bg-slate-800 shadow-md w-64 flex flex-col z-40 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 h-screen overflow-y-auto`}
            >
                <div className="p-4 flex items-center">
                    <img src="./src/app/assets/images/sipeip-logo.png" alt="Logo SIPeIP"
                         className="w-10 h-10 rounded-full mr-3 object-cover"/>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">SIPeIP</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Planificación</p>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isParentActive = 
                            (item.name === 'Configuración' && (activePage === 'Usuarios' || activePage === 'Institucional' || activePage === 'Priorización')) ||
                            (item.name === 'Seguimiento' && (activePage === 'Seguimiento y Control' || activePage === 'Seguimiento Planificación' || activePage === 'Seguimiento Inversión' || activePage === 'Seguimiento Obras' || activePage === 'Seguimiento Cierre'));

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
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3"/>
                                    <span className="flex-1">{item.name}</span>
                                    {item.subItems && (openSubmenus[item.name] ? <ChevronDown size={16}/> :
                                        <ChevronRight size={16}/>)}
                                </a>
                                {item.subItems && openSubmenus[item.name] && (
                                    <div className="pl-8 mt-1 space-y-1">
                                        {item.subItems.map((subItem) => {
                                            const subItemName = typeof subItem === 'string' ? subItem : subItem.name;
                                            const SubItemIcon = typeof subItem === 'string' ? Dot : subItem.icon;

                                            return (
                                                <a
                                                    href="#"
                                                    key={subItemName}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActivePage(subItemName);
                                                    }}
                                                    className={`flex items-center text-sm p-2 rounded-lg transition-colors ${
                                                        activePage === subItemName
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    <SubItemIcon size={16} className="mr-2"/>
                                                    {subItemName}
                                                </a>
                                            );
                                        })}
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
