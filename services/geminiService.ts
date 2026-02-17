import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Species, Stage, Severity, LabData } from "../types";
import { runDeepLearningAnalysis, DLModelOutput } from "./deepLearningModel";

// Initialize Gemini API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('🔑 Gemini API Key Status:', {
  exists: !!apiKey,
  length: apiKey?.length || 0,
  prefix: apiKey?.substring(0, 10) || 'missing'
});

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// Vision analysis with Gemini SDK (CORRECT API - matches working project)
const generateContentWithVision = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      }
    });

    return response.text || '';
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

// Text-only generation with Gemini SDK
const generateContentTextOnly = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || '';
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

/**
 * Enhanced Malaria Detection using DL + Gemini AI
 * DL provides quick preliminary analysis (shown in console)
 * Gemini AI provides accurate final diagnosis using vision
 * @param base64Image - Base64 encoded blood smear image
 * @param patientInfo - Patient contextual information
 * @param dlOutput - Pre-computed DL model output (optional)
 */
export const analyzeSmearImage = async (
  base64Image: string, 
  patientInfo: string,
  dlOutput?: DLModelOutput
): Promise<AnalysisResult> => {
  const startTime = Date.now();
  let dlResult: DLModelOutput;
  
  try {
    // Step 1: Run Deep Learning Analysis (for quick preliminary results)
    console.log('🧬 Running Deep Learning CNN Analysis...');
    dlResult = dlOutput || await runDeepLearningAnalysis(base64Image);
    console.log('✅ DL Preliminary Analysis:', {
      infected: dlResult.isInfected,
      species: dlResult.species,
      parasitemia: dlResult.parasitemia,
      severity: dlResult.severity,
      confidence: `${(dlResult.confidence * 100).toFixed(1)}%`,
      processingTime: `${dlResult.processingTime}ms`
    });

    // Step 2: Send to Gemini AI for accurate verification and clinical interpretation
    console.log('🤖 Sending to Gemini AI for expert verification and accurate analysis...');
    
    const prompt = `You are an Expert Medical AI specializing in Malaria Microscopy and Tropical Medicine.

TASK: Analyze this blood smear microscopy image for malaria parasites and provide comprehensive clinical assessment.

PATIENT CONTEXT:
${patientInfo}

PRELIMINARY DL ANALYSIS (For Reference - Verify and Correct if Needed):
- Infection Detected: ${dlResult.isInfected}
- Predicted Species: ${dlResult.species}
- Predicted Stage: ${dlResult.stage}
- Parasitemia: ${dlResult.parasitemia.toFixed(2)}%
- Severity: ${dlResult.severity}

INSTRUCTIONS:
1. Carefully examine the blood smear image using your vision capabilities
2. VERIFY or CORRECT the DL predictions based on actual microscopic features you observe
3. Identify Plasmodium species by characteristic morphological features:
   - P. falciparum: Multiple rings per RBC, banana-shaped gametocytes, no Schüffner's dots, delicate rings
   - P. vivax: Enlarged RBCs (1.5x normal), amoeboid trophozoites, Schüffner's dots (pink stippling)
   - P. ovale: Oval/fimbriated RBCs, Schüffner's dots, compact trophozoites
   - P. malariae: Band forms, compact forms, rosette schizonts, daisy-head appearance
4. Identify lifecycle stage:
   - Ring Stage: Small ring forms with chromatin dot
   - Trophozoite: Amoeboid forms, larger than rings
   - Schizont: Multiple merozoites within RBC
   - Gametocyte: Sexual forms (banana-shaped for P.f, round for others)
5. Count infected vs total RBCs to calculate accurate parasitemia: (Infected RBCs / Total RBCs) × 100
6. Classify severity based on WHO criteria:
   - Mild: <1% parasitemia, no complications
   - Moderate: 1-5% parasitemia
   - Severe: >5% parasitemia OR complications
7. Provide WHO-compliant antimalarial treatment with exact dosages
8. Include warning signs and follow-up guidance

CRITICAL: Your analysis should be based on actual visual observation of the image.
If DL predictions are incorrect, correct them. Provide your expert medical assessment.

RESPONSE FORMAT: Return ONLY valid JSON (no markdown) with these exact keys:
{
  "isInfected": boolean,
  "species": string (one of: "Plasmodium falciparum", "Plasmodium vivax", "Plasmodium malariae", "Plasmodium ovale", "None"),
  "stage": string (one of: "Ring Stage", "Trophozoite", "Schizont", "Gametocyte", "None"),
  "parasitemia": number (0-100),
  "severity": string (one of: "Mild", "Moderate", "Severe"),
  "confidence": number (0-100),
  "explanation": string (detailed microscopic findings),
  "treatmentRecommendation": string (WHO-compliant treatment with dosages),
  "clinicalNotes": string (follow-up guidance and warning signs)
}`;


    // Strip data URL prefix if present
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const responseText = await generateContentWithVision(cleanBase64, prompt);
    
    // Parse JSON from response (handle markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const geminiResult = JSON.parse(jsonText);
    const geminiProcessingTime = Date.now() - startTime;
    
    console.log('✅ Gemini AI Verification Complete:', {
      infected: geminiResult.isInfected,
      species: geminiResult.species,
      parasitemia: geminiResult.parasitemia,
      confidence: `${geminiResult.confidence}%`,
      processingTime: `${geminiProcessingTime}ms`
    });
    
    // Combine DL + Gemini AI results (Gemini is the authoritative diagnosis)
    const finalResult: AnalysisResult = {
      isInfected: geminiResult.isInfected,
      species: geminiResult.species as Species,
      stage: geminiResult.stage as Stage,
      parasitemia: geminiResult.parasitemia,
      severity: geminiResult.severity as Severity,
      confidence: geminiResult.confidence,
      explanation: geminiResult.explanation,
      treatmentRecommendation: geminiResult.treatmentRecommendation,
      clinicalNotes: geminiResult.clinicalNotes,
      dlMetadata: {
        processingTime: dlResult.processingTime,
        speciesConfidence: dlResult.speciesConfidence * 100,
        stageConfidence: dlResult.stageConfidence * 100,
        detectedParasites: dlResult.detectionBoxes?.length || 0
      }
    };
    
    console.log('✨ Combined DL+AI Analysis Complete - Accurate Gemini Diagnosis with DL Metadata');
    return finalResult;

  } catch (error: any) {
    console.error("❌ Gemini AI Analysis Failed:", error);
    console.log('⚠️ Falling back to Deep Learning preliminary results...');
    
    // Fallback to DL-only analysis when Gemini is unavailable
    const fallbackResult: AnalysisResult = {
      isInfected: dlResult.isInfected,
      species: dlResult.species as Species,
      stage: dlResult.stage as Stage,
      parasitemia: dlResult.parasitemia,
      severity: dlResult.severity as Severity,
      confidence: dlResult.confidence * 100,
      explanation: `Deep Learning preliminary analysis: ${dlResult.isInfected ? `${dlResult.species} detected at ${dlResult.stage}. Parasitemia: ${dlResult.parasitemia.toFixed(2)}%` : 'No parasites detected in preliminary scan'}. 
      
      ⚠️ IMPORTANT: Gemini AI verification unavailable. This analysis is based on preliminary DL predictions only. Please verify with expert microscopy.`,
      treatmentRecommendation: dlResult.isInfected 
        ? `Preliminary: ${dlResult.severity} severity infection. Consult healthcare provider immediately for WHO-compliant treatment. First-line options include Artemisinin-based Combination Therapy (ACT). VERIFY with expert diagnosis before treatment.`
        : 'No immediate treatment indicated based on preliminary scan. If symptoms persist, seek medical evaluation.',
      clinicalNotes: `⚠️ This is a PRELIMINARY analysis using Deep Learning only. Gemini AI expert verification failed (Error: ${error.message}). 
      
      DO NOT rely solely on this result for clinical decisions. Confirm with:
      - Expert microscopy by trained parasitologist
      - Rapid Diagnostic Test (RDT) if available
      - Clinical presentation correlation
      
      Seek immediate medical attention if symptoms worsen.`,
      dlMetadata: {
        processingTime: dlResult.processingTime,
        speciesConfidence: dlResult.speciesConfidence * 100,
        stageConfidence: dlResult.stageConfidence * 100,
        detectedParasites: dlResult.detectionBoxes?.length || 0
      }
    };
    
    console.log('⚠️ Returning DL fallback result. Gemini AI unavailable.');
    return fallbackResult;
  }
};

