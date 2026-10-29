import React, { useState } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import axios from 'axios';

// --- STYLES FOR ATS PDF (Lucky Kashyap Format) ---
const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica' },
  name: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  contact: { fontSize: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 2, marginBottom: 6, marginTop: 10 },
  bodyText: { fontSize: 10, lineHeight: 1.3 },
  boldText: { fontSize: 10, fontWeight: 'bold' },
  flexBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  bulletContainer: { flexDirection: 'row', marginBottom: 2, marginTop: 4 },
  bulletPoint: { width: 12, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.3 }
});

// --- PDF COMPONENT ---
const ResumePDF = ({ data }) => {
  const bullets = data.expDetails.split('\n').filter(b => b.trim() !== '');
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.fullName || "YOUR NAME"}</Text>
        <Text style={styles.contact}>{data.address} | {data.phone} | {data.email} | {data.linkedin}</Text>
        
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.bodyText}>{data.summary}</Text>
        
        <Text style={styles.sectionTitle}>Core Competencies</Text>
        <Text style={styles.bodyText}>{data.skills}</Text>
        
        {data.expCompany && (
          <>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            <View style={styles.flexBetween}>
              <Text style={styles.boldText}>{data.expCompany}</Text>
              <Text style={styles.bodyText}>{data.expDates}</Text>
            </View>
            <Text style={styles.bodyText}>{data.expTitle}</Text>
            {bullets.map((bullet, idx) => (
              <View key={idx} style={styles.bulletContainer}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{bullet.replace(/^[-•*]\s*/, '')}</Text>
              </View>
            ))}
          </>
        )}
        
        <Text style={styles.sectionTitle}>Education & Credentials</Text>
        <View style={styles.flexBetween}>
          <Text style={styles.boldText}>{data.eduInst}</Text>
          <Text style={styles.bodyText}>{data.eduDates}</Text>
        </View>
        <Text style={styles.bodyText}>{data.eduDegree}</Text>
        
        <Text style={styles.sectionTitle}>Languages</Text>
        <Text style={styles.bodyText}>{data.languages}</Text>
      </Page>
    </Document>
  );
};

