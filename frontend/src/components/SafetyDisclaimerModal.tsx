import React from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Academic Prototype & Safety Engineering Notice
              </h2>
              <p className="text-xs text-amber-400 font-semibold">
                RAILSAFE System Architecture Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200">
            <strong className="block text-sm font-bold mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Prototype & Simulation Mode vs. Operational Hardware
            </strong>
            This software is an engineering demonstration and academic prototype developed to validate
            automatic proximity-based retractable railway footbridge interlocks at Ongole Railway Station.
          </div>

          <h3 className="text-sm font-bold text-slate-100 pt-2">Operational Safety Requirements:</h3>
          <ul className="space-y-2 list-disc pl-4 text-slate-300">
            <li>
              <strong>CENELEC SIL-4 / RDSO Certification:</strong> A real-world operational railway deployment
              requires independent safety critical hardware interlocking (SIL-4 certified Electronic Interlocking)
              approved by the Commissioner of Railway Safety (CRS) and South Central Railway (SCR).
            </li>
            <li>
              <strong>Hardware Redundancy:</strong> Operational physical installations must incorporate dual-redundant
              axle counters, independent optical Doppler trackside radars, mechanical deadbolts, and physical
              fail-safe spring returns.
            </li>
            <li>
              <strong>Isolated Safety Network:</strong> IoT field microcontrollers (ESP32) in production must operate
              over isolated, cryptographically signed railway SCADA/IP networks with dual physical fiber lines.
            </li>
            <li>
              <strong>Fail-Safe Invariant:</strong> The system architecture dictates that safety-critical decisions
              are never executed by frontend browser code alone; the backend safety state machine and hardware limit
              circuits hold ultimate veto power.
            </li>
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
