import { useState } from 'react';
// import { styled } from 'styled-components';

function RoundDisplay({submitRound, round, roundAnswers, currentQuestion}) {

    const [answers, setAnswers] = useState(Array(round.questions.length).fill(''));

    const updateAnswer = (e, questionId) => {
        console.log('update answer')
        console.log(questionId);
        const updatedAnswers = [...answers];
        updatedAnswers[questionId] = e.target.value;
        setAnswers(updatedAnswers);
      };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      submitRound(answers);
    };

    const canSubmitRound = currentQuestion < round.questions.length-1;
    
  
    return (
        <div>
            {!roundAnswers && currentQuestion >= 0 && (
              <form onSubmit={handleSubmit}>
                {round.questions.slice(0, currentQuestion + 1).map((question, questionIndex) => (
                  <div key={questionIndex} className="form-group">
                    <label htmlFor={`question-${questionIndex}`}>
                      {question.question}
                    </label>
                    <input
                      type="text"
                      id={`question-${questionIndex}`}
                      className="form-control"
                      value={answers[questionIndex] || ''}
                      onChange={(e) => updateAnswer(e, questionIndex)}
                    />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" disabled={canSubmitRound}>Submit</button>
              </form>
            )}
            {roundAnswers && <div>Answers submitted, Waiting for next round</div>}

      </div>
    );
  }
  
  export default RoundDisplay;
  