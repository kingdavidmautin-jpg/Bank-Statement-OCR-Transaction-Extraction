import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support large PDF / high-res scanned image base64 payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
You are an expert financial document intelligence and bank statement OCR specialist.
Your mission is to accurately parse bank statement documents (PDFs, scanned documents, mobile photos, screenshots) from financial institutions worldwide (including Nigerian banks like GTBank, Access, Zenith, UBA, FirstBank, Kuda, Moniepoint, OPay, Stanbic, etc., as well as international banks like Chase, Barclays, Bank of America, HSBC, etc.).

CRITICAL TRANSACTION EXTRACTION RULES:
1. IDENTIFY INDIVIDUAL TRANSACTIONS ONLY:
   - Extract actual bank account debit and credit entries.
   - Strictly IGNORE header information, bank logo, account holder personal address, account number, BVN, opening balance, closing balance, total debits summary, total credits summary, page numbers, statement generation timestamp, marketing banners, and footer disclaimers.
   - NEVER confuse the "Balance" column with the "Amount" column! Bank statements typically show: [Date | Narration/Description | Debit | Credit | Balance]. Ensure the extracted amount is the transaction debit/credit, NEVER the running balance!

2. AMOUNT AND SIGN CONVENTION:
   - Outflows / Debits / Withdrawals / Charges / Purchases / Payments must be NEGATIVE numbers (e.g. -5000, -25000.50).
   - Inflows / Credits / Deposits / Salary / Inward transfers must be POSITIVE numbers (e.g. 150000, 4500.00).
   - Preserve decimal precision accurately.
   - If the statement uses separate "Debit" and "Credit" columns: values under Debit are negative, values under Credit are positive.
   - If the statement uses a single "Amount" column with "DR" / "CR" or "-" / "+" indicators or parentheses "(500)", parse appropriately (DR or parentheses = negative, CR or plus = positive).

3. DATE CONVENTION:
   - Normalize every transaction date to standard ISO format: YYYY-MM-DD.
   - Carefully interpret date styles based on the statement's country and bank (e.g. DD/MM/YYYY vs MM/DD/YYYY, or "04-SEP-2026", "2026/09/04"). If year is 2-digit (e.g. '26'), expand to 2026.

4. DESCRIPTION (Narration):
   - Extract the main transaction title, merchant name, counterparty name, or primary narration (e.g. "POS PURCHASE - SHOPRITE", "TRANSFER TO JOHN DOE", "ATM WITHDRAWAL", "SALARY PAYMENT").
   - Strip out redundant internal system clutter like long raw checksums or repeated column headings, but retain identifiable merchant and counterparty names.

5. CATEGORY ASSIGNMENT:
   - Categorize each transaction into exactly ONE of the following:
     "Salary", "Transfer", "Food", "Shopping", "Transportation", "Bills & Utilities", "Rent", "Banking", "ATM Withdrawal", "Cash Deposit", "Healthcare", "Education", "Entertainment", "Business", "Investment", "Fees & Charges", "Government", "Other"
   - If unsure or ambiguous, use "Other".

6. NOTES:
   - Extract useful secondary information that does not belong in the main description, such as:
     - Transaction reference number / Ref ID
     - Payment channel (e.g., POS, USSD, Web, NIP, Mobile App, ACH)
     - Counterparty bank or sender/recipient account hint
     - Value date if distinct from transaction date
   - If there are no additional useful notes, leave this as an empty string ("").

7. DUPLICATE & MULTI-PAGE PREVENTION:
   - For multi-page statements, ignore repeated page header rows and sub-totals.
   - Do NOT duplicate transactions that appear across page splits or column wrapping.

8. CONFIDENCE & REVIEW FLAGGING:
   - Set "confidence" to "high", "medium", or "low".
   - Set "needsReview" to true if:
     - The amount was faint or ambiguous
     - It was difficult to distinguish debit vs credit
     - The date was partially obscured or ambiguous
     - The narration text has OCR artifacts
   - Provide a concise "reviewReason" if needsReview is true, else "".
