
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const getSmartAnalysis = async (state: AppState, query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      أنت مساعد ذكي "مستر داود" (معلم لغة عربية وقرآن خبير). لديك وصول كامل لبيانات الطلاب:
      الطلاب: ${JSON.stringify(state.students)}
      درجات التسميع: ${JSON.stringify(state.grades)}
      سجل الحضور: ${JSON.stringify(state.attendance)}
      الاشتراكات: ${JSON.stringify(state.payments)}

      سؤال المعلم الحالي: ${query}

      مهمتك:
      1. قدم إجابات دقيقة بناءً على البيانات (درجات التسميع، الغياب، إلخ).
      2. إذا لاحظت تراجعاً في درجات "التسميع" لطالب معين، نبه المعلم بلطف.
      3. كن تربوياً، محفزاً، ومختصراً جداً.
      4. استخدم اللغة العربية (باللهجة المصرية المهذبة أو الفصحى البسيطة).
    `,
  });

  return response.text;
};

export const generateNotificationMessage = async (type: string, data: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      بصفتك "مستر داود"، اكتب رسالة واتساب قصيرة جداً لولي أمر الطالب ${data.studentName}.
      الحدث: ${type}.
      البيانات: ${JSON.stringify(data)}.
      
      قواعد الرسالة:
      - ابدأ بـ "تحية طيبة من مستر داود".
      - اذكر الخبر (درجة التسميع، الغياب) بوضوح.
      - دع الرسالة تبدو شخصية وودودة.
      - لا تزد عن 3 أسطر.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });
    
    return response.text;
};
