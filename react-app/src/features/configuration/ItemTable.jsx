import React, {useState, useMemo} from 'react';
import {Edit, Trash2, ArrowUpDown} from 'lucide-react';

export default function ItemTable({items, onEditItem, onDeleteItem}) {
    const [sortConfig, setSortConfig] = useState({key: 'nombre', direction: 'ascending'});

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                <tr>
                    <th className="p-3">
                        <button onClick={() => requestSort('nombre')} className="flex items-center font-semibold">
                            Nombre <ArrowUpDown size={14} className="ml-1"/>
                        </button>
                    </th>
                    <th className="p-3">
                        <button onClick={() => requestSort('codigo')} className="flex items-center font-semibold">
                            Código <ArrowUpDown size={14} className="ml-1"/>
                        </button>
                    </th>
                    <th className="p-3 text-right font-semibold">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {sortedItems.map(item => (
                    <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-3 font-medium text-gray-800 dark:text-white"
                            style={{paddingLeft: `${12 + item.level * 20}px`}}>
                            {item.nombre}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{item.codigo || 'S/C'}</td>
                        <td className="p-3 text-right">
                            <button onClick={() => onEditItem(item)} title="Editar ítem" className="p-1 text-blue-500">
                                <Edit size={14}/></button>
                            <button onClick={() => onDeleteItem(item.id)} title="Eliminar ítem"
                                    className="p-1 text-red-500"><Trash2 size={14}/></button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}