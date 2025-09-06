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
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
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
                <tbody>
                {sortedItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800"
                            style={{paddingLeft: `${12 + item.level * 20}px`}}>
                            {item.nombre}
                        </td>
                        <td className="p-3 text-gray-600">{item.codigo || 'S/C'}</td>
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