export const predictLabRisk = async (labData: LabData): Promise<{ probability: number; riskLevel: string; explanation: string; recommendation: string }> => {
  try {
    const prompt = `
      Act as an Expert Clinical Diagnostic AI. Evaluate the likelihood of Malaria based on the provided Hematology (CBC) and Biochemistry data.
      
      Input Data:
      ${JSON.stringify(labData)}
      
      Clinical Logic to Apply:
      1. Thrombocytopenia (Low Platelets) is a hallmark of malaria. <150,000 is suspicious, <50,000 is severe.
      2. Anemia (Low Hb): Malaria causes hemolysis (destruction of RBCs).
      3. Leukopenia (Low WBC): Common, unlike bacterial infections which often cause Leukocytosis.
      4. Hyperbilirubinemia: Caused by hemolysis.
      5. Fever History: Strong clinical correlate.
      
      Task:
      - Calculate a probability score (0-100%).
      - Assign Risk Level (Low, Medium, High).
      - 'explanation': Write a clinically sound paragraph explaining *why* the risk is assigned. Explicitly mention which values are abnormal and how they correlate to malaria pathology.
      - 'recommendation': Provide the best course of action. (e.g., "Urgent Malaria Smear and RDT required", "Check for Dengue as differential due to severe thrombocytopenia").

      RESPONSE FORMAT: Return ONLY a valid JSON object with these exact keys:
      {
        "probability": number (0-100),
        "riskLevel": string ("Low", "Medium", or "High"),
        "explanation": string (detailed clinical reasoning),
        "recommendation": string (actionable next steps)
      }
    `;

    const responseText = await generateContentTextOnly(prompt);
    
    // Parse JSON from response (handle markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Risk Prediction Failed", error);
    return {
      probability: 0,
      riskLevel: "Unknown",
      explanation: "AI service unavailable. Unable to process lab parameters.",
      recommendation: "Consult a healthcare provider."
    };
  }
};

export const extractLabDataFromImage = async (base64Image: string): Promise<LabData> => {
  try {
    const prompt = `
      Extract the following values from this lab report image:
      - Hemoglobin (g/dL)
      - Platelet Count (10^3/µL)
      - WBC Count (cells/µL)
      - Total Bilirubin (mg/dL)
      
      If a value is missing or unclear, omit it or set to null.
      
      RESPONSE FORMAT: Return ONLY a valid JSON object with these keys:
      {
        "hemoglobin": number or null,
        "platelets": number or null,
        "wbc": number or null,
        "bilirubin": number or null
      }
    `;

    // Strip data URL prefix if present
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const responseText = await generateContentWithVision(cleanBase64, prompt);
    
    // Parse JSON from response (handle markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("OCR Extraction Failed", error);
    return {};
  }
};