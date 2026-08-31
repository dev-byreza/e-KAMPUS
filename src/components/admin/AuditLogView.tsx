import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { History, Shield, Clock } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const events =
    useLiveQuery(() => db.auditEvents.orderBy('timestamp').reverse().toArray()) || [];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">Riwayat Konfigurasi & Audit Log</h3>
          <p className="text-xs text-slate-400">
            Jejak audit seluruh mutasi, finalisasi nilai, pembukaan revisi, dan perubahan format.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-950 text-indigo-300 font-mono text-xs border border-slate-800">
          {(events || []).length} Peristiwa Tercatat
        </span>
      </div>

      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4 w-44">Waktu Server (WITA)</th>
                <th className="py-3 px-4 w-36">Pelaku / Aktor</th>
                <th className="py-3 px-4 w-44">Jenis Aksi</th>
                <th className="py-3 px-4 w-40">Target</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                  <td className="py-2.5 px-4 text-slate-400">
                    {new Date(ev.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-indigo-300 font-sans">
                    {ev.actor}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-800 text-[10px]">
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{ev.targetId}</td>
                  <td className="py-2.5 px-4 text-slate-300 font-sans">{ev.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
