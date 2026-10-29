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
  bullet: { flexDirection: 'row', marginBottom: 2 },
  bulletPoint: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.3 }
});

// --- PDF COMPONENT ---
const ResumePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.name}>{data.fullName || "YOUR NAME"}</Text>
      <Text style={styles.contact}>
        {data.address} | {data.phone} | {data.email} | {data.linkedin}
      </Text>

      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.bodyText}>{data.summary}</Text>

      <Text style={styles.sectionTitle}>Core Competencies</Text>
      <Text style={styles.bodyText}>{data.skills}</Text>

      <Text style={styles.sectionTitle}>Professional Experience</Text>
      <View style={styles.flexBetween}>
        <Text style={styles.boldText}>{data.expCompany}</Text>
        <Text style={styles.bodyText}>{data.expDates}</Text>
      </View>
      <Text style={styles.bodyText}>{data.expTitle}</Text>
      <View style={styles.bullet}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}>{data.expDetails}</Text>
      </View>

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

// --- MAIN APP ---
export default function App() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', linkedin: '', address: '', summary: '', skills: '',
    expCompany: '', expTitle: '', expDates: '', expDetails: '', eduDegree: '', eduInst: '', eduDates: '', languages: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚠️ REPLACE THIS WITH YOUR APPS SCRIPT URL ⚠️
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfnbwKiW964AuxloBlbnXScAiE195UBnPIRpcCu8E0Qmkw2lTYKZ8FzMkuSSniDAefNg/exec";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateAndSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Send data to Google Sheets
      await axios.post(GOOGLE_SCRIPT_URL, formData, { headers: { 'Content-Type': 'text/plain;charset=utf-8' }});

      // 2. Generate and Download PDF
      const blob = await pdf(<ResumePDF data={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.fullName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("Resume downloaded and profile saved!");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Build Your ATS Resume</h1>
        <form onSubmit={generateAndSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="fullName" placeholder="Full Name (e.g. Lucky Kashyap)" className="w-full p-2 border rounded" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email Address" className="w-full p-2 border rounded" onChange={handleChange} required />
            <input type="text" name="phone" placeholder="Phone Number" className="w-full p-2 border rounded" onChange={handleChange} required />
            <input type="text" name="linkedin" placeholder="LinkedIn URL" className="w-full p-2 border rounded" onChange={handleChange} />
            <input type="text" name="address" placeholder="Full Address (e.g. Guwahati, Assam)" className="col-span-1 md:col-span-2 w-full p-2 border rounded" onChange={handleChange} required />
          </div>

          <textarea name="summary" placeholder="Professional Summary (3-4 lines max)" className="w-full p-2 border rounded h-24" onChange={handleChange} required></textarea>
          <input type="text" name="skills" placeholder="Core Competencies (e.g. Tally, GST, Auditing - comma separated)" className="w-full p-2 border rounded" onChange={handleChange} required />

          <h3 className="font-bold text-gray-700 mt-6 border-b pb-2">Recent Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="expCompany" placeholder="Company Name" className="w-full p-2 border rounded" onChange={handleChange} />
            <input type="text" name="expTitle" placeholder="Job Title" className="w-full p-2 border rounded" onChange={handleChange} />
            <input type="text" name="expDates" placeholder="Dates (e.g. Aug 2023 - Present)" className="w-full p-2 border rounded" onChange={handleChange} />
          </div>
          <textarea name="expDetails" placeholder="Job Responsibilities (Use bullet points format)" className="w-full p-2 border rounded h-24" onChange={handleChange}></textarea>

          <h3 className="font-bold text-gray-700 mt-6 border-b pb-2">Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="eduInst" placeholder="Institution (e.g. Gauhati University)" className="w-full p-2 border rounded" onChange={handleChange} />
            <input type="text" name="eduDegree" placeholder="Degree (e.g. B.Com)" className="w-full p-2 border rounded" onChange={handleChange} />
            <input type="text" name="eduDates" placeholder="Year (e.g. May 2022)" className="w-full p-2 border rounded" onChange={handleChange} />
            <input type="text" name="languages" placeholder="Languages (e.g. Assamese, English)" className="w-full p-2 border rounded" onChange={handleChange} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded mt-6 hover:bg-blue-700 transition">
            {isSubmitting ? "Generating PDF & Saving..." : "Download ATS Resume"}
          </button>
        </form>
      </div>
    </div>
  );
}
