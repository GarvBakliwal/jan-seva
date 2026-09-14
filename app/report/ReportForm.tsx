'use client';

import { useRef, useState } from 'react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Send,
  CheckCircle2,
  Building2,
  Crosshair,
  Lock,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Profile } from '@/types/profile';
import PhotoUploadSection from '@/components/PhotoUploadSection';

const DraggableMap = dynamic(() => import("../../components/DraggableMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-gray-500">
      Loading interactive map...
    </div>
  ),
});

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
  const [imageUrl, setImageUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [address, setAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");
  const [landmark, setLandmark] = useState('');
  const [showAdditional, setShowAdditional] = useState(false);
  const [declared, setDeclared] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState('');
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation check
    const trimmedDesc = description.trim();
    if (!declared || !trimmedDesc) {
      setServerError('Please accept the declaration and provide a description.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      let finalImageUrl = imageUrl || undefined;

      // 2. Handle Image Upload if a raw File object was passed
      if (photoFile instanceof File) {
        const uploadData = new FormData();
        uploadData.append('file', photoFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadResult.error || 'Failed to upload photo evidence.');
        }

        finalImageUrl = uploadResult.data?.url;
      }

      // 3. Construct Clean Payload
      const payload = {
        category,
        description: trimmedDesc,
        image_url: finalImageUrl,
        latitude: typeof latitude === 'number' ? latitude : undefined,
        longitude: typeof longitude === 'number' ? longitude : undefined,
        address: address?.trim() || undefined,
        landmark: landmark?.trim() || undefined,
      };

      // 4. Submit Complaint
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to submit complaint.');
      }

      // 5. Success State & Navigation
      setSubmittedNumber(result.data.complaint_number);
      setSuccessMsg(true);

      setTimeout(() => {
        router.push('/complaints');
      }, 1800);

    } catch (error) {
      console.error('Complaint submission error:', error);
      setServerError(
        error instanceof Error ? error.message : 'Unable to submit complaint. Please try again.'
      );
      setIsSubmitting(false); // Only set submitting to false if failed; keep disabled during success redirect
    }
  };

  // Handle GPS detection button
  const handleDetectLocation = (): void => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const { latitude: lat, longitude: lon, accuracy } = position.coords;

        setLatitude(lat);
        setLongitude(lon);
        setCoordinates(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        setGpsAccuracy(accuracy);

        try {
          const response = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
          if (!response.ok) throw new Error("Failed to find address");

          const data: { address?: string } = await response.json();
          setAddress(data.address || "Address could not be determined");
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setAddress("Location detected, but address could not be determined.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error: GeolocationPositionError) => {
        setIsDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable it in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Your current location could not be determined.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to detect your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Callback triggered when the user finishes dragging the map pin
  const handleManualPinMove = async (newLat: number, newLon: number): Promise<void> => {
    setLatitude(newLat);
    setLongitude(newLon);
    setCoordinates(`${newLat.toFixed(6)}, ${newLon.toFixed(6)}`);

    try {
      const response = await fetch(`/api/reverse-geocode?lat=${newLat}&lon=${newLon}`);
      if (response.ok) {
        const data: { address?: string } = await response.json();
        if (data.address) setAddress(data.address);
      }
    } catch (error) {
      console.error("Failed to reverse geocode drag position:", error);
    }
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
      <PhotoUploadSection
        onFileSelect={(file) => setPhotoFile(file)}
        maxSizeBytes={5 * 1024 * 1024} // 5MB limit
      />

      {/* ================= 3. ISSUE LOCATION ================= */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>3. Issue Location</span>
            <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${isDetectingLocation
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : latitude !== null
                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                : "text-gray-600 bg-gray-50 border-gray-200"
              }`}
          >
            {isDetectingLocation ? (
              <>
                <Loader2 size={11} className="animate-spin" /> Detecting...
              </>
            ) : (
              <>
                <MapPin size={11} /> {latitude !== null ? "GPS Active" : "GPS Inactive"}
              </>
            )}
          </span>
        </div>

        <p className="text-xs text-gray-500">
          Location is used strictly to dispatch municipal inspection teams to the exact spot.
        </p>

        {/* Location Error Banner */}
        {locationError && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Geolocation Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDetectingLocation ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Crosshair size={15} />
          )}
          <span>{isDetectingLocation ? "Fetching Location..." : "Detect Current Location"}</span>
        </button>

        {/* Location Metadata Details */}
        <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
              🟢 GPS LOCATION
            </span>
            <span className="text-gray-500">
              Accuracy {gpsAccuracy ? `± ${Math.round(gpsAccuracy)} meters` : "--"}
            </span>
          </div>

          <div className="text-xs font-bold text-gray-900 leading-tight">
            {address || "Use GPS or enter the issue address below"}
          </div>
          <div className="text-[11px] text-gray-600">
            {coordinates || "Coordinates not captured yet"}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            {latitude !== null && longitude !== null
              ? `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : "Location will be saved with the complaint"}
          </div>
        </div>

        {/* Editable Text Address Fallback */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
            <span>Edit Address / Landmark Details</span>
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
            placeholder="Enter house/building number, street name, or nearby landmarks..."
            className="w-full p-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Interactive Draggable Pin Map */}
        <div className="relative rounded-xl overflow-hidden border border-gray-300 bg-slate-200 h-48">
          {latitude !== null && longitude !== null ? (
            <DraggableMap
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleManualPinMove}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 flex items-center justify-center text-xs text-gray-400">
              <div className="flex flex-col items-center gap-1">
                <MapPin size={24} className="text-gray-400 animate-bounce" />
                <span>Detect location to render interactive pin</span>
              </div>
            </div>
          )}

          {latitude !== null && (
            <div className="absolute bottom-2 left-2 right-2 z-10 p-2 rounded-lg bg-white/90 backdrop-blur-md border border-gray-200 flex items-center justify-between text-[11px] font-semibold text-gray-700 shadow-xs">
              <span>📍 Drag pin to adjust exact hazard location</span>
            </div>
          )}
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
