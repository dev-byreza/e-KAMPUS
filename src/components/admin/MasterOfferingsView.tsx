import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Users, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

export const MasterOfferingsView: React.FC = () => {
  const { offerings, toggleRosterVerification, toggleDatesVerification } = useApp();

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <h3 className="font-bold text-white text-sm mb-1">
          Master Pelaksanaan Praktikum per Pekan
        </h3>
        <p className="text-xs text-slate-400">
          Kelola offering pelaksanaan, pembagian 12 peserta per kelompok, dan verifikasi tanggal sesi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(offerings || []).map((off) => (
          <div
            key={off.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-400">
                  {off.id}
                </span>
                <h4 className="font-bold text-white text-sm mt-0.5">
                  Pekan {off.semesterWeek} (Minggu {off.calendarWeek})
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] font-bold border border-slate-800">
                {off.practiceVersionId}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div>
                Rentang: <strong className="text-white">{off.dateRangeText}</strong>
              </div>
              <div>
                Peserta:{' '}
                <strong className="text-indigo-300">
                  {(off.studentIds || []).length} Mahasiswa
                </strong>
              </div>
              <div>
                Instruktur:{' '}
                <span className="text-slate-400">{off.instructorName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => toggleRosterVerification(off.id)}
                className="w-full py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
              >
                {off.isRosterVerified ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Roster Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verifikasi Roster</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleDatesVerification(off.id)}
                className="w-full py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
              >
                {off.areDatesVerified ? (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>5 Sesi Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verifikasi 5 Sesi Tanggal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