// --- MAIN WIZARD APP ---
export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', linkedin: '', address: '', summary: '', skills: '',
    expCompany: '', expTitle: '', expDates: '', expDetails: '', eduDegree: '', eduInst: '', eduDates: '', languages: ''
  });
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚠️ PASTE YOUR KEYS HERE ⚠️
  const GEMINI_API_KEY = "AQ.Ab8RN6LyB-qhAjD9Sb4zLPszSz5OiW1z58HWwHhAZSBYRSYp-g";
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfnbwKiW964AuxloBlbnXScAiE195UBnPIRpcCu8E0Qmkw2lTYKZ8FzMkuSSniDAefNg/exec";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // DIRECT FRONTEND AI CALL
  const handleAiPolish = async () => {
    if (!formData.expDetails) return alert("Write some basic experience first!");
    setIsPolishing(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert resume writer. Turn this basic job description into two highly professional, ATS-friendly bullet points using the STAR method. Return ONLY the bullet points, no introduction or extra text.\n\nUser input: ${formData.expDetails}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "API Error");
      }

      const polishedText = data.candidates[0].content.parts[0].text.trim();
      setFormData({ ...formData, expDetails: polishedText });
      
    } catch (error) {
      alert(`AI polish failed: ${error.message}`);
    }
    
    setIsPolishing(false);
  };

  const generateAndSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(GOOGLE_SCRIPT_URL, formData, { headers: { 'Content-Type': 'text/plain;charset=utf-8' }});
      const blob = await pdf(<ResumePDF data={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.fullName || 'Candidate'}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Submission to sheet failed, but you can still download your resume.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans flex flex-col items-center">
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Build Your ATS Resume</h1>
        
        {/* Progress Bar */}
        <div className="flex mb-6 space-x-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`h-2 flex-1 rounded ${step >= num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          ))}
        </div>

        <form className="space-y-4">
          {/* STEP 1: CONTACT */}
          {step === 1 && (
            <div className="space-y-4 flex flex-col animate-fade-in">
              <h2 className="font-bold text-lg text-gray-700">Step 1: Contact Details</h2>
              <input type="text" name="fullName" value={formData.fullName} placeholder="Full Name" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
              <input type="email" name="email" value={formData.email} placeholder="Email" className="p-3 border rounded-lg focus:ring-2 outline-none" onChange={handleChange} />
              <input type="text" name="phone" value={formData.phone} placeholder="Phone Number" className="p-3 border rounded-lg focus:ring-2 outline-none" onChange={handleChange} />
              <input type="text" name="address" value={formData.address} placeholder="Full Address (e.g. Guwahati, Assam)" className="p-3 border rounded-lg focus:ring-2 outline-none" onChange={handleChange} />
              <input type="text" name="linkedin" value={formData.linkedin} placeholder="LinkedIn URL (Optional)" className="p-3 border rounded-lg focus:ring-2 outline-none" onChange={handleChange} />
            </div>
          )}

          {/* STEP 2: SUMMARY & SKILLS */}
          {step === 2 && (
            <div className="space-y-4 flex flex-col animate-fade-in">
              <h2 className="font-bold text-lg text-gray-700">Step 2: Professional Profile</h2>
              <textarea name="summary" value={formData.summary} placeholder="Write a 3-line professional summary about yourself..." className="p-3 border rounded-lg h-32 focus:ring-2 outline-none" onChange={handleChange}></textarea>
              <input type="text" name="skills" value={formData.skills} placeholder="Core Competencies (e.g. Tally, GST, Sales - comma separated)" className="p-3 border rounded-lg focus:ring-2 outline-none" onChange={handleChange} />
              <input type="text" name="languages" value={formData.languages} placeholder="Languages (e.g. Assamese, English)" className="p-3 border rounded-lg focus:ring-2 outline-none" onChange={handleChange} />
            </div>
          )}

          {/* STEP 3: EXPERIENCE & EDUCATION */}
          {step === 3 && (
            <div className="space-y-4 flex flex-col animate-fade-in">
              <h2 className="font-bold text-lg text-gray-700">Step 3: Experience & Education</h2>
              
              <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
                <h3 className="font-bold text-sm text-gray-600 uppercase">Most Recent Job / Project</h3>
                <input type="text" name="expCompany" value={formData.expCompany} placeholder="Company or Project Name" className="w-full p-2 border rounded" onChange={handleChange} />
                <div className="flex space-x-2">
                  <input type="text" name="expTitle" value={formData.expTitle} placeholder="Job Title" className="w-1/2 p-2 border rounded" onChange={handleChange} />
                  <input type="text" name="expDates" value={formData.expDates} placeholder="Dates (e.g. 2023 - Present)" className="w-1/2 p-2 border rounded" onChange={handleChange} />
                </div>
                <textarea name="expDetails" value={formData.expDetails} placeholder="What did you do? Type it roughly, then use AI to polish it." className="w-full p-2 border rounded h-24" onChange={handleChange}></textarea>
                <button type="button" onClick={handleAiPolish} disabled={isPolishing} className="w-full bg-indigo-100 text-indigo-700 font-bold py-2 rounded border border-indigo-300 hover:bg-indigo-200 transition">
                  {isPolishing ? "✨ AI is working..." : "✨ Polish Experience with AI"}
                </button>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg space-y-3 mt-4">
                <h3 className="font-bold text-sm text-gray-600 uppercase">Highest Education</h3>
                <input type="text" name="eduInst" value={formData.eduInst} placeholder="Institution (e.g. Gauhati University)" className="w-full p-2 border rounded" onChange={handleChange} />
                <div className="flex space-x-2">
                  <input type="text" name="eduDegree" value={formData.eduDegree} placeholder="Degree (e.g. B.Com)" className="w-1/2 p-2 border rounded" onChange={handleChange} />
                  <input type="text" name="eduDates" value={formData.eduDates} placeholder="Year (e.g. 2024)" className="w-1/2 p-2 border rounded" onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DOWNLOAD */}
          {step === 4 && (
            <div className="space-y-4 flex flex-col items-center text-center animate-fade-in py-8">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="font-bold text-2xl text-gray-800">Ready to Download!</h2>
              <p className="text-gray-600">Your data will be securely saved and an ATS-friendly PDF will be generated immediately.</p>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Back</button>
            ) : <div></div>}
            
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Next Step</button>
            ) : (
              <button type="button" onClick={generateAndSubmit} disabled={isSubmitting} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 w-full ml-4">
                {isSubmitting ? "Generating..." : "Save & Download PDF"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
