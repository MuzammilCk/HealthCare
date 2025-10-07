import { FiX, FiMapPin, FiMail, FiStar } from 'react-icons/fi';

export default function DoctorProfileModal({ open, doctor, onClose }) {
  if (!open || !doctor) return null;

  const stop = (e) => e.stopPropagation();
  const d = doctor;
  const rating = typeof d.averageRating === 'number' ? Number(d.averageRating).toFixed(1) : null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[1300] bg-white/10 backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center p-4">
      <div onClick={stop} className="relative z-[1301] w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Doctor Profile</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><FiX className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={d.photoUrl ? `http://localhost:5000${d.photoUrl}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(d.userId?.name || 'Doctor') + '&size=200&background=0D8ABC&color=fff'}
              alt={d.userId?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(d.userId?.name || 'Doctor') + '&size=200&background=0D8ABC&color=fff'; }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{d.userId?.name}</h2>
                {rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm bg-yellow-100 text-yellow-700 border border-yellow-200"><FiStar className="w-4 h-4" /> {rating}</span>
                )}
              </div>
              <p className="text-primary font-medium">{d.specializationId?.name}</p>
              {d.hospitalId && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><FiMapPin className="w-4 h-4" /> {d.hospitalId.name}, {d.hospitalId.district}</p>
              )}
            </div>
          </div>

          {d.qualifications && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Qualifications</h4>
              <p className="text-gray-700">{d.qualifications}</p>
            </div>
          )}

          {d.bio && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">About</h4>
              <p className="text-gray-700 whitespace-pre-line">{d.bio}</p>
            </div>
          )}

          {Array.isArray(d.languages) && d.languages.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {d.languages.map((lang, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-sm">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {typeof d.experienceYears === 'number' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Experience</h4>
              <p className="text-gray-700">{d.experienceYears} years</p>
            </div>
          )}

          {d.userId?.email && (
            <div className="flex items-center gap-2 text-gray-700"><FiMail className="w-4 h-4" /> {d.userId.email}</div>
          )}
        </div>
      </div>
    </div>
  );
}


