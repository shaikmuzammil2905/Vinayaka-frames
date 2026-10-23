import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Eye, Check, Loader2, Sparkles, AlertCircle, Heart, Calendar, Clock, Weight, Droplet, Building2, Users, Phone } from 'lucide-react';
import { uploadImageHelper } from '../lib/imageUtils';
import toast from 'react-hot-toast';

export interface BabyPersonalizationData {
  gender: 'Boy baby' | 'Girl baby';
  babyPhotoUrl: string;
  parentsPhotoUrl: string;
  babyName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthTime: string;
  birthAmPm: 'AM' | 'PM';
  birthWeight: string;
  birthWeightUnit: string;
  bloodGroup: string;
  hospitalName: string;
  parentsName: string;
  whatsappNumber: string;
}

interface BabyBirthFrameCustomizerProps {
  initialData?: Partial<BabyPersonalizationData>;
  selectedFrameName?: string;
  selectedFrameImg?: string;
  selectedSizeLabel?: string;
  onChange: (data: BabyPersonalizationData, isValid: boolean) => void;
  onPreviewRequest?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not known'];

export const BabyBirthFrameCustomizer: React.FC<BabyBirthFrameCustomizerProps> = ({
  initialData,
  selectedFrameName = 'Classic Wood',
  selectedFrameImg,
  selectedSizeLabel = '8 × 12',
  onChange,
}) => {
  const [gender, setGender] = useState<'Boy baby' | 'Girl baby'>(initialData?.gender || 'Boy baby');
  const [babyPhotoUrl, setBabyPhotoUrl] = useState<string>(initialData?.babyPhotoUrl || '');
  const [parentsPhotoUrl, setParentsPhotoUrl] = useState<string>(initialData?.parentsPhotoUrl || '');
  const [babyName, setBabyName] = useState<string>(initialData?.babyName || '');
  
  const today = new Date();
  const [birthDay, setBirthDay] = useState<string>(initialData?.birthDay || String(today.getDate()));
  const [birthMonth, setBirthMonth] = useState<string>(initialData?.birthMonth || MONTHS[today.getMonth()]);
  const [birthYear, setBirthYear] = useState<string>(initialData?.birthYear || String(today.getFullYear()));
  
  const [birthTime, setBirthTime] = useState<string>(initialData?.birthTime || '10:45');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>(initialData?.birthAmPm || 'AM');
  const [birthWeight, setBirthWeight] = useState<string>(initialData?.birthWeight || '3.5');
  const [bloodGroup, setBloodGroup] = useState<string>(initialData?.bloodGroup || 'O+');
  const [hospitalName, setHospitalName] = useState<string>(initialData?.hospitalName || '');
  const [parentsName, setParentsName] = useState<string>(initialData?.parentsName || '');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(initialData?.whatsappNumber || '');

  // Upload states
  const [uploadingBabyPhoto, setUploadingBabyPhoto] = useState(false);
  const [uploadingParentsPhoto, setUploadingParentsPhoto] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const babyFileRef = useRef<HTMLInputElement>(null);
  const parentsFileRef = useRef<HTMLInputElement>(null);

  // Validate days in selected month & year
  const getDaysInMonth = (monthName: string, yearStr: string) => {
    const monthIndex = MONTHS.indexOf(monthName);
    const year = parseInt(yearStr, 10) || new Date().getFullYear();
    if (monthIndex < 0) return 31;
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const maxDays = getDaysInMonth(birthMonth, birthYear);

  useEffect(() => {
    if (parseInt(birthDay, 10) > maxDays) {
      setBirthDay(String(maxDays));
    }
  }, [birthMonth, birthYear, maxDays, birthDay]);

  // Compute full data
  const currentData: BabyPersonalizationData = {
    gender,
    babyPhotoUrl,
    parentsPhotoUrl,
    babyName: babyName.trim(),
    birthDay,
    birthMonth,
    birthYear,
    birthTime: birthTime.trim(),
    birthAmPm,
    birthWeight: birthWeight.trim(),
    birthWeightUnit: 'kg',
    bloodGroup,
    hospitalName: hospitalName.trim(),
    parentsName: parentsName.trim(),
    whatsappNumber: whatsappNumber.trim(),
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!babyPhotoUrl) {
      errs.babyPhoto = 'Baby photograph is required';
    }
    if (!parentsPhotoUrl) {
      errs.parentsPhoto = 'Parents photograph is required';
    }
    if (!babyName.trim()) {
      errs.babyName = 'Baby name is required';
    }
    if (!birthTime.trim()) {
      errs.birthTime = 'Birth time is required';
    }
    if (!birthWeight.trim() || isNaN(Number(birthWeight)) || Number(birthWeight) <= 0) {
      errs.birthWeight = 'Valid birth weight is required (e.g. 3.5)';
    }
    if (!hospitalName.trim()) {
      errs.hospitalName = 'Hospital name is required';
    }
    if (!parentsName.trim()) {
      errs.parentsName = 'Parents name is required';
    }
    if (whatsappNumber.trim() && !/^\+?[0-9]{10,14}$/.test(whatsappNumber.replace(/[\s-]/g, ''))) {
      errs.whatsappNumber = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Notify parent on change
  useEffect(() => {
    const isValid = !!(
      babyPhotoUrl &&
      parentsPhotoUrl &&
      babyName.trim() &&
      birthTime.trim() &&
      birthWeight.trim() &&
      hospitalName.trim() &&
      parentsName.trim()
    );
    onChange(currentData, isValid);
  }, [
    gender,
    babyPhotoUrl,
    parentsPhotoUrl,
    babyName,
    birthDay,
    birthMonth,
    birthYear,
    birthTime,
    birthAmPm,
    birthWeight,
    bloodGroup,
    hospitalName,
    parentsName,
    whatsappNumber,
  ]);

  const handleBabyPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingBabyPhoto(true);
    try {
      const res = await uploadImageHelper(file);
      if (res.url) {
        setBabyPhotoUrl(res.url);
        setErrors(prev => ({ ...prev, babyPhoto: '' }));
        toast.success('Baby photo uploaded!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload baby photo');
    } finally {
      setUploadingBabyPhoto(false);
      e.target.value = '';
    }
  };

  const handleParentsPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingParentsPhoto(true);
    try {
      const res = await uploadImageHelper(file);
      if (res.url) {
        setParentsPhotoUrl(res.url);
        setErrors(prev => ({ ...prev, parentsPhoto: '' }));
        toast.success('Parents photo uploaded!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload parents photo');
    } finally {
      setUploadingParentsPhoto(false);
      e.target.value = '';
    }
  };

  const handleOpenPreview = () => {
    if (validate()) {
      setPreviewModalOpen(true);
    } else {
      toast.error('Please complete all required fields and photos marked with *');
    }
  };

  return (
    <div className="bg-[#FFFDF7] rounded-3xl p-5 md:p-7 border-2 border-[#FFE8B3] shadow-md space-y-6 my-6">
      {/* Header with Warm Yellow/Orange Accent */}
      <div className="flex items-center justify-between border-b border-[#F7DF94]/60 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-[#FFF2CC] text-[#B87000] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Memory
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
            Baby Birth Frame Personalization
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">
            Fill in the baby details below to create your customized birth frame.
          </p>
        </div>
      </div>

      {/* A. Baby Gender */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender('Boy baby')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer ${
              gender === 'Boy baby'
                ? 'border-[#0088CC] bg-[#EBF7FF] text-[#006699] shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#0088CC]/40'
            }`}
          >
            <span className="text-xl">👶</span>
            <span>Boy baby</span>
            {gender === 'Boy baby' && <Check className="w-4 h-4 ml-auto text-[#0088CC]" />}
          </button>

          <button
            type="button"
            onClick={() => setGender('Girl baby')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer ${
              gender === 'Girl baby'
                ? 'border-[#E04F8A] bg-[#FFF0F6] text-[#B31D58] shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#E04F8A]/40'
            }`}
          >
            <span className="text-xl">👧</span>
            <span>Girl baby</span>
            {gender === 'Girl baby' && <Check className="w-4 h-4 ml-auto text-[#E04F8A]" />}
          </button>
        </div>
      </div>

      {/* B & C. Photos Upload Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Baby Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800">
            Upload Baby Photo <span className="text-red-500">*</span>
          </label>
          <input
            ref={babyFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBabyPhotoUpload}
            className="hidden"
          />

          <div
            className={`aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all ${
              babyPhotoUrl
                ? 'border-green-500 bg-green-50/30'
                : errors.babyPhoto
                ? 'border-red-400 bg-red-50/30'
                : 'border-blue-300 bg-white hover:border-blue-500'
            }`}
          >
            {uploadingBabyPhoto ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-semibold text-gray-600">Uploading baby photo...</span>
              </div>
            ) : babyPhotoUrl ? (
              <div className="relative w-full h-full group">
                <img src={babyPhotoUrl} alt="Baby preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => babyFileRef.current?.click()}
                    className="p-2 bg-white text-gray-800 rounded-full text-xs font-semibold hover:bg-gray-100"
                    title="Replace"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setBabyPhotoUrl('')}
                    className="p-2 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => babyFileRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  className="bg-[#0088CC] hover:bg-[#0077B3] text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-1 shadow-xs pointer-events-none"
                >
                  Choose an Image
                </button>
                <span className="text-[11px] text-gray-500">JPG, PNG, WebP up to 15MB</span>
              </div>
            )}
          </div>
          {errors.babyPhoto && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.babyPhoto}
            </p>
          )}
        </div>

        {/* Parents Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800">
            Parents Photo <span className="text-red-500">*</span>
          </label>
          <input
            ref={parentsFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleParentsPhotoUpload}
            className="hidden"
          />

          <div
            className={`aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all ${
              parentsPhotoUrl
                ? 'border-green-500 bg-green-50/30'
                : errors.parentsPhoto
                ? 'border-red-400 bg-red-50/30'
                : 'border-blue-300 bg-white hover:border-blue-500'
            }`}
          >
            {uploadingParentsPhoto ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-semibold text-gray-600">Uploading parents photo...</span>
              </div>
            ) : parentsPhotoUrl ? (
              <div className="relative w-full h-full group">
                <img src={parentsPhotoUrl} alt="Parents preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => parentsFileRef.current?.click()}
                    className="p-2 bg-white text-gray-800 rounded-full text-xs font-semibold hover:bg-gray-100"
                    title="Replace"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentsPhotoUrl('')}
                    className="p-2 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => parentsFileRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  className="bg-[#0088CC] hover:bg-[#0077B3] text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-1 shadow-xs pointer-events-none"
                >
                  Choose an Image
                </button>
                <span className="text-[11px] text-gray-500">JPG, PNG, WebP up to 15MB</span>
              </div>
            )}
          </div>
          {errors.parentsPhoto && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.parentsPhoto}
            </p>
          )}
        </div>
      </div>

      {/* D. Baby Name */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Baby Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Aarav, Ananya, Reyansh"
          value={babyName}
          onChange={e => {
            setBabyName(e.target.value);
            if (errors.babyName) setErrors(prev => ({ ...prev, babyName: '' }));
          }}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.babyName ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.babyName && (
          <p className="text-xs text-red-600 font-medium mt-1">{errors.babyName}</p>
        )}
      </div>

      {/* E. Birth Date (Day, Month, Year) */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Birth Date <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Day */}
          <div>
            <select
              value={birthDay}
              onChange={e => setBirthDay(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={String(d)}>
                  {d}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500 block text-center mt-0.5">Date</span>
          </div>

          {/* Month */}
          <div>
            <select
              value={birthMonth}
              onChange={e => setBirthMonth(e.target.value)}
              className="w-full px-2.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500 block text-center mt-0.5">Month</span>
          </div>

          {/* Year */}
          <div>
            <select
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              {Array.from({ length: 15 }, (_, i) => today.getFullYear() - i).map(y => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500 block text-center mt-0.5">Year</span>
          </div>
        </div>
      </div>

      {/* F. Birth Time with AM/PM buttons */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Birth Time <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="10:45"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          />

          <div className="flex rounded-xl overflow-hidden border border-gray-300 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setBirthAmPm('AM')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                birthAmPm === 'AM'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setBirthAmPm('PM')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                birthAmPm === 'PM'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      {/* G & H. Birth Weight & Blood Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weight */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">
            Birth Weight (kg) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 3.7"
              value={birthWeight}
              onChange={e => setBirthWeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              kg
            </span>
          </div>
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">
            Blood Group
          </label>
          <select
            value={bloodGroup}
            onChange={e => setBloodGroup(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* I. Hospital Name */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Hospital Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Apollo Cradle Maternity Hospital"
          value={hospitalName}
          onChange={e => setHospitalName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* J. Parents Name */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Parents Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Rahul & Priya Nayak"
          value={parentsName}
          onChange={e => setParentsName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* K. WhatsApp Number */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          WhatsApp Number
        </label>
        <input
          type="tel"
          placeholder="e.g. +91 93982 77441"
          value={whatsappNumber}
          onChange={e => setWhatsappNumber(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl mt-2 flex items-start gap-1.5">
          <span>💬</span>
          <span>We will share you the softcopy for re-confirmation before shipping.</span>
        </p>
      </div>

      {/* Preview Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleOpenPreview}
          className="w-full bg-[#FFF2CC] hover:bg-[#FFE599] text-[#B87000] border-2 border-[#E6B800] font-bold py-3.5 px-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Eye className="w-5 h-5 text-[#B87000]" />
          PREVIEW MY DESIGN
        </button>
      </div>

      {/* Real Design Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-gray-900 text-lg">Design Preview</h3>
                <p className="text-xs text-gray-500">Frame: {selectedFrameName} • Size: {selectedSizeLabel}</p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Printed Baby Birth Frame Artwork */}
            <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-200 flex justify-center">
              <div
                className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl relative border-8 ${
                  gender === 'Boy baby'
                    ? 'bg-gradient-to-br from-[#E6F4FA] via-[#F4F9FD] to-[#D9EDF7] border-[#8C6D46]'
                    : 'bg-gradient-to-br from-[#FFF0F5] via-[#FFF9FB] to-[#FCE4EC] border-[#8C6D46]'
                }`}
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25), inset 0 0 10px rgba(0,0,0,0.1)',
                }}
              >
                {/* Header Title inside Artwork */}
                <div className="text-center mb-4">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-gray-500">
                    WELCOME TO THE WORLD
                  </span>
                  <h3
                    className={`font-serif font-extrabold text-2xl tracking-wide uppercase mt-0.5 ${
                      gender === 'Boy baby' ? 'text-[#005580]' : 'text-[#99154E]'
                    }`}
                  >
                    {babyName || 'Baby Name'}
                  </h3>
                </div>

                {/* Photos Row */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  {/* Primary Baby Photo */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white relative">
                    {babyPhotoUrl ? (
                      <img src={babyPhotoUrl} alt="Baby" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                        Baby Photo
                      </div>
                    )}
                  </div>

                  {/* Parents Photo */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-md bg-white relative -ml-6 mt-8">
                    {parentsPhotoUrl ? (
                      <img src={parentsPhotoUrl} alt="Parents" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[10px]">
                        Parents
                      </div>
                    )}
                  </div>
                </div>

                {/* Birth Details Grid */}
                <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-white/60 shadow-xs space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold">{birthDay} {birthMonth} {birthYear}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold">{birthTime} {birthAmPm}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Weight className="w-3.5 h-3.5 text-primary" />
                      <span>Weight: <strong className="font-semibold">{birthWeight} kg</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Droplet className="w-3.5 h-3.5 text-red-500" />
                      <span>Blood: <strong className="font-semibold">{bloodGroup}</strong></span>
                    </div>
                  </div>

                  {hospitalName && (
                    <div className="flex items-center gap-1.5 text-gray-700 pt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{hospitalName}</span>
                    </div>
                  )}

                  {parentsName && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span className="font-medium truncate">Proud Parents: {parentsName}</span>
                    </div>
                  )}
                </div>

                {/* Footer Frame info inside frame mockup */}
                <div className="mt-3 text-center">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Frame: {selectedFrameName} • {selectedSizeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm cursor-pointer"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  toast.success('Design details confirmed! Click Add to Cart to proceed.');
                }}
                className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover text-sm shadow-md shadow-primary/20 cursor-pointer"
              >
                Looks Great ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
