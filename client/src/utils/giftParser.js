export function parseGIFT(text) {
  const questions = [];

  const blocks = text
    .split(/\n\s*\n/) // split blank line
    .map(b => b.trim())
    .filter(Boolean);

  for (let block of blocks) {
    let title = "";
    let question = "";
    let answers = [];

    // Extract ::title::
    const titleMatch = block.match(/::(.+?)::/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      block = block.replace(titleMatch[0], "");
    }

    // Extract question text
    const qMatch = block.match(/^(.*?){/s);
    if (!qMatch) continue;

    question = qMatch[1].trim();

    // Extract answer block
    const aMatch = block.match(/{(.*)}/s);
    if (!aMatch) continue;

    const answerPart = aMatch[1].trim();

    // True/False
    if (/^(T|F)$/i.test(answerPart)) {
      questions.push({
        type: "true-false",
        prompt: question,
        options: ["True", "False"],
        correctAnswer: /t/i.test(answerPart) ? "True" : "False",
      });
      continue;
    }

    // Matching — pairs like =A -> B
    if (answerPart.includes("=") && answerPart.includes("->")) {
      const pairs = answerPart
        .split("=")
        .slice(1)
        .map(item => item.split("->").map(i => i.trim()));

      questions.push({
        type: "matching",
        prompt: question,
        pairs: pairs.map(([left, right]) => ({ left, right })),
      });
      continue;
    }

    // MCQ or Short answer
    const parts = answerPart.split(/(?=[=~])/g);
    const opts = [];
    let correct = null;

    parts.forEach(p => {
      p = p.trim();
      if (!p) return;

      if (p.startsWith("=")) {
        correct = p.substring(1).trim();
        opts.push(correct);
      } else if (p.startsWith("~")) {
        opts.push(p.substring(1).trim());
      }
    });

    if (opts.length > 1) {
      questions.push({
        type: "mcq",
        prompt: question,
        options: opts,
        correctAnswer: correct,
      });
    } else {
      // Short-answer
      questions.push({
        type: "short-answer",
        prompt: question,
        correctAnswer: correct || opts[0] || "",
      });
    }
  }

  return questions;
}