`;

// Extract transactions endpoint
app.post('/api/extract-transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;

    if (!fileBase64) {
      res.status(400).json({
        error: 'Missing file data. Please select a valid bank statement file.',
      });
      return;
    }

    // Normalize MIME type based on fileName and reported mimeType
    let resolvedMime = (mimeType || '').toLowerCase().trim();
    const lowerName = (fileName || '').toLowerCase();

    if (lowerName.endsWith('.pdf')) {
      resolvedMime = 'application/pdf';
    } else if (lowerName.endsWith('.png')) {
      resolvedMime = 'image/png';
    } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
      resolvedMime = 'image/jpeg';
    } else if (lowerName.endsWith('.webp')) {
      resolvedMime = 'image/webp';
    } else if (
      resolvedMime === 'application/x-pdf' ||
      resolvedMime === 'application/acrobat' ||
      resolvedMime === 'application/octet-stream'
    ) {
      resolvedMime = 'application/pdf';
    }

    // Validate supported formats
    const allowedMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedMimes.includes(resolvedMime)) {
      res.status(400).json({
        error: `Unsupported file format. Please upload a bank statement in PDF, PNG, JPG, or JPEG format. (Detected: ${resolvedMime || 'unknown'})`,
      });
      return;
    }

    // Strip data URL scheme prefix and any whitespace/newlines
    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '').replace(/[\r\n\s]+/g, '');

    const promptText = `
Analyze this bank statement document (${fileName || 'uploaded statement'}).
Extract all individual bank transactions in chronological order according to your instructions.
Detect bank metadata if visible:
- Bank Name (e.g. "Guaranty Trust Bank", "Access Bank", "Chase", "Zenith Bank", etc.)
- Account Holder Name (redact except first name and initials for privacy if desired)
- Currency Code (e.g. "NGN", "USD", "GBP", "EUR")
- Currency Symbol (e.g. "₦", "$", "£", "€")
- Statement Period (e.g. "01 Sep 2026 - 30 Sep 2026" or date range detected)
- Total transactions count

