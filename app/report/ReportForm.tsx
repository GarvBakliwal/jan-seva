'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Camera,
  FolderOpen,
  MapPin,
  Send,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Building2,
  Crosshair,
  Lock,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
} from 'lucide-react';
import type { Profile } from '@/types/profile';

interface ReportFormProps {
  profile: Profile;
}

const CATEGORY_ULB_MAP: Record<string, string> = {
  POTHOLE: 'Roads & Infrastructure Department',
  GARBAGE: 'Solid Waste Management & Sanitation Dept',
  STREETLIGHT: 'Electrical & Public Lighting Division',
  WATER_LEAKAGE: 'Water Supply & Sewerage Board (BWSSB)',
  DRAINAGE: 'Storm Water Drain Management Cell',
  PUBLIC_INFRASTRUCTURE: 'Public Works & Parks Maintenance',
  OTHER: 'General Municipal Grievance Cell',
};

export default function ReportForm({ profile }: ReportFormProps) {
  const [category, setCategory] = useState('POTHOLE');
  const [description, setDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [fileName, setFileName] = useState('');
  const [address] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [landmark, setLandmark] = useState('');
  const [showAdditional, setShowAdditional] = useState(false);
  const [declared, setDeclared] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState('');
  const [serverError, setServerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declared || !description.trim()) return;
    setIsSubmitting(true);
    setServerError('');
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, description, image_url: imageUrl || undefined,
          latitude: latitude ?? undefined, longitude: longitude ?? undefined,
          address: address || undefined, landmark: landmark || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit complaint.');
      setSubmittedNumber(result.data.complaint_number);
      setSuccessMsg(true);
      setTimeout(() => router.push('/complaints'), 1800);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setServerError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to upload image.');
      setImageUrl(result.data.url);
      setImagePreviewError(false);
      setFileName(file.name);
      setPhotoUploaded(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to upload image.');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setServerError('Location is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setCoordinates(`${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E`);
      },
      () => setServerError('Location permission was not granted. You can still enter an address manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 2000);
  };

  if (successMsg) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-emerald-200 text-center space-y-3 shadow-md">
        <CheckCircle2 size={52} className="text-emerald-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-extrabold text-gray-900">Grievance Submitted Successfully!</h2>
        <p className="text-sm text-gray-600">
          Your complaint tracking ID is <span className="font-mono font-bold text-blue-700">{submittedNumber}</span>
        </p>
        <p className="text-xs text-gray-400">Your complaint is now available in My Complaints.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
      {serverError && <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">{serverError}</div>}
      {/* ================= 1. WHAT IS THE ISSUE? ================= */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>1. What is the issue?</span>
            <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            Step 1
          </span>
        </div>

        <p className="text-xs text-gray-500">Select the category that best describes the municipal grievance.</p>

        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
            required
          >
            <option value="POTHOLE">Potholes &amp; Road Damages</option>
            <option value="GARBAGE">Garbage &amp; Sanitation Issues</option>
            <option value="STREETLIGHT">Streetlights &amp; Dark Spots</option>
            <option value="WATER_LEAKAGE">Water Leakage &amp; Supply</option>
            <option value="DRAINAGE">Drainage &amp; Flooding</option>
            <option value="PUBLIC_INFRASTRUCTURE">Public Infrastructure</option>
            <option value="OTHER">Other Civic Grievance</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Department Assignment Badge */}
        <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-150 flex items-center gap-2 text-[11px] font-semibold text-blue-900">
          <Building2 size={15} className="text-blue-700 shrink-0" />
          <span>Assigned ULB: {CATEGORY_ULB_MAP[category] || 'Municipal Grievance Cell'}</span>
        </div>
      </div>

      {/* ================= 2. UPLOAD A PHOTO ================= */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>2. Upload a Photo</span>
            <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
            <Camera size={11} /> Geotagged
          </span>
        </div>

        <p className="text-xs text-gray-500">A clear photo helps municipal engineers inspect and verify the issue promptly.</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-[var(--gov-navy)] hover:bg-[#091728] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
          >
            <Camera size={15} />
            <span>Take Photo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 text-[var(--gov-blue)] border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
          >
            <FolderOpen size={15} />
            <span>Upload File</span>
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />

        <p className="text-[10px] text-gray-400 text-center">Max size: 5 MB - Accepted formats: JPG, JPEG, PNG</p>

        {/* Photo Uploaded Preview Card */}
        {photoUploaded && (
          <div className="p-2.5 rounded-xl border border-gray-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-300 bg-slate-100">
                {imagePreviewError ? (
                  <div className="h-full w-full flex items-center justify-center px-1 text-center text-[9px] font-semibold text-gray-500">
                    Preview unavailable
                  </div>
                ) : (
                  <Image
                    src={imageUrl || '/images/hero_pothole_reporting.jpg'}
                    alt="Uploaded pothole photo preview"
                    fill
                    sizes="64px"
                    unoptimized={Boolean(imageUrl)}
                    className="object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                )}
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-gray-900 truncate">{fileName || 'Uploaded image'}</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <ShieldCheck size={11} /> Metadata &amp; GPS verified
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhotoUploaded(false)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="Remove photo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ================= 3. ISSUE LOCATION ================= */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>3. Issue Location</span>
            <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
            <MapPin size={11} /> GPS Active
          </span>
        </div>

        <p className="text-xs text-gray-500">Location is used strictly to dispatch municipal inspection teams to the exact spot.</p>

        {/* Re-Select Current Location Button */}
        <button
          type="button"
              onClick={handleDetectLocation}
          className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 text-[var(--gov-blue)] border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Crosshair size={15} />
          <span>Re-Select Current Location</span>
        </button>

        {/* High Accuracy Badge & Details */}
        <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
              🟢 HIGH ACCURACY GPS
            </span>
            <span className="text-gray-500">Radius ± 5 meters</span>
          </div>

          <div className="text-xs font-bold text-gray-900 leading-tight">
            {address || 'Use GPS or enter the issue address below'}
          </div>
          <div className="text-[11px] text-gray-600">
            {coordinates || 'Coordinates not captured yet'}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            {latitude !== null && longitude !== null ? `Coordinates: ${latitude}, ${longitude}` : 'Location will be saved with the complaint'}
          </div>
        </div>

        {/* Map Preview Box */}
        <div className="relative rounded-xl overflow-hidden border border-gray-300 bg-slate-200 h-36 flex flex-col justify-between p-2">
          {/* Simulated Map Visual */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md animate-bounce">
              <MapPin size={18} />
            </div>
          </div>

          <div className="relative z-10 p-2 rounded-lg bg-white/90 backdrop-blur-md border border-gray-200 flex items-center justify-between text-[11px] font-semibold text-gray-700 shadow-xs">
            <span>Pin placed at reported hazard</span>
            <button type="button" className="text-blue-700 font-bold hover:underline text-[10px]">
              Adjust Pin
            </button>
          </div>
        </div>
      </div>

      {/* ================= 4. DESCRIBE THE ISSUE ================= */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>4. Describe the Issue</span>
            <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            Required
          </span>
        </div>

        <p className="text-xs text-gray-500">Provide helpful details regarding severity, safety hazards, and landmark markers.</p>

        <textarea
          rows={4}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed"
          required
        />

        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>Be specific to facilitate faster resolution</span>
          <span className="font-mono font-medium">{description.length} / 500</span>
        </div>
      </div>

      {/* ================= 5. ADDITIONAL INFORMATION (OPTIONAL) ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdditional(!showAdditional)}
          className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span>⚙️ 5. Additional Information (Optional)</span>
          </span>
          {showAdditional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdditional && (
          <div className="p-4 pt-0 border-t border-gray-100 space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Landmark Reference</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite City Bakery, near bus stop"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Preferred Inspection Time</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-xl text-xs">
                <option>Anytime (24x7 Emergency)</option>
                <option>Morning (9 AM - 1 PM)</option>
                <option>Afternoon (1 PM - 5 PM)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ================= 6. CITIZEN VERIFICATION ================= */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>6. Citizen Verification</span>
          </label>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
            <Check size={12} /> KYC Verified
          </span>
        </div>

        <p className="text-xs text-gray-500">Official progress tracking SMS notifications will be dispatched to this government registered profile.</p>

        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-150 flex items-center justify-between text-xs font-semibold text-gray-800">
          <div>
            <span className="text-[10px] text-gray-400 uppercase block font-mono">Registered Mobile</span>
            <span className="text-xs font-bold text-gray-900">{profile.phone || 'Not provided'}</span>
          </div>
          <Lock size={16} className="text-blue-700" />
        </div>
      </div>

      {/* ================= STATUTORY DECLARATION ================= */}
      <div className="flex items-start gap-2.5 text-xs text-gray-600 leading-snug">
        <input
          type="checkbox"
          id="statutory-declaration"
          checked={declared}
          onChange={(e) => setDeclared(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-blue-700 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="statutory-declaration" className="cursor-pointer select-none text-[11px]">
          I hereby declare and confirm that the information and photographs submitted are accurate to the best of my knowledge and represent a genuine public grievance under statutory citizen bylaws.
        </label>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="space-y-2.5 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !declared}
          className="report-cta w-full py-3.5 px-5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Submitting Grievance...</span>
          ) : (
            <>
              <span>Submit Grievance</span>
              <Send size={16} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="w-full py-3 px-5 bg-blue-50 hover:bg-blue-100 text-[var(--gov-blue)] border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Save size={15} />
          <span>{isDraftSaved ? 'Draft Saved!' : 'Save Grievance as Draft'}</span>
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        By submitting, you acknowledge that complaint details will be assigned to the relevant Urban Local Body (ULB) under the Public Services Guarantee Act.
      </p>
    </form>
  );
}
