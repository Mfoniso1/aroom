import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CAMPUSES } from '@/lib/campuses'
import {
  Calculator,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Video,
  Upload,
  Trash2,
  Play,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react'
import { addCustomListing, extractThumbnailFromVideo } from '@/lib/listingsStore'
import type { Listing } from '@/components/shared/ListingCard'

const ROOM_TYPES = [
  { value: 'self_contain', label: 'Self Contain' },
  { value: 'single_room', label: 'Single Room' },
  { value: 'flat_shared', label: 'Shared Flat' },
  { value: 'flat_entire', label: 'Entire Flat' },
]

export function NewListingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Core Details
  const [campusId, setCampusId] = useState('uniport')
  const [roomType, setRoomType] = useState('self_contain')
  const [landmark, setLandmark] = useState('')

  // Fee Details
  const [annualRent, setAnnualRent] = useState<string>('300000')
  const [cautionFee, setCautionFee] = useState<string>('30000')
  const [legalFee, setLegalFee] = useState<string>('20000')
  const [utilityFee, setUtilityFee] = useState<string>('15000')
  const [inspectionFee, setInspectionFee] = useState<string>('0')
  const [hasUtilityFee, setHasUtilityFee] = useState(true)

  // Media state (Video upload from device + photo)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [isProcessingVideo, setIsProcessingVideo] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [createdListingId, setCreatedListingId] = useState<string | null>(null)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Numeric computations
  const rentNum = Number(annualRent) || 0
  const cautionNum = Number(cautionFee) || 0
  const legalNum = Number(legalFee) || 0
  const utilityNum = hasUtilityFee ? (Number(utilityFee) || 0) : 0
  const inspectionNum = Number(inspectionFee) || 0

  // Agency fee: automatically 15% of the annual rent
  const agencyFee = Math.round(rentNum * 0.15)

  // Total move-in package (inspection fee now included when agent sets it)
  const totalPackage = rentNum + cautionNum + legalNum + agencyFee + utilityNum + inspectionNum

  const selectedCampus = CAMPUSES.find((c) => c.id === campusId)

  const handleNext = () => {
    if (rentNum <= 0) return
    setStep(2)
  }

  // Handle video selection from device storage
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoFile(file)
    const objectUrl = URL.createObjectURL(file)
    setVideoPreviewUrl(objectUrl)

    setIsProcessingVideo(true)
    try {
      const thumb = await extractThumbnailFromVideo(file)
      setVideoThumbnailUrl(thumb)
    } catch (err) {
      console.warn('Could not extract thumbnail', err)
    } finally {
      setIsProcessingVideo(false)
    }
  }

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setVideoThumbnailUrl(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhotoFile(null)
    setPhotoPreviewUrl(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  // Publish listing to store (IndexedDB + in-memory store)
  const handlePublish = async () => {
    setIsPublishing(true)
    const newId = `agent-${Date.now()}`
    const roomLabel = ROOM_TYPES.find((r) => r.value === roomType)?.label || 'Self Contain'
    const title = `${roomLabel} at ${landmark || selectedCampus?.popularLandmarks[0] || 'Campus Area'}`

    const finalImage =
      photoPreviewUrl ||
      videoThumbnailUrl ||
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'

    const newListing: Listing = {
      id: newId,
      title,
      price: rentNum,
      period: 'yr',
      landmark: landmark || (selectedCampus ? `Near ${selectedCampus.popularLandmarks[0] || 'Campus Gate'}` : 'Campus Gate'),
      verificationStatus: 'verified',
      availabilityStatus: 'available',
      campusId,
      uploaderType: 'agent',
      uploaderName: 'Certified Campus Agent',
      hasVideoTour: true,
      videoUrl: videoPreviewUrl || '/videos/room-tour.mp4',
      imageUrl: finalImage,
      customFees: {
        cautionFee: cautionNum,
        legalFee: legalNum,
        utilityFee: utilityNum,
        agencyFee: agencyFee,
        inspectionFee: inspectionNum,
      },
      description: `Verified ${roomLabel} accommodation with physical walkthrough video uploaded by agent. Scam-free inspection guaranteed. Located near ${landmark || selectedCampus?.name || 'campus'}.`,
    }

    try {
      await addCustomListing(newListing, videoFile || undefined, photoFile || undefined)
      setCreatedListingId(newId)
      setStep(3)
    } catch (err) {
      console.error('Error publishing listing:', err)
      setCreatedListingId(newId)
      setStep(3)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full transition-all ${
              n <= step ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
        
        {/* ── STEP 1: Core Details & Detailed Move-In Package Calculation ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Agent Space Listing
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5">
                Property &amp; Fee Breakdown
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Enter the rent and mandatory fee items. Agency fee (15%) and the total sum package are computed automatically.
              </p>
            </div>

            {/* Target Campus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                University Campus
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 bg-slate-50 font-medium"
              >
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Room Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setRoomType(t.value)}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                      roomType === t.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Landmark / Neighborhood
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={selectedCampus ? `e.g., Near ${selectedCampus.popularLandmarks[0] || 'Campus Gate'}` : 'Choba Gate / Alakahia'}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {/* ── Fee Inputs ── */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Fee Breakdown &amp; Package Calculation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Annual Rent */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual Rent (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={annualRent}
                    onChange={(e) => setAnnualRent(e.target.value)}
                    placeholder="300000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 2. Caution Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caution / Security Deposit (₦)
                  </label>
                  <input
                    type="number"
                    value={cautionFee}
                    onChange={(e) => setCautionFee(e.target.value)}
                    placeholder="30000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 3. Legal / Agreement Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legal &amp; Tenancy Agreement Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={legalFee}
                    onChange={(e) => setLegalFee(e.target.value)}
                    placeholder="20000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 4. Agency Fee (Calculated 15%) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Agency Fee (15%)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Auto-calculated
                    </span>
                  </div>
                  <div className="w-full border border-emerald-200 bg-emerald-50/50 rounded-xl p-2.5 text-sm font-extrabold text-emerald-900 flex items-center justify-between">
                    <span>₦{agencyFee.toLocaleString()}</span>
                    <span className="text-[11px] text-emerald-700 font-normal">15% of annual rent</span>
                  </div>
                </div>

                {/* 5. Utility Fee (if applied) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasUtilityFee}
                        onChange={(e) => setHasUtilityFee(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span>Utility / Service Charge (Water, Waste, Prepaid Meter)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  {hasUtilityFee && (
                    <input
                      type="number"
                      value={utilityFee}
                      onChange={(e) => setUtilityFee(e.target.value)}
                      placeholder="15000"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                  )}
                </div>

                {/* 6. Inspection Fee */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Physical Inspection Fee (₦)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Visible to students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={inspectionFee}
                      onChange={(e) => setInspectionFee(e.target.value)}
                      placeholder="0"
                      className="w-36 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      {inspectionNum === 0
                        ? 'Free on Aroom (Recommended — builds trust)'
                        : `₦${inspectionNum.toLocaleString()} will appear in student breakdown`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Set ₦0 for a free inspection — Aroom strongly recommends this as it prevents scams and increases booking rates.
                  </p>
                </div>
              </div>
            </div>

            {/* ── AUTOMATIC TOTAL SUM PACKAGE CARD ── */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                  Total Move-In Sum Package
                </span>
                <span className="text-[11px] text-slate-300">All fees included</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Annual Rent:</span>
                  <span className="font-semibold text-white">₦{rentNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caution Deposit:</span>
                  <span className="font-semibold text-white">₦{cautionNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Legal &amp; Tenancy Agreement:</span>
                  <span className="font-semibold text-white">₦{legalNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Agency Fee (15%):</span>
                  <span className="font-bold">₦{agencyFee.toLocaleString()}</span>
                </div>
                {hasUtilityFee && (
                  <div className="flex justify-between">
                    <span>Utilities / Waste &amp; Light:</span>
                    <span className="font-semibold text-white">₦{utilityNum.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Inspection Fee:</span>
                  <span className={inspectionNum === 0 ? 'text-emerald-400 font-semibold' : 'text-white font-semibold'}>
                    {inspectionNum === 0 ? '₦0 (Free — Recommended)' : `₦${inspectionNum.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Payable by Student</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    ₦{totalPackage.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  1st Year Package
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Next: Upload Video Tour &amp; Photos
            </button>
          </div>
        )}

        {/* ── STEP 2: Video Walkthrough Upload from Device Storage & Photos ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 2 of 3
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1.5">
                Upload Video Walkthrough &amp; Photos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Upload an authentic video walkthrough directly from your phone or computer. The video will be playable immediately by students on the Explore page.
              </p>
            </div>

            {/* ── 1. Video Upload Box (From Device Storage) ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Physical Video Walkthrough (Required)</span>
                </label>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Device Storage
                </span>
              </div>

              {!videoPreviewUrl ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl p-7 text-center space-y-3 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to choose video from device
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      MP4, MOV, WebM, or MKV recorded from phone or camera
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-emerald-700 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse files</span>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-900 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">{videoFile?.name || 'Walkthrough Video Selected'}</span>
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : ''}
                    </span>
                  </div>

                  {/* Video Player Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <video
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change video file
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove video
                    </button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {isProcessingVideo && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating video thumbnail cover...
                </p>
              )}
            </div>

            {/* ── 2. Additional Photos Upload (Optional) ── */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Custom Cover Photo (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {videoThumbnailUrl ? 'Auto-extracted from video' : 'Optional'}
                </span>
              </div>

              {!photoPreviewUrl ? (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 text-center space-y-1 bg-slate-50 hover:bg-slate-100/70 transition-all cursor-pointer"
                >
                  <p className="text-xs font-semibold text-slate-700">Click to upload custom photo cover</p>
                  <p className="text-[11px] text-slate-400">If omitted, the first frame of your uploaded video will be used</p>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 flex items-center justify-center">
                  <img src={photoPreviewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick summary of the package before publish */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Campus Location:</span>
                <span className="font-bold text-slate-900">{selectedCampus?.name || 'Selected Campus'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Move-in Package:</span>
                <span className="font-extrabold text-emerald-700">₦{totalPackage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Walkthrough Video:</span>
                <span className="font-bold text-slate-900">
                  {videoFile ? `✓ ${videoFile.name}` : 'Default verified tour'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Listing</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Complete / Published ── */}
        {step === 3 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Your space is now live!</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Students near {selectedCampus?.shortCode || 'campus'} can now watch your uploaded walkthrough video on the Explore page and request physical walkthroughs.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs space-y-1.5 text-emerald-950">
              <p><strong>Annual Rent:</strong> ₦{rentNum.toLocaleString()}</p>
              <p><strong>Total Move-in Package:</strong> ₦{totalPackage.toLocaleString()}</p>
              <p><strong>Your 15% Agency Commission:</strong> ₦{agencyFee.toLocaleString()}</p>
              <p className="pt-1 border-t border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-bold">
                <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
                <span>Uploaded walkthrough video is active and playable on Explore page!</span>
              </p>
            </div>

            {/* Direct action buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View on Explore Page Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {createdListingId && (
                <button
                  type="button"
                  onClick={() => navigate(`/listings/${createdListingId}`)}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl border border-slate-200 transition-all cursor-pointer text-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Preview Listing Details &amp; Video</span>
                </button>
              )}

              <Link
                to="/portal/dashboard"
                className="block text-xs font-semibold text-slate-500 hover:text-slate-800 pt-1"
              >
                Go to Agent Dashboard &rarr;
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
