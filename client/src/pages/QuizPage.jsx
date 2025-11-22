// QuizPage
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    api.get(`quizzes/${id}`).then(r => setQuiz(r.data)).catch(() => {});
  }, [id]);

  if (!quiz) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold">{quiz.title}</h1>
      <div className="space-y-4 mt-4">
        {quiz.questions.map(q => (
          <div key={q.qid} className="p-3 bg-white rounded shadow">
            <div className="font-medium mb-2">{q.prompt}</div>
            {q.type === 'mcq' && q.options?.map((o, i) => (
              <div key={i} className="text-sm">• {o}</div>
            ))}
            {q.type !== 'mcq' && <div className="text-sm text-slate-600">Answer type: {q.type}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
