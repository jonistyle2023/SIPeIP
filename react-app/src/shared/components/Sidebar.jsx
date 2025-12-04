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
    CalendarCheck
} from 'lucide-react';

const NavItem = ({ icon: Icon, text, active, onClick }) => (
    <li>
        <button onClick={onClick} className={`flex items-center w-full p-3 my-1 text-sm rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}>
            <Icon size={20} />
            <span className="ml-3">{text}</span>
        </button>
    </li>
);

// NUEVO COMPONENTE PARA MENÚS DESPLEGABLES
const CollapsibleNavItem = ({ icon: Icon, text, children, activePage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveChild = React.Children.toArray(children).some(child => child.props.active);

    return (
        <li>
            <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between w-full p-3 my-1 text-sm rounded-lg transition-colors ${hasActiveChild ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-100'}`}>
                <div className="flex items-center">
                    <Icon size={20} />
                    <span className="ml-3">{text}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <ul className="pl-6 mt-1 space-y-1">
                    {children}
                </ul>
            )}
        </li>
    );
};

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
                {name: 'Seguimiento Planificación', icon: ClipboardList},
                {name: 'Seguimiento Inversión', icon: DollarSign},
                {name: 'Seguimiento Obras', icon: HardHat},
                {name: 'Seguimiento Cierre', icon: Archive}
            ]
        },
        {name: 'Configuración', icon: Settings}, // Eliminado subItems
        {name: 'Auditoría', icon: ShieldCheck},
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
                        const isParentActive = 
                            (item.name === 'Configuración' && (activePage === 'Usuarios' || activePage === 'Institucional' || activePage === 'Priorización')) ||
                            (item.name === 'Seguimiento' && (activePage === 'Seguimiento Planificación' || activePage === 'Seguimiento Inversión' || activePage === 'Seguimiento Obras' || activePage === 'Seguimiento Cierre'));

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
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'text-gray-500 hover:bg-gray-100'
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