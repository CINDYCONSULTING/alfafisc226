export interface QCMOption {
  letter: string;
  text: string;
}

export interface QCM {
  id: string;
  index: number;
  question: string;
  options: QCMOption[];
  answer: string;
  justification: string;
}

export interface ParseError {
  inputLine: number;
  message: string;
}

export interface ParseResult {
  questions: QCM[];
  errors: ParseError[];
  totalParsed: number;
}

const QCM_HEADER = /^\s*qcm\s*(\d+)\s*[:：\-]\s*(.*)$/i;
const NUM_QUESTION = /^\s*(\d+)\s*[\.）\)]\s*(.*)$/;
const OPTION_LINE = /^\s*([A-Ea-e])\s*[\.）\)]\s*(.*)$/;
const ANSWER_LINE = /^\s*(?:réponse|reponse)\s*[:：]\s*([A-Ea-e])\s*$/i;
const JUSTIF_LINE = /^\s*(?:justification|justif)\s*[:：]\s*(.*)$/i;
const STRIP_ACCENTS = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function parseQCMText(raw: string): ParseResult {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const errors: ParseError[] = [];
  const questions: QCM[] = [];

  // Identify block boundaries: a new block starts at a "QCM n:" line OR a numbered question line ("1. ...")
  const blockStarts: { startIndex: number; startLine: number }[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (QCM_HEADER.test(trimmed)) {
      blockStarts.push({ startIndex: i, startLine: i + 1 });
    } else if (NUM_QUESTION.test(trimmed)) {
      // Only treat as block start if previous non-empty line isn't an option/answer/justif
      let prevIdx = i - 1;
      while (prevIdx >= 0 && lines[prevIdx].trim() === '') prevIdx--;
      const prev = prevIdx >= 0 ? lines[prevIdx].trim() : '';
      const prevIsOption = OPTION_LINE.test(prev);
      const prevIsAnswer = ANSWER_LINE.test(prev);
      const prevIsJustif = JUSTIF_LINE.test(prev);
      if (!prevIsOption && !prevIsAnswer && !prevIsJustif) {
        blockStarts.push({ startIndex: i, startLine: i + 1 });
      }
    }
  });

  if (blockStarts.length === 0) {
    return {
      questions: [],
      errors: [{ inputLine: 1, message: "Aucun QCM détecté. Format attendu : « QCM 1 : votre question » ou « 1. votre question »" }],
      totalParsed: 0,
    };
  }

  blockStarts.forEach((start, blockIdx) => {
    const startLine = start.startLine;
    const from = start.startIndex;
    const to = blockIdx + 1 < blockStarts.length ? blockStarts[blockIdx + 1].startIndex : lines.length;
    const block = lines.slice(from, to);

    let questionText = '';
    let options: QCMOption[] = [];
    let answer: string | null = null;
    let justification = '';
    let qcmNumber = blockIdx + 1;

    const headerMatch = block[0].trim().match(QCM_HEADER);
    const numMatch = block[0].trim().match(NUM_QUESTION);
    if (headerMatch) {
      qcmNumber = parseInt(headerMatch[1], 10);
      questionText = headerMatch[2].trim();
    } else if (numMatch) {
      qcmNumber = parseInt(numMatch[1], 10);
      questionText = numMatch[2].trim();
    }

    for (let i = 1; i < block.length; i++) {
      const trimmed = block[i].trim();
      if (!trimmed) continue;

      const optMatch = trimmed.match(OPTION_LINE);
      const ansMatch = trimmed.match(ANSWER_LINE);
      const justMatch = trimmed.match(JUSTIF_LINE);
      const stripped = STRIP_ACCENTS(trimmed.toLowerCase());
      const looksLikeAnswer = stripped.startsWith('reponse') || stripped.startsWith('réponse');
      const looksLikeJustif = stripped.startsWith('justification') || stripped.startsWith('justif');

      if (looksLikeAnswer || ansMatch) {
        const m = trimmed.match(/[:：]\s*([A-Ea-e])/);
        if (m) answer = m[1].toUpperCase();
      } else if (looksLikeJustif || justMatch) {
        const m = trimmed.match(/[:：]\s*(.*)$/);
        justification = m ? m[1].trim() : trimmed.replace(/^.*?(?:justification|justif)\s*/i, '').trim();
      } else if (optMatch) {
        const letter = optMatch[1].toUpperCase();
        const text = optMatch[2].trim();
        if (!options.find((o) => o.letter === letter)) options.push({ letter, text });
      } else if (justification) {
        justification = `${justification} ${trimmed}`;
      } else {
        questionText = `${questionText} ${trimmed}`.trim();
      }
    }

    if (!questionText) {
      errors.push({ inputLine: startLine, message: `Question ${qcmNumber}: texte de la question manquant` });
      return;
    }
    if (options.length < 2) {
      errors.push({ inputLine: startLine, message: `Question ${qcmNumber}: options A/B/C/D manquantes` });
      return;
    }
    if (!answer) {
      errors.push({ inputLine: startLine, message: `Question ${qcmNumber}: réponse (A/B/C/D) manquante` });
      return;
    }
    if (!options.find((o) => o.letter === answer)) {
      errors.push({ inputLine: startLine, message: `Question ${qcmNumber}: la réponse ${answer} n'existe pas dans les options` });
      return;
    }

    questions.push({
      id: `q-${qcmNumber}`,
      index: qcmNumber,
      question: questionText,
      options: options.sort((a, b) => a.letter.localeCompare(b.letter)),
      answer,
      justification: justification || 'Aucune justification fournie.',
    });
  });

  return { questions, errors, totalParsed: questions.length };
}

export const SAMPLE_QCM = `QCM 1 : Quel est le taux normal de TVA en France métropolitaine ?
A. 10 %
B. 20 %
C. 5,5 %
D. 2,1 %

Réponse : B
Justification : Le taux normal de TVA en France métropolitaine est fixé à 20 % depuis 2014.

QCM 2 : Quelle taxe concerne les plus-values immobilières des particuliers ?
A. La CGS
B. L'IFI
C. L'impôt sur le revenu au barème progressif
D. La TVA immobilière

Réponse : C
Justification : Depuis 2004, les plus-values immobilières des particuliers relèvent de l'impôt sur le revenu avec un système d'abattements pour durée de détention.

QCM 3 : À partir de quel seuil de patrimoine l'IFI est-il dû ?
A. 800 000 €
B. 1 000 000 €
C. 1 300 000 €
D. 1 500 000 €

Réponse : C
Justification : L'Impôt sur la Fortune Immobilière (IFI) est dû lorsque la valeur nette du patrimoine immobilier dépasse 1 300 000 € au 1er janvier de l'année.`;
