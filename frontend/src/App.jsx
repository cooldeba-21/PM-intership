import React, { useState, useEffect, useCallback, useMemo } from "react";

// --- Helper Components & Icons ---

const BriefcaseIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const UserPlusIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const LinkIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
  </svg>
);

const ChartBarIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M18.7 8a6 6 0 0 0-6-6H3" />
    <path d="M12.7 14a6 6 0 0 0-6-6H3" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.93 2.24a2.3 2.3 0 0 1 4.14 0l.33 1.2a2.3 2.3 0 0 0 2.2 1.63h1.26a2.3 2.3 0 0 1 2.3 2.3v1.26a2.3 2.3 0 0 0 1.63 2.2l1.2.33a2.3 2.3 0 0 1 0 4.14l-1.2.33a2.3 2.3 0 0 0-1.63 2.2v1.26a2.3 2.3 0 0 1-2.3 2.3h-1.26a2.3 2.3 0 0 0-2.2 1.63l-.33 1.2a2.3 2.3 0 0 1-4.14 0l-.33-1.2a2.3 2.3 0 0 0-2.2-1.63H5.8a2.3 2.3 0 0 1-2.3-2.3v-1.26a2.3 2.3 0 0 0-1.63-2.2l-1.2-.33a2.3 2.3 0 0 1 0-4.14l1.2-.33A2.3 2.3 0 0 0 3.5 8.2V6.94a2.3 2.3 0 0 1 2.3-2.3h1.26a2.3 2.3 0 0 0 2.2-1.63l.33-1.2Z" />
    <path d="M12 12h.01" />
  </svg>
);

const Spinner = ({ small = false }) => (
  <div
    className={`animate-spin rounded-full border-b-2 border-indigo-400 ${
      small ? "h-5 w-5" : "h-8 w-8"
    }`}
  ></div>
);

const Alert = ({ message, type = "success" }) => {
  const baseClasses = "p-4 rounded-lg text-center font-medium border";
  const typeClasses = {
    success: "bg-green-900 bg-opacity-50 text-green-200 border-green-700",
    error: "bg-red-900 bg-opacity-50 text-red-200 border-red-700",
    info: "bg-blue-900 bg-opacity-50 text-blue-200 border-blue-700",
  };
  return <div className={`${baseClasses} ${typeClasses[type]}`}>{message}</div>;
};

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- API Configuration ---
const API_BASE_URL = "http://127.0.0.1:8000"; // Using 127.0.0.1 for better compatibility on macOS

// --- Gemini API Call ---
const generateWithGemini = async (prompt) => {
  const apiKey = ""; // Per instructions, leave empty
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      `Gemini API failed: ${errorBody.error?.message || "Unknown error"}`
    );
  }
  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) return text;
  throw new Error("Failed to extract text from Gemini response.");
};

// --- Data Constants ---
const SKILLS_OPTIONS = [
  "React",
  "Node.js",
  "Python",
  "Data Analysis",
  "UI/UX Design",
  "Project Management",
  "SEO",
  "Content Writing",
  "Financial Modeling",
  "Excel",
  "Machine Learning",
  "SQL",
  "Django",
  "Digital Marketing",
  "Social Media",
  "Analytics",
  "Financial Analysis",
  "Power BI",
  "Risk Management",
  "Investment",
  "Figma",
  "Adobe Creative Suite",
  "Prototyping",
  "User Research",
];
const LOCATION_OPTIONS = [
  "Bangalore",
  "Pune",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Remote",
  "Gujarat",
  "Bihar",
  "Kolkata",
  "Ahmedabad",
  "Patna",
];
const QUALIFICATION_OPTIONS = [
  "B.Tech",
  "M.Tech",
  "MBA",
  "BBA",
  "BCA",
  "MCA",
  "B.Com",
  "CFA Level 1",
  "B.Des",
  "Mass Communication",
  "Diploma in Design",
];
const SECTOR_OPTIONS = [
  "IT",
  "Finance",
  "Marketing",
  "Healthcare",
  "E-commerce",
  "Education",
  "Technology",
  "Data Science",
  "Banking",
  "Design",
];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Gujarati", "Telugu"];

