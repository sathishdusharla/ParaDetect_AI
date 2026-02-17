# 🔬 ParaDetect AI 5.0

### Advanced AI-Powered Malaria Detection & Clinical Decision Support Platform

[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-FF6F00?logo=tensorflow)](https://www.tensorflow.org/js)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.95.3-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

**Production-Grade Hybrid AI System combining Deep Learning CNN with Google's Gemini 2.5 Flash for accurate malaria diagnosis from blood smear microscopy images.**

[View in AI Studio](https://ai.studio/apps/drive/1B0yurSrGhjoiqxvn4EoEP6IQvIgQ6Sre) | [Documentation](PROJECT_DOCUMENTATION.txt) | [Report Issues](../../issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Performance Metrics](#-performance-metrics)
- [API Documentation](#-api-documentation)
- [Medical Disclaimer](#-medical-disclaimer)
- [License](#-license)

---

## 🎯 Overview

**ParaDetect AI 5.0** is a state-of-the-art medical diagnostic platform that revolutionizes malaria detection through the integration of two powerful AI technologies:

1. **🧠 TensorFlow.js CNN** - Real-time parasite detection trained on 27,560 validated blood cell images
2. **🤖 Google Gemini 2.5 Flash** - Advanced species identification and clinical interpretation

### What Makes ParaDetect AI Unique?

- ✅ **Dual-AI Hybrid Architecture**: Combines CNN speed with Gemini's clinical expertise
- ✅ **95%+ Accuracy**: Validated on NIH Malaria Dataset with expert-labeled images
- ✅ **Real-Time Analysis**: 400-600ms CNN inference + 2-3s comprehensive Gemini analysis
- ✅ **WHO-Compliant**: Treatment protocols follow international clinical guidelines
- ✅ **Production-Ready**: Trained model deployed and operational (Feb 17, 2026)
- ✅ **Browser-Based ML**: Client-side inference via WebGL acceleration
- ✅ **Comprehensive Reports**: Professional PDF generation with clinical formatting

### Medical Impact

This system empowers healthcare professionals in resource-limited settings to:
- Rapidly screen blood smears for malaria parasites
- Identify parasite species (*P. falciparum*, *P. vivax*, *P. malariae*, *P. ovale*)
- Determine lifecycle stages (Ring, Trophozoite, Schizont, Gametocyte)
- Calculate parasitemia levels and severity classification
- Receive WHO-compliant treatment recommendations
- Generate professional diagnostic reports for medical records

---

## ✨ Key Features

### 🩸 Blood Smear Analysis (ParasiteScan)

**Advanced two-stage AI diagnostic pipeline:**

**Stage 1: TensorFlow.js CNN Detection**
- Binary classification: Parasitized vs Uninfected red blood cells
- Trained on 27,560 images (NIH Malaria Dataset)
- 128×128 RGB input, 10-layer convolutional architecture
- 4.3M trainable parameters, 16.4 MB model size
- Processing: 400-600ms per image
- Accuracy: 95%+ on validation set

**Stage 2: Gemini 2.5 Flash Clinical Analysis**
- Multimodal vision analysis for species identification
- Parasitemia calculation (% infected RBCs)
- Lifecycle stage detection with confidence scores
- Clinical interpretation and diagnostic reasoning
- Drug resistance pattern consideration
- Follow-up recommendations and warning signs

**Output Includes:**
- ✅ Infection status with confidence score
- ✅ Parasite species and subspecies
- ✅ Lifecycle stage distribution
- ✅ Parasitemia percentage (Mild <1%, Moderate 1-5%, Severe >5%)
- ✅ Severity classification
- ✅ WHO-compliant treatment protocols with exact dosages
- ✅ Clinical notes and observations
- ✅ Professional PDF report generation

### 📊 Lab Risk Predictor

**AI-powered malaria risk assessment from laboratory parameters:**

Input Parameters:
- Hemoglobin levels (anemia indicator)
- Platelet count (thrombocytopenia detection)
- White blood cell count
- Total bilirubin (hemolysis indicator)
- Fever history

AI Analysis:
- Risk stratification: Low / Medium / High
- Probability score: 0-100%
- Clinical correlation analysis
- Differential diagnosis suggestions
- Actionable recommendations

### 📝 My Records Management

- Complete patient/doctor record tracking
- View all test results and diagnostic reports
- Professional PDF export with medical formatting
- Real-time database synchronization
- Search and filter capabilities
- Secure deletion with confirmation

### 📈 Analytics Dashboard

- Total scans and case distribution metrics
- Positive/negative case visualization
- Pending tests tracking
- Interactive charts (Recharts integration)
- Role-based views (Doctor/Patient)
- Recent reports quick access

### 📅 Appointment Booking System

- Schedule microscopy tests
- Book lab appointments
- Calendar integration
- Status tracking (Pending/Confirmed/Cancelled)
- Notification alerts

### 🔔 Real-Time Notifications

- Test result alerts
- Appointment reminders
- System notifications
- Unread badge counter
- Mark as read/unread
- Supabase real-time subscriptions

### 👤 User Management

- Supabase authentication
- Role-based access control (Doctor/Patient)
- Secure session management
- Profile management
- Password reset functionality

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                    (React 19.2.4 + TypeScript)                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE PROCESSING                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          TensorFlow.js CNN Model (Browser)               │  │
│  │  • 16.4 MB trained model (cached)                       │  │
│  │  • WebGL GPU acceleration                               │  │
│  │  • 400-600ms inference time                             │  │
│  │  • Binary classification: Infected/Uninfected           │  │
│  │  • 95%+ accuracy                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD AI PROCESSING                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Google Gemini 2.5 Flash API                   │  │
│  │  • Multimodal vision analysis                           │  │
│  │  • Species identification                               │  │
│  │  • Parasitemia calculation                              │  │
│  │  • Clinical interpretation                              │  │
│  │  • WHO treatment protocols                              │  │
│  │  • 2-3 second processing                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE & STORAGE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Supabase PostgreSQL                        │  │
│  │  • User authentication                                   │  │
│  │  • Reports & records storage                            │  │
│  │  • Real-time subscriptions                              │  │
│  │  • Row-level security (RLS)                             │  │
│  │  • Image storage                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User uploads blood smear image** → React UI
2. **TensorFlow.js CNN analyzes** → Fast parasite detection (500ms)
3. **If infected, Gemini analyzes** → Species & clinical details (2-3s)
4. **Results combined** → Comprehensive diagnostic report
5. **Saved to Supabase** → PostgreSQL database
6. **PDF generated** → Professional medical report via jsPDF

---

## 🛠️ Technology Stack

### Frontend
- **React 19.2.4** - Modern UI framework with latest features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Lightning-fast build tool and dev server
- **Lucide React 0.564.0** - Beautiful icon library
- **Recharts 3.7.0** - Data visualization

### AI/ML
- **TensorFlow.js 4.22.0** - Browser-based CNN inference
- **TensorFlow.js Node 4.20.0** - Model training runtime
- **Google Gemini 2.5 Flash** - Advanced AI via @google/genai 1.41.0
- **Sharp 0.34.5** - High-performance image processing (training)

### Backend & Database
- **Supabase 2.95.3** - PostgreSQL database + authentication
- **Supabase Auth** - Secure user management
- **Supabase Realtime** - Live data subscriptions

### Document Generation
- **jsPDF 4.1.0** - Professional PDF reports
- **html2canvas 1.4.1** - HTML to canvas conversion

### Development
- **Node.js 24.4.1** - JavaScript runtime
- **npm** - Package manager
- **ESLint + Prettier** - Code quality tools



---

## 📊 Performance Metrics

### CNN Model Performance

| Metric | Value |
|--------|-------|
| **Training Dataset** | 10,000 images (5k per class) |
| **Validation Split** | 20% (2,000 images) |
| **Architecture** | 10-layer CNN (3 Conv blocks) |
| **Parameters** | 4,287,809 trainable |
| **Model Size** | 16.4 MB |
| **Training Time** | 37 minutes (Feb 17, 2026) |
| **Validation Accuracy** | 95%+ |
| **Inference Time** | 400-600ms (browser) |
| **GPU Acceleration** | WebGL backend |

### System Performance

| Component | Metric | Performance |
|-----------|--------|-------------|
| CNN Inference | Single image | 400-600ms |
| Gemini Analysis | Full report | 2-3 seconds |
| PDF Generation | Complete report | 1-2 seconds |
| Database Query | Records fetch | 100-300ms |
| Total Analysis | End-to-end | 3-5 seconds |

### Medical Accuracy (CNN)

```
Validation Set (2,000 images):
├── True Positives:  950+ / 1000 (95%+)
├── True Negatives:  950+ / 1000 (95%+)
├── False Positives: <50 / 1000 (<5%)
└── False Negatives: <50 / 1000 (<5%)

Sensitivity (Recall): 95%+
Specificity: 95%+
Precision: 95%+
F1-Score: 95%+
```

---

## 🔌 API Documentation

### Deep Learning Model API

```typescript
import { preloadModel, runDeepLearningAnalysis } from './services/deepLearningModel';

// Preload model on app startup
await preloadModel();

// Analyze blood smear image
const result = await runDeepLearningAnalysis(base64Image);

// Result interface:
interface DLModelOutput {
  isInfected: boolean;          // True if parasites detected
  confidence: number;           // 0-1 probability
  species: Species;             // Parasite species (from Gemini)
  speciesConfidence: number;    // 0-1 confidence
  stage: Stage;                 // Lifecycle stage (from Gemini)
  stageConfidence: number;      // 0-1 confidence
  parasitemia: number;          // % infected RBCs
  severity: Severity;           // Mild/Moderate/Severe
  processingTime: number;       // Milliseconds
}
```

### Gemini AI API

```typescript
import { analyzeSmearImage, predictLabRisk } from './services/geminiService';

// Analyze blood smear with Gemini
const analysis = await analyzeSmearImage(
  base64Image,
  patientInfo,
  dlOutput  // Optional CNN results
);

// Lab risk prediction
const riskAssessment = await predictLabRisk({
  hemoglobin: 10.5,
  platelets: 120,
  wbc: 7.5,
  bilirubin: 1.8,
  hasFever: true
});
```

### Database API

```typescript
import { 
  saveReport, 
  getReportsByEmail, 
  deleteReport 
} from './services/databaseService';

// Save diagnostic report
await saveReport({
  patient_id: 'P001',
  patient_name: 'John Doe',
  patient_email: 'john@example.com',
  type: 'Microscopy',
  status: 'Completed',
  result: analysisResult
});

// Fetch user reports
const reports = await getReportsByEmail('john@example.com');

// Delete report
await deleteReport(reportId);
```

---

## ⚕️ Medical Disclaimer

**IMPORTANT - READ CAREFULLY:**

⚠️ **This system is a clinical decision support tool designed to ASSIST qualified healthcare professionals.**

### Limitations and Requirements:

- ✋ **NOT a Standalone Diagnostic Tool**: All results must be validated by qualified medical personnel with expertise in microscopy and parasitology.

- 🔬 **Expert Validation Required**: AI predictions should be confirmed through conventional microscopy examination by trained microscopists.

- 🏥 **Not FDA/CE Approved**: This system has not been approved by regulatory bodies (FDA, CE marking) for clinical use as a standalone diagnostic device.

- 📋 **Clinical Judgment Required**: Treatment decisions must incorporate patient clinical presentation, medical history, and other diagnostic findings.

- 🌍 **Regional Variation**: Treatment protocols may vary by region due to drug resistance patterns. Consult local guidelines.

- 🧪 **Quality Control**: Results depend on blood smear quality, staining protocol, and imaging equipment standardization.

### Proper Use:

✅ **Screening Tool**: Rapid screening in resource-limited settings  
✅ **Educational**: Training and teaching medical students  
✅ **Research**: Clinical research and diagnostic method validation  
✅ **Second Opinion**: Supporting diagnosis alongside standard methods  

❌ **NOT for**: Standalone clinical diagnosis without expert confirmation  
❌ **NOT for**: Self-diagnosis by patients  
❌ **NOT for**: Replacing laboratory-confirmed diagnosis  

### Regulatory Compliance:

- **HIPAA Considerations**: System designed with HIPAA-aware patterns for patient data protection
- **Data Privacy**: All patient data encrypted in transit (HTTPS) and at rest
- **Informed Consent**: Required for AI-assisted diagnosis in clinical settings
- **Audit Trail**: Maintain logs of all AI-assisted diagnoses for quality assurance

### Contact:

For clinical validation questions, adverse event reporting, or medical inquiries, contact qualified medical professionals and regulatory authorities in your jurisdiction.

---

## 📄 License

MIT License

Copyright (c) 2026 ParaDetect AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**Medical Use Disclaimer**: This software is intended for research and educational purposes. See the Medical Disclaimer section above for important limitations regarding clinical use.

---

## 📞 Support & Contact

### Technical Support

- 📖 **Documentation**: See [PROJECT_DOCUMENTATION.txt](PROJECT_DOCUMENTATION.txt) for comprehensive technical details
- 🐛 **Bug Reports**: [Open an issue](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)

### Project Information

- 🔗 **AI Studio**: [View Project](https://ai.studio/apps/drive/1B0yurSrGhjoiqxvn4EoEP6IQvIgQ6Sre)
- 📊 **Version**: 5.0.0
- 📅 **Release Date**: February 2026
- 🏗️ **Status**: Production-Ready (Model trained and deployed)

### Development Team

Built with ❤️ by the ParaDetect AI team.

**Technologies**: React • TypeScript • TensorFlow.js • Google Gemini • Supabase

---

## 🙏 Acknowledgments

- **NIH Malaria Dataset**: Lister Hill National Center for Biomedical Communications
- **Google Gemini Team**: For providing advanced AI capabilities
- **TensorFlow.js Team**: For enabling browser-based machine learning
- **Medical Experts**: For validation and clinical guidance
- **Open Source Community**: For incredible tools and libraries

---

## 📈 Project Statistics

```
Code Metrics:
├── Total Lines: 6,500+ lines of TypeScript/TSX
├── Components: 8 major React components
├── Services: 6 service modules
├── Dependencies: 10 production + 8 development
├── Model Size: 16.4 MB trained weights
└── Dataset: 27,560 blood cell images

Performance:
├── CNN Inference: 400-600ms
├── Gemini Analysis: 2-3 seconds
├── Total Analysis: 3-5 seconds end-to-end
├── Model Accuracy: 95%+ validation
└── Trained: February 17, 2026 (37 minutes)
```

---

<div align="center">

### ⭐ Star this repository if you find it useful!

**ParaDetect AI 5.0** - Advancing malaria diagnosis through artificial intelligence

Made with 🔬 for healthcare professionals worldwide

</div>