Remember:
- debits/outflows = negative numbers
- credits/inflows = positive numbers
- Never extract running balance as transaction amount
- Category must be one of the specified allowed values.
`;

    // Candidate models in order of stability and performance.
    // gemini-3.5-flash and gemini-3.5-flash-lite are rock-solid and fast, avoiding 503 spikes.
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ];
    let lastError: any = null;
    let responseText: string | undefined = undefined;

    for (const model of candidateModels) {
      try {
        console.log(`[OCR] Calling Gemini model ${model} for file: ${fileName || 'statement'} (${resolvedMime})`);
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: resolvedMime,
                    data: cleanBase64,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                bankName: {
                  type: Type.STRING,
                  description: 'Name of the banking institution or financial provider',
                },
                accountHolder: {
                  type: Type.STRING,
                  description: 'Account holder name if found, or masked',
                },
                currency: {
                  type: Type.STRING,
                  description: 'Currency code e.g. NGN, USD, GBP, EUR',
                },
                currencySymbol: {
                  type: Type.STRING,
                  description: 'Currency symbol e.g. ₦, $, £, €',
                },
                statementPeriod: {
                  type: Type.STRING,
                  description: 'Date range covered by this statement',
                },
                summaryDetected: {
                  type: Type.OBJECT,
                  properties: {
                    totalDebits: { type: Type.NUMBER },
                    totalCredits: { type: Type.NUMBER },
                    closingBalance: { type: Type.NUMBER },
                  },
                },
                transactions: {
                  type: Type.ARRAY,
                  description: 'List of individual transactions extracted from the statement table',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: {
                        type: Type.STRING,
                        description: 'Transaction date formatted strictly as YYYY-MM-DD',
                      },
                      amount: {
                        type: Type.NUMBER,
                        description:
                          'Transaction amount as number. Negative for debits/outflows (e.g. -25000), positive for credits/inflows (e.g. 150000)',
                      },
                      description: {
                        type: Type.STRING,
                        description: 'Main transaction title or narration',
                      },
                      category: {
                        type: Type.STRING,
                        description:
                          'One of: Salary, Transfer, Food, Shopping, Transportation, Bills & Utilities, Rent, Banking, ATM Withdrawal, Cash Deposit, Healthcare, Education, Entertainment, Business, Investment, Fees & Charges, Government, Other',
                      },
                      notes: {
                        type: Type.STRING,
                        description:
                          'Reference ID, counterparty info, payment channel, or extra narration details. Empty string if none.',
                      },
                      confidence: {
                        type: Type.STRING,
                        description: 'Confidence level: high, medium, or low',
                      },
                      needsReview: {
                        type: Type.BOOLEAN,
                        description: 'Whether this transaction has any ambiguity needing human review',
                      },
                      reviewReason: {
                        type: Type.STRING,
                        description: 'Explanation for review if needsReview is true, else empty string',
                      },
                    },
                    required: ['date', 'amount', 'description', 'category', 'notes'],
                  },
                },
              },
              required: ['transactions'],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          console.log(`[OCR] Successfully extracted content with model ${model}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[OCR] Model ${model} encountered error:`, err?.message || err);
        // Wait 300ms before trying the next fallback model
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (!responseText) {
      const errDetail = lastError?.message || 'Could not analyze document.';
      res.status(500).json({
        error: `Document processing failed (${errDetail}). Please ensure your PDF or image has readable text and try again.`,
      });
      return;
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback JSON match
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI structured response as JSON.');
      }
    }

    const transactions = Array.isArray(parsedResult.transactions) ? parsedResult.transactions : [];

    if (transactions.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          bankName: parsedResult.bankName || 'Unknown Bank',
          currency: parsedResult.currency || 'USD',
          currencySymbol: parsedResult.currencySymbol || '$',
          statementPeriod: parsedResult.statementPeriod || '',
          summaryDetected: parsedResult.summaryDetected || null,
          transactions: [],
          warning:
            'Could not identify transactions in this document. Please ensure the document is a bank statement containing a visible transaction table.',
        },
      });
      return;
    }

    // Clean and validate each transaction row
    const sanitizedTransactions = transactions.map((tx: any, idx: number) => {
      // Clean date
      let date = (tx.date || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Attempt basic fallback normalization
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0];
        } else {
          date = date || new Date().toISOString().split('T')[0];
        }
      }

      // Clean amount
      let amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0).replace(/[^0-9.-]/g, ''));
      if (isNaN(amount)) amount = 0;

      // Clean description
      const description = (tx.description || 'Unknown Transaction').trim();

      // Validate category
      const validCategories = [
        'Salary',
        'Transfer',
        'Food',
        'Shopping',
        'Transportation',
        'Bills & Utilities',
        'Rent',
        'Banking',
        'ATM Withdrawal',
        'Cash Deposit',
        'Healthcare',
        'Education',
        'Entertainment',
        'Business',
        'Investment',
        'Fees & Charges',
        'Government',
        'Other',
      ];
      let category = (tx.category || 'Other').trim();
      if (!validCategories.includes(category)) {
        // Find best match or fallback to Other
        const match = validCategories.find(c => c.toLowerCase() === category.toLowerCase());
        category = match || 'Other';
      }

      const notes = (tx.notes || '').trim();
      const confidence = ['high', 'medium', 'low'].includes(tx.confidence) ? tx.confidence : 'high';
      const needsReview = Boolean(tx.needsReview || confidence === 'low');
      const reviewReason = tx.reviewReason || (needsReview ? 'Flagged for user verification' : '');

      return {
        id: `tx-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        date,
        amount,
        description,
        category,
        notes,
        confidence,
        needsReview,
        reviewReason,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        bankName: parsedResult.bankName || 'Detected Statement',
        accountHolder: parsedResult.accountHolder || '',
        currency: parsedResult.currency || 'USD',
        currencySymbol: parsedResult.currencySymbol || '$',
        statementPeriod: parsedResult.statementPeriod || '',
        summaryDetected: parsedResult.summaryDetected || null,
        transactions: sanitizedTransactions,
      },
    });
  } catch (err: any) {
    console.error('Error during transaction extraction:', err);
    res.status(500).json({
      error: err?.message || 'Failed to process document with OCR model. Please verify your document and try again.',
    });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