const MultiSelect = ({ options, selected, onChange, label }) => {
  const handleSelect = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-2 text-sm cursor-pointer text-gray-300"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => handleSelect(option)}
              className="h-4 w-4 text-indigo-500 bg-gray-600 border-gray-500 rounded focus:ring-indigo-500"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// --- Form Components ---

function CandidateForm({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [],
    qualifications: [],
    location_preference: [],
    current_location: "",
    category: "General",
    district_type: "Urban",
    past_participation: false,
    experience_months: 0,
    preferred_sectors: [],
    languages: ["English"],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    if (apiResponse) {
      const timer = setTimeout(() => setApiResponse(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiResponse]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "A valid email is required.";
    if (formData.skills.length === 0)
      newErrors.skills = "At least one skill is required.";
    if (formData.qualifications.length === 0)
      newErrors.qualifications = "At least one qualification is required.";
    if (formData.location_preference.length === 0)
      newErrors.location_preference = "Location preference is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "radio" ? value === "Yes" : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register_candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to register candidate.");
      }

      setApiResponse({
        type: "success",
        message: "Candidate registered successfully!",
      });
      onRegistrationSuccess();
      setFormData({
        name: "",
        email: "",
        phone: "",
        skills: [],
        qualifications: [],
        location_preference: [],
        current_location: "",
        category: "General",
        district_type: "Urban",
        past_participation: false,
        experience_months: 0,
        preferred_sectors: [],
        languages: ["English"],
      });
    } catch (error) {
      let errorMessage = error.message;
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = `Network Error: Could not connect to the backend. Please ensure it's running at ${API_BASE_URL} and CORS is enabled.`;
      }
      setApiResponse({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        Candidate Registration
      </h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <InputField
            label="Current Location"
            name="current_location"
            value={formData.current_location}
            onChange={handleChange}
          />
        </div>
        <MultiSelect
          label="Skills"
          options={SKILLS_OPTIONS}
          selected={formData.skills}
          onChange={(v) => setFormData((p) => ({ ...p, skills: v }))}
        />
        {errors.skills && (
          <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
        )}

        <MultiSelect
          label="Qualifications"
          options={QUALIFICATION_OPTIONS}
          selected={formData.qualifications}
          onChange={(v) => setFormData((p) => ({ ...p, qualifications: v }))}
        />
        {errors.qualifications && (
          <p className="mt-2 text-sm text-red-600">{errors.qualifications}</p>
        )}

        <MultiSelect
          label="Location Preferences"
          options={LOCATION_OPTIONS}
          selected={formData.location_preference}
          onChange={(v) =>
            setFormData((p) => ({ ...p, location_preference: v }))
          }
        />
        {errors.location_preference && (
          <p className="mt-2 text-sm text-red-600">
            {errors.location_preference}
          </p>
        )}

        <MultiSelect
          label="Preferred Sectors"
          options={SECTOR_OPTIONS}
          selected={formData.preferred_sectors}
          onChange={(v) => setFormData((p) => ({ ...p, preferred_sectors: v }))}
        />
        <MultiSelect
          label="Languages"
          options={LANGUAGE_OPTIONS}
          selected={formData.languages}
          onChange={(v) => setFormData((p) => ({ ...p, languages: v }))}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField
            label="Social Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={["General", "OBC", "SC", "ST"]}
          />
          <SelectField
            label="District Type"
            name="district_type"
            value={formData.district_type}
            onChange={handleChange}
            options={["Urban", "Rural", "Aspirational"]}
          />
          <InputField
            label="Experience (Months)"
            name="experience_months"
            type="number"
            value={formData.experience_months}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Participated in past schemes?
          </label>
          <div className="mt-2 flex items-center space-x-4 text-gray-300">
            <label className="flex items-center">
              <input
                type="radio"
                name="past_participation"
                value="Yes"
                checked={formData.past_participation === true}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-500 bg-gray-600 border-gray-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="past_participation"
                value="No"
                checked={formData.past_participation === false}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-500 bg-gray-600 border-gray-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm">No</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          {apiResponse && (
            <div className="mb-4">
              <Alert message={apiResponse.message} type={apiResponse.type} />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : "Register Candidate"}
          </button>
        </div>
      </form>
    </div>
  );
}

function IndustryForm() {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    internship_title: "",
    internship_description: "",
    required_skills: [],
    preferred_qualifications: [],
    location: "",
    sector: "",
    internship_capacity: 1,
    duration_months: 3,
    stipend_range: "",
    remote_allowed: false,
    preferred_candidate_profile: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    if (apiResponse) {
      const timer = setTimeout(() => setApiResponse(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiResponse]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company_name.trim())
      newErrors.company_name = "Company name is required.";
    if (!formData.internship_title.trim())
      newErrors.internship_title = "Internship title is required.";
    if (formData.required_skills.length === 0)
      newErrors.required_skills = "At least one skill is required.";
    if (!formData.location) newErrors.location = "Location is required.";
    if (!formData.sector) newErrors.sector = "Sector is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleGenerateDescription = async () => {
    // ... (omitted for brevity, no changes)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register_industry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to register industry.");
      }
      setApiResponse({
        type: "success",
        message: "Industry registered successfully!",
      });
      setFormData({
        company_name: "",
        contact_email: "",
        contact_phone: "",
        internship_title: "",
        internship_description: "",
        required_skills: [],
        preferred_qualifications: [],
        location: "",
        sector: "",
        internship_capacity: 1,
        duration_months: 3,
        stipend_range: "",
        remote_allowed: false,
        preferred_candidate_profile: "",
      });
    } catch (error) {
      let errorMessage = error.message;
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = `Network Error: Could not connect to the backend. Please ensure it's running at ${API_BASE_URL} and CORS is enabled.`;
      }
      setApiResponse({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        Industry Registration
      </h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            error={errors.company_name}
          />
          <InputField
            label="Internship Title"
            name="internship_title"
            value={formData.internship_title}
            onChange={handleChange}
            error={errors.internship_title}
          />
          <InputField
            label="Contact Email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
          />
          <InputField
            label="Contact Phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
          <SelectField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            options={LOCATION_OPTIONS}
            error={errors.location}
          />
          <SelectField
            label="Sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            options={SECTOR_OPTIONS}
            error={errors.sector}
          />
          <InputField
            label="Internship Capacity"
            name="internship_capacity"
            type="number"
            value={formData.internship_capacity}
            onChange={handleChange}
          />
          <InputField
            label="Duration (Months)"
            name="duration_months"
            type="number"
            value={formData.duration_months}
            onChange={handleChange}
          />
        </div>

        <InputField
          label="Stipend Range (e.g., ₹15k - ₹25k)"
          name="stipend_range"
          value={formData.stipend_range}
          onChange={handleChange}
        />

        <MultiSelect
          label="Required Skills"
          options={SKILLS_OPTIONS}
          selected={formData.required_skills}
          onChange={(v) => setFormData((p) => ({ ...p, required_skills: v }))}
        />
        {errors.required_skills && (
          <p className="mt-2 text-sm text-red-600">{errors.required_skills}</p>
        )}

        <MultiSelect
          label="Preferred Qualifications"
          options={QUALIFICATION_OPTIONS}
          selected={formData.preferred_qualifications}
          onChange={(v) =>
            setFormData((p) => ({ ...p, preferred_qualifications: v }))
          }
        />

        <div>
          <label
            htmlFor="internship_description"
            className="block text-sm font-medium text-gray-300"
          >
            Internship Description
          </label>
          <textarea
            name="internship_description"
            id="internship_description"
            rows="4"
            value={formData.internship_description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200"
          />
        </div>
        <div>
          <label
            htmlFor="preferred_candidate_profile"
            className="block text-sm font-medium text-gray-300"
          >
            Preferred Candidate Profile
          </label>
          <textarea
            name="preferred_candidate_profile"
            id="preferred_candidate_profile"
            rows="3"
            value={formData.preferred_candidate_profile}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200"
          />
        </div>

        <div className="flex items-center">
          <input
            id="remote_allowed"
            name="remote_allowed"
            type="checkbox"
            checked={formData.remote_allowed}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-500 bg-gray-600 border-gray-500 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="remote_allowed"
            className="ml-2 block text-sm text-gray-300"
          >
            Remote work allowed
          </label>
        </div>

        <div className="pt-4">
          {apiResponse && (
            <div className="mb-4">
              <Alert message={apiResponse.message} type={apiResponse.type} />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : "Register Industry"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable Form Field Components
const InputField = ({ label, name, type = "text", value, onChange, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-3 py-2 bg-gray-700 border ${
        error ? "border-red-500" : "border-gray-600"
      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200`}
    />
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 text-gray-200 border ${
        error ? "border-red-500" : "border-gray-600"
      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

function MatchDashboard({ candidates }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    show: false,
    content: "",
    title: "",
  });

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === selectedCandidateId),
    [candidates, selectedCandidateId]
  );

  const handleFindMatches = useCallback(async () => {
    if (!selectedCandidateId) return;
    setIsLoading(true);
    setError(null);
    setMatches([]);
    try {
      const response = await fetch(`${API_BASE_URL}/match_internships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: selectedCandidateId, top_n: 10 }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "Failed to fetch matches.");
      }
      setMatches(result.matches || []);
    } catch (err) {
      let errorMessage = err.message;
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMessage = `Network Error: Could not connect to the backend. Please ensure it's running and CORS is enabled.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCandidateId]);

  const handleGetAnalysis = async (match) => {
    if (!selectedCandidate) return;
    setIsAnalyzing(true);
    const industry = {
      name: match.company_name,
      required_skills: match.required_skills || [],
    }; // Fallback for safety
    setAnalysisResult({
      show: true,
      content: "",
      title: `Analysis for ${selectedCandidate.name} & ${industry.name}`,
    });

    try {
      const prompt = `You are a career counselor. Analyze this internship match:\nCANDIDATE: Skills - ${selectedCandidate.skills.join(
        ", "
      )}; Qualification - ${selectedCandidate.qualifications.join(
        ", "
      )}.\nINTERNSHIP: Company - ${
        industry.name
      }; Required Skills - ${industry.required_skills.join(
        ", "
      )}.\nExplain key synergies and growth potential.`;
      const result = await generateWithGemini(prompt);
      setAnalysisResult((prev) => ({ ...prev, content: result }));
    } catch (error) {
      setAnalysisResult((prev) => ({
        ...prev,
        content: `<p class="text-red-400">${error.message}</p>`,
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Modal
        show={analysisResult.show}
        onClose={() =>
          setAnalysisResult({ show: false, content: "", title: "" })
        }
        title={analysisResult.title}
      >
        {isAnalyzing ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <div className="text-gray-300 whitespace-pre-wrap">
            {analysisResult.content}
          </div>
        )}
      </Modal>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Matchmaking Dashboard
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-2/3">
              <label
                htmlFor="candidate-select"
                className="block text-sm font-medium text-gray-300"
              >
                Select a Candidate
              </label>
              <select
                id="candidate-select"
                value={selectedCandidateId}
                onChange={(e) => {
                  setSelectedCandidateId(e.target.value);
                  setMatches([]);
                  setError(null);
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 text-gray-200 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">-- Select --</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFindMatches}
              disabled={!selectedCandidateId || isLoading}
              className="w-full sm:w-auto mt-2 sm:mt-6 py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? <Spinner small /> : "Find Matches"}
            </button>
          </div>
          {candidates.length === 0 && !error && (
            <p className="text-sm text-gray-500 mt-4">
              No candidates found. Register one or check backend connection.
            </p>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center mt-8">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="mt-8">
            <Alert message={error} type="error" />
          </div>
        )}

        {matches.length > 0 && selectedCandidate && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-gray-100 mb-4">
              Top Matches for{" "}
              <span className="text-indigo-400">{selectedCandidate.name}</span>
            </h3>
            <div className="space-y-4">
              {matches.map((match, index) => {
                const score = (match.match_score?.overall_score || 0) * 100;
                return (
                  <div
                    key={match.industry_id}
                    className="p-4 border border-gray-700 rounded-lg bg-gray-900"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-100">
                          {index + 1}. {match.company_name}
                        </p>
                        <p className="text-md text-indigo-400">
                          {match.internship_title}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-300">
                            Required Skills:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {(match.required_skills || []).map((skill) => (
                              <span
                                key={skill}
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  selectedCandidate.skills.includes(skill)
                                    ? "bg-green-800 text-green-100"
                                    : "bg-gray-600 text-gray-200"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-center w-full md:w-auto mt-4 md:mt-0">
                        <div
                          className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto ${
                            score > 85
                              ? "bg-green-800 text-green-100"
                              : score > 70
                              ? "bg-yellow-800 text-yellow-100"
                              : "bg-red-800 text-red-100"
                          }`}
                        >
                          {Math.round(score)}%
                        </div>
                        <p className="text-sm font-medium text-gray-400 mt-2">
                          Match Score
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-700 mt-4 pt-4 flex justify-end">
                      <button
                        onClick={() => handleGetAnalysis(match)}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:text-gray-500"
                      >
                        <SparklesIcon /> Get AI Analysis
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error("Could not fetch system stats.");
        const data = await response.json();
        setStats(data.system_stats);
      } catch (err) {
        let errorMessage = err.message;
        if (err instanceof TypeError && err.message === "Failed to fetch") {
          errorMessage = `Network Error: Could not connect to the backend. Please ensure it's running and CORS is enabled.`;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center mt-8">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="mt-8">
        <Alert message={error} type="error" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        System Statistics
      </h2>
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-gray-700">
            <h3 className="text-4xl font-bold text-indigo-400">
              {stats.candidates.total}
            </h3>
            <p className="text-gray-400 mt-2">Total Candidates Registered</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-gray-700">
            <h3 className="text-4xl font-bold text-indigo-400">
              {stats.industries.total}
            </h3>
            <p className="text-gray-400 mt-2">Total Industries Registered</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-gray-700 col-span-1 sm:col-span-2">
            <h3 className="text-4xl font-bold text-indigo-400">
              {stats.internships.available_positions}
            </h3>
            <p className="text-gray-400 mt-2">Available Internship Positions</p>
          </div>
        </div>
      ) : (
        <p>No stats available.</p>
      )}
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [page, setPage] = useState("candidate");
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/candidates`);
      if (!response.ok) throw new Error("Failed to fetch candidates");
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError(
          `Could not connect to the backend at ${API_BASE_URL}. Please ensure the server is running and accessible.`
        );
      } else {
        setError(error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const NavButton = ({ targetPage, icon, children }) => {
    const isActive = page === targetPage;
    return (
      <button
        onClick={() => setPage(targetPage)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? "bg-indigo-600 text-white shadow"
            : "text-gray-300 hover:bg-gray-700"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{children}</span>
      </button>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-200">
      <header className="bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-700">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-indigo-400">
            PM Internship Matching System
          </h1>
          <div className="flex items-center justify-center gap-2 p-1 bg-gray-900 rounded-lg">
            <NavButton
              targetPage="candidate"
              icon={<UserPlusIcon className="w-5 h-5" />}
            >
              Candidate
            </NavButton>
            <NavButton
              targetPage="industry"
              icon={<BriefcaseIcon className="w-5 h-5" />}
            >
              Industry
            </NavButton>
            <NavButton
              targetPage="dashboard"
              icon={<LinkIcon className="w-5 h-5" />}
            >
              Dashboard
            </NavButton>
            <NavButton
              targetPage="stats"
              icon={<ChartBarIcon className="w-5 h-5" />}
            >
              Stats
            </NavButton>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8">
            <Alert message={error} type="error" />
          </div>
        )}
        {page === "candidate" && (
          <CandidateForm onRegistrationSuccess={fetchCandidates} />
        )}
        {page === "industry" && <IndustryForm />}
        {page === "dashboard" && <MatchDashboard candidates={candidates} />}
        {page === "stats" && <StatsDashboard />}
      </main>
    </div>
  );
}